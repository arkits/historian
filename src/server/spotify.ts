/**
 * Spotify Web API integration: token refresh and fetching recently played tracks.
 * Used with Spotify OAuth account linking (providerId "spotify").
 */

const SPOTIFY_RECENTLY_PLAYED_SCOPE = "user-read-recently-played";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export interface SpotifyAccountRow {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  scope: string | null;
}

/** Check if the account has the Spotify recently-played scope. */
export function hasSpotifyScope(scope: string | null): boolean {
  if (!scope) return false;
  const scopes = scope.split(/\s+/);
  return scopes.includes(SPOTIFY_RECENTLY_PLAYED_SCOPE);
}

/** Consider token expired if it expires in the next 5 minutes. */
function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;
  return now >= expires - bufferMs;
}

export interface RefreshedSpotifyToken {
  accessToken: string;
  expiresAt: string;
  refreshToken?: string;
}

/**
 * Refresh Spotify OAuth access token using refresh_token.
 * Returns new access token and expiry; may include a new refresh token.
 */
export async function refreshSpotifyAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<RefreshedSpotifyToken> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token refresh failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  return {
    accessToken: data.access_token,
    expiresAt,
    refreshToken: data.refresh_token,
  };
}

/**
 * Get a valid access token for the given Spotify account: use existing if not expired,
 * otherwise refresh and return. Does not persist; caller must update DB after refresh.
 */
export async function getValidSpotifyAccessToken(
  account: SpotifyAccountRow,
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; account: SpotifyAccountRow }> {
  const token = account.accessToken;
  const hasValidToken =
    token && account.refreshToken && !isTokenExpired(account.accessTokenExpiresAt);

  if (hasValidToken) {
    return { accessToken: token, account };
  }

  if (!account.refreshToken) {
    throw new Error("No refresh token; user must re-link Spotify");
  }

  const refreshed = await refreshSpotifyAccessToken(
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
      refreshToken: refreshed.refreshToken ?? account.refreshToken,
    },
  };
}

// --- Spotify API response types (minimal) ---

interface SpotifyImage {
  url: string;
  width?: number;
  height?: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images?: SpotifyImage[];
  release_date?: string;
}

interface SpotifyTrack {
  id: string | null;
  name: string;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
  uri: string;
  external_urls?: {
    spotify?: string;
  };
  artists?: SpotifyArtist[];
  album?: SpotifyAlbum;
}

interface SpotifyRecentlyPlayedItem {
  played_at: string;
  track: SpotifyTrack | null;
  context?: {
    type?: string;
    uri?: string;
  } | null;
}

interface SpotifyRecentlyPlayedResponse {
  items?: SpotifyRecentlyPlayedItem[];
  next?: string | null;
}

export interface HistoryLikeItem {
  timelineTime: string;
  type: string;
  contentId: string;
  content: Record<string, unknown>;
  searchContent?: string;
}

/**
 * Fetch all recently played tracks for the authenticated user (paginated).
 * Maps each to the history item shape used by importHistory.
 */
export async function fetchRecentlyPlayed(
  accessToken: string,
): Promise<HistoryLikeItem[]> {
  const results: HistoryLikeItem[] = [];
  let nextUrl: string | null = `${SPOTIFY_API_BASE}/me/player/recently-played?limit=50`;

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Spotify API error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as SpotifyRecentlyPlayedResponse;
    const items = data.items ?? [];

    for (const entry of items) {
      const track = entry.track;
      if (!track) continue;
      const playedAt = entry.played_at ?? new Date().toISOString();
      const artists = (track.artists ?? []).map((artist) => artist.name);
      const album = track.album?.name ?? "";
      const thumbnail = track.album?.images?.[0]?.url ?? "";
      const url =
        track.external_urls?.spotify ??
        (track.id ? `https://open.spotify.com/track/${track.id}` : "");
      const descriptionParts = [];
      if (artists.length > 0) descriptionParts.push(artists.join(", "));
      if (album) descriptionParts.push(album);
      const description = descriptionParts.join(" • ");
      const contentId = track.id ?? track.uri ?? `${track.name}-${playedAt}`;
      const searchContent = [track.name, artists.join(" "), album]
        .filter(Boolean)
        .join(" ")
        .trim();

      results.push({
        timelineTime: playedAt,
        type: "spotify_play",
        contentId,
        content: {
          url,
          title: track.name,
          description,
          thumbnail,
          domain: "spotify.com",
          artists,
          album,
          durationMs: track.duration_ms,
          explicit: track.explicit,
          previewUrl: track.preview_url,
          uri: track.uri,
          contentType: "track",
        },
        searchContent: searchContent || undefined,
      });
    }

    nextUrl = data.next ?? null;
  }

  return results;
}
