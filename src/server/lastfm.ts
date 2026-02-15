import { createHash } from "crypto";

const LASTFM_API_BASE = "https://ws.audioscrobbler.com/2.0/";

export interface HistoryLikeItem {
  timelineTime: string;
  type: string;
  contentId: string;
  content: Record<string, unknown>;
  searchContent?: string;
}

interface LastfmErrorResponse {
  error?: number;
  message?: string;
}

interface LastfmTokenResponse extends LastfmErrorResponse {
  token?: string;
}

interface LastfmSessionResponse extends LastfmErrorResponse {
  session?: {
    name?: string;
    key?: string;
    subscriber?: string;
  };
}

interface LastfmTrackImage {
  size?: string;
  "#text"?: string;
}

interface LastfmTrack {
  name?: string;
  url?: string;
  mbid?: string;
  artist?: {
    "#text"?: string;
    mbid?: string;
  };
  album?: {
    "#text"?: string;
  };
  image?: LastfmTrackImage[];
  date?: {
    uts?: string;
    "#text"?: string;
  };
  "@attr"?: {
    nowplaying?: string;
  };
}

interface LastfmRecentTracksResponse extends LastfmErrorResponse {
  recenttracks?: {
    track?: LastfmTrack[];
    "@attr"?: {
      page?: string;
      totalPages?: string;
      user?: string;
    };
  };
}

export interface LastfmSession {
  username: string;
  sessionKey: string;
  subscriber?: string;
}

function createApiSignature(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const signatureBase = Object.entries(params)
    .filter(([key]) => key !== "format" && key !== "callback" && key !== "cb")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value}`)
    .join("")
    .concat(apiSecret);

  return createHash("md5").update(signatureBase, "utf8").digest("hex");
}

function buildUrl(params: Record<string, string>): string {
  const searchParams = new URLSearchParams({
    ...params,
    format: "json",
  });
  return `${LASTFM_API_BASE}?${searchParams.toString()}`;
}

function getLargestImage(images?: LastfmTrackImage[]): string {
  if (!images || images.length === 0) return "";
  for (let i = images.length - 1; i >= 0; i -= 1) {
    const url = images[i]?.["#text"];
    if (url) return url;
  }
  return "";
}

function parseLastfmError(data: LastfmErrorResponse, fallback: string): Error {
  if (typeof data?.message === "string" && data.message.trim()) {
    return new Error(`Last.fm API error: ${data.message}`);
  }
  return new Error(fallback);
}

export async function getLastfmAuthToken(
  apiKey: string,
  apiSecret: string,
): Promise<string> {
  const params = {
    method: "auth.getToken",
    api_key: apiKey,
  };
  const apiSig = createApiSignature(params, apiSecret);
  const res = await fetch(
    buildUrl({
      ...params,
      api_sig: apiSig,
    }),
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Last.fm token request failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as LastfmTokenResponse;
  if (data.error) {
    throw parseLastfmError(data, "Last.fm token request failed");
  }
  if (!data.token) {
    throw new Error("Last.fm token response missing token");
  }
  return data.token;
}

export async function getLastfmSession(
  apiKey: string,
  apiSecret: string,
  token: string,
): Promise<LastfmSession> {
  const params = {
    method: "auth.getSession",
    api_key: apiKey,
    token,
  };
  const apiSig = createApiSignature(params, apiSecret);
  const res = await fetch(
    buildUrl({
      ...params,
      api_sig: apiSig,
    }),
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Last.fm session request failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as LastfmSessionResponse;
  if (data.error) {
    throw parseLastfmError(data, "Last.fm session request failed");
  }
  const session = data.session;
  if (!session?.name || !session?.key) {
    throw new Error("Last.fm session response missing session details");
  }

  return {
    username: session.name,
    sessionKey: session.key,
    subscriber: session.subscriber,
  };
}

export interface LastfmHistoryOptions {
  apiKey: string;
  apiSecret: string;
  username: string;
  sessionKey?: string | null;
  from?: number;
  maxPages?: number;
  limit?: number;
}

export async function fetchRecentTracks(
  options: LastfmHistoryOptions,
): Promise<HistoryLikeItem[]> {
  const {
    apiKey,
    apiSecret,
    username,
    sessionKey,
    from,
    maxPages = 10,
    limit = 200,
  } = options;
  const results: HistoryLikeItem[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const params: Record<string, string> = {
      method: "user.getrecenttracks",
      user: username,
      api_key: apiKey,
      limit: String(limit),
      page: String(page),
    };
    if (from) {
      params.from = String(from);
    }
    if (sessionKey) {
      params.sk = sessionKey;
      params.api_sig = createApiSignature(params, apiSecret);
    }

    const res = await fetch(buildUrl(params));
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Last.fm API error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as LastfmRecentTracksResponse;
    if (data.error) {
      throw parseLastfmError(data, "Last.fm recent tracks request failed");
    }

    const tracks = data.recenttracks?.track ?? [];
    for (const track of tracks) {
      if (track["@attr"]?.nowplaying === "true") continue;
      const uts = track.date?.uts;
      if (!uts) continue;
      const timestamp = Number(uts);
      if (Number.isNaN(timestamp)) continue;

      const timelineTime = new Date(timestamp * 1000).toISOString();
      const title = track.name ?? "";
      const artist = track.artist?.["#text"] ?? "";
      const album = track.album?.["#text"] ?? "";
      const thumbnail = getLargestImage(track.image);
      const url = track.url ?? "";
      const contentId =
        track.mbid ||
        url ||
        [title, artist, String(timestamp)].filter(Boolean).join("-");
      const descriptionParts = [];
      if (artist) descriptionParts.push(artist);
      if (album) descriptionParts.push(album);
      const description = descriptionParts.join(" • ");
      const searchContent = [title, artist, album].filter(Boolean).join(" ");

      results.push({
        timelineTime,
        type: "lastfm_scrobble",
        contentId,
        content: {
          url,
          title,
          description,
          thumbnail,
          domain: "last.fm",
          artist,
          album,
          mbid: track.mbid || undefined,
          contentType: "track",
        },
        searchContent: searchContent || undefined,
      });
    }

    const attr = data.recenttracks?.["@attr"];
    totalPages = attr?.totalPages ? Number(attr.totalPages) : 1;
    if (Number.isNaN(totalPages) || totalPages < 1) {
      totalPages = 1;
    }
    page += 1;
  } while (page <= totalPages && page <= maxPages);

  return results;
}

export function buildLastfmAuthUrl(
  apiKey: string,
  token: string,
  callbackURL: string,
): string {
  const params = new URLSearchParams({
    api_key: apiKey,
    token,
    cb: callbackURL,
  });
  return `https://www.last.fm/api/auth/?${params.toString()}`;
}
