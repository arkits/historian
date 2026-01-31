/**
 * YouTube Data API v3 integration: token refresh and fetching liked videos.
 * Used with Google OAuth account linking (providerId "google").
 */

const YOUTUBE_READONLY_SCOPE =
  "https://www.googleapis.com/auth/youtube.readonly";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface GoogleAccountRow {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  scope: string | null;
}

/** Check if the account has YouTube scope (readonly or broader). */
export function hasYoutubeScope(scope: string | null): boolean {
  if (!scope) return false;
  const scopes = scope.split(/\s+/);
  return (
    scopes.includes(YOUTUBE_READONLY_SCOPE) ||
    scopes.includes("https://www.googleapis.com/auth/youtube.force-ssl") ||
    scopes.includes("https://www.googleapis.com/auth/youtube")
  );
}

/** Consider token expired if it expires in the next 5 minutes. */
function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;
  return now >= expires - bufferMs;
}

export interface RefreshedToken {
  accessToken: string;
  expiresAt: string;
}

/**
 * Refresh Google OAuth access token using refresh_token.
 * Returns new access token and expiry; caller should persist to DB.
 */
export async function refreshGoogleAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<RefreshedToken> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token refresh failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  return { accessToken: data.access_token, expiresAt };
}

/**
 * Get a valid access token for the given Google account: use existing if not expired,
 * otherwise refresh and return. Does not persist; caller must update DB after refresh.
 */
export async function getValidAccessToken(
  account: GoogleAccountRow,
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; account: GoogleAccountRow }> {
  const token = account.accessToken;
  const hasValidToken =
    token &&
    account.refreshToken &&
    !isTokenExpired(account.accessTokenExpiresAt);

  if (hasValidToken) {
    return { accessToken: token, account };
  }

  if (!account.refreshToken) {
    throw new Error("No refresh token; user must re-link Google/YouTube");
  }

  const refreshed = await refreshGoogleAccessToken(
    account.refreshToken,
    clientId,
    clientSecret,
  );
  return {
    accessToken: refreshed.accessToken,
    account: {
      ...account,
      accessToken: refreshed.accessToken,
      accessTokenExpiresAt: refreshed.expiresAt,
    },
  };
}

// --- YouTube API response types (minimal) ---

interface YouTubeSnippet {
  publishedAt: string;
  title: string;
  description: string;
  thumbnails?: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
}

interface YouTubeVideoItem {
  id: string;
  snippet?: YouTubeSnippet;
}

interface YouTubeVideosResponse {
  items?: YouTubeVideoItem[];
  nextPageToken?: string;
}

export interface HistoryLikeItem {
  timelineTime: string;
  type: string;
  contentId: string;
  content: Record<string, unknown>;
  searchContent?: string;
}

/**
 * Fetch all liked videos for the authenticated user (paginated).
 * Maps each to the history item shape used by importHistory.
 */
export async function fetchLikedVideos(accessToken: string): Promise<HistoryLikeItem[]> {
  const results: HistoryLikeItem[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet,contentDetails,statistics",
      myRating: "like",
      maxResults: "50",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const url = `${YOUTUBE_API_BASE}/videos?${params.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouTube API error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as YouTubeVideosResponse;
    const items = data.items ?? [];

    for (const video of items) {
      const snippet = video.snippet;
      const publishedAt = snippet?.publishedAt ?? new Date().toISOString();
      const title = snippet?.title ?? "";
      const description = snippet?.description ?? "";
      const thumbnails = snippet?.thumbnails;
      const thumbnail =
        thumbnails?.high?.url ??
        thumbnails?.medium?.url ??
        thumbnails?.default?.url ??
        "";

      results.push({
        timelineTime: publishedAt,
        type: "youtube_like",
        contentId: video.id,
        content: {
          url: `https://www.youtube.com/watch?v=${video.id}`,
          title,
          description,
          thumbnail,
          domain: "youtube.com",
        },
        searchContent: [title, description].filter(Boolean).join(" ") || undefined,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return results;
}
