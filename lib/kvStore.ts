/**
 * Upstash Redis store for production persistence.
 *
 * Works with Vercel's Upstash integration (env vars set automatically when
 * you add the integration from the Vercel dashboard) or with manually set
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
 *
 * Redis key layout:
 *   feedback:entries   – list of JSON-encoded FeedbackEntry
 *   chat:interactions  – list of JSON-encoded ChatInteraction
 *   route:queries      – list of JSON-encoded RouteQuery
 *   room:searches      – list of JSON-encoded RoomSearch
 *   daily:{date}       – JSON-encoded DailyStats for that date
 *   pending:{ip}       – JSON-encoded PendingFeedbackEntry (TTL 24 h)
 */

import { Redis } from "@upstash/redis";
import type {
  ChatInteraction,
  FeedbackEntry,
  RouteQuery,
  RoomSearch,
  DailyStats,
} from "./analytics";
import type { PendingFeedbackEntry } from "./pendingFeedback";

// ---------------------------------------------------------------------------
// Singleton Redis client (lazy – only created when env vars exist)
// ---------------------------------------------------------------------------

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  _redis = new Redis({ url, token });
  return _redis;
}

/** Returns true when Redis env vars are configured (i.e. production). */
export function isKVAvailable(): boolean {
  return !!(
    (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export async function saveFeedback(entry: FeedbackEntry): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.lpush("feedback:entries", JSON.stringify(entry));
}

export async function getAllFeedback(): Promise<FeedbackEntry[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange<string>("feedback:entries", 0, -1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

// ---------------------------------------------------------------------------
// Chat interactions
// ---------------------------------------------------------------------------

export async function saveInteraction(
  interaction: ChatInteraction
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.lpush("chat:interactions", JSON.stringify(interaction));
}

export async function getAllInteractions(): Promise<ChatInteraction[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange<string>("chat:interactions", 0, -1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

export async function getRecentInteractions(
  limit: number
): Promise<ChatInteraction[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange<string>("chat:interactions", 0, limit - 1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

// ---------------------------------------------------------------------------
// Route queries
// ---------------------------------------------------------------------------

export async function saveRouteQuery(query: RouteQuery): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.lpush("route:queries", JSON.stringify(query));
}

export async function getAllRouteQueries(): Promise<RouteQuery[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange<string>("route:queries", 0, -1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

// ---------------------------------------------------------------------------
// Room searches
// ---------------------------------------------------------------------------

export async function saveRoomSearch(search: RoomSearch): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.lpush("room:searches", JSON.stringify(search));
}

export async function getAllRoomSearches(): Promise<RoomSearch[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange<string>("room:searches", 0, -1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

// ---------------------------------------------------------------------------
// Daily stats
// ---------------------------------------------------------------------------

export async function saveDailyStats(stats: DailyStats): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(`daily:${stats.date}`, JSON.stringify(stats));
}

export async function getDailyStats(date: string): Promise<DailyStats | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get<string>(`daily:${date}`);
  return raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
}

/** Get daily stats keys for the last N days. */
export async function getRecentDailyStats(
  days: number
): Promise<DailyStats[]> {
  const redis = getRedis();
  if (!redis) return [];

  const results: DailyStats[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const stats = await getDailyStats(dateStr);
    if (stats) results.push(stats);
  }
  return results.reverse(); // oldest first
}

// ---------------------------------------------------------------------------
// Pending feedback (TTL 24 hours)
// ---------------------------------------------------------------------------

export async function setPendingFeedbackKV(
  ip: string,
  entry: PendingFeedbackEntry
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(`pending:${ip}`, JSON.stringify(entry), { ex: 86400 });
}

export async function getPendingFeedbackKV(
  ip: string
): Promise<PendingFeedbackEntry | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get<string>(`pending:${ip}`);
  return raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
}

export async function clearPendingFeedbackKV(ip: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(`pending:${ip}`);
}
