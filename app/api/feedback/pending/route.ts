import { NextRequest, NextResponse } from "next/server";
import { getPendingFeedback, clearPendingFeedback } from "@/lib/pendingFeedback";

/**
 * GET /api/feedback/pending
 *
 * Returns any pending (un-submitted) feedback request for the caller's IP.
 * The client calls this on page load so that feedback popups survive page
 * refreshes / returning visits.
 *
 * Query params:
 *   ?dismiss=true  — clears the pending entry without submitting feedback
 */
export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Allow the client to dismiss without submitting
  if (req.nextUrl.searchParams.get("dismiss") === "true") {
    clearPendingFeedback(ip);
    return NextResponse.json({ pending: false });
  }

  const entry = getPendingFeedback(ip);

  if (!entry) {
    return NextResponse.json({ pending: false });
  }

  return NextResponse.json({
    pending: true,
    feedbackId: entry.feedbackId,
    assistantPreview: entry.assistantPreview,
    createdAt: entry.createdAt,
  });
}
