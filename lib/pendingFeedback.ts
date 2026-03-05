/**
 * Server-side store for pending feedback requests.
 *
 * When the chat API returns navigation directions to an IP, we record that the
 * user "owes" feedback.  The client can query GET /api/feedback/pending on load
 * to check whether it should show the feedback popup immediately — even on a
 * fresh page load / returning visit.
 *
 * In production (when Upstash env vars are set) we use Redis so data survives
 * across serverless cold starts.  Locally we fall back to an in-memory Map.
 */

import {
  isKVAvailable,
  setPendingFeedbackKV,
  getPendingFeedbackKV,
  clearPendingFeedbackKV,
} from "./kvStore";

export interface PendingFeedbackEntry {
  /** Unique ID the client can use as the messageId when submitting feedback */
  feedbackId: string;
  /** ISO timestamp of the navigation response */
  createdAt: string;
  /** First 200 chars of the assistant response (for context in the popup) */
  assistantPreview: string;
}

/**
 * Map from IP → latest pending feedback entry.
 * We only keep the **most recent** pending feedback per IP — if the user
 * triggered multiple nav responses without rating, only the last one matters.
 * (In-memory fallback for local dev.)
 */
const pendingStore = new Map<string, PendingFeedbackEntry>();

/** Record that an IP now has a pending feedback request. */
export function setPendingFeedback(
  ip: string,
  entry: PendingFeedbackEntry
): void {
  pendingStore.set(ip, entry);

  if (isKVAvailable()) {
    setPendingFeedbackKV(ip, entry).catch((err) =>
      console.error("KV setPendingFeedback error:", err)
    );
  }
}

/** Retrieve the pending feedback entry for an IP (if any). */
export async function getPendingFeedback(
  ip: string
): Promise<PendingFeedbackEntry | null> {
  // Prefer KV in production
  if (isKVAvailable()) {
    const entry = await getPendingFeedbackKV(ip);
    if (entry) return entry;
  }
  return pendingStore.get(ip) ?? null;
}

/** Clear the pending feedback for an IP (called after feedback is submitted or dismissed). */
export function clearPendingFeedback(ip: string): void {
  pendingStore.delete(ip);

  if (isKVAvailable()) {
    clearPendingFeedbackKV(ip).catch((err) =>
      console.error("KV clearPendingFeedback error:", err)
    );
  }
}
