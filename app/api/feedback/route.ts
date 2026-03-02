import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/analytics";
import { clearPendingFeedback } from "@/lib/pendingFeedback";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { messageId, ratings, customFeedback } = body;

    // Validate required fields
    if (!messageId || !ratings) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate ratings are 0-5 (0 means not rated)
    const { accuracy, clarity, helpfulness } = ratings;
    for (const [key, val] of Object.entries({ accuracy, clarity, helpfulness })) {
      if (typeof val !== "number" || val < 0 || val > 5) {
        return NextResponse.json(
          { error: `Invalid rating for ${key}: must be 0-5` },
          { status: 400 }
        );
      }
    }

    // Ensure at least one rating is provided
    if (accuracy === 0 && clarity === 0 && helpfulness === 0) {
      return NextResponse.json(
        { error: "At least one rating must be provided" },
        { status: 400 }
      );
    }

    // Get IP for hashing
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    logFeedback({
      ip,
      messageId,
      ratings: { accuracy, clarity, helpfulness },
      customFeedback: typeof customFeedback === "string" ? customFeedback.slice(0, 500) : "",
    });

    // Clear the pending-feedback flag for this IP so it won't re-appear on next visit
    clearPendingFeedback(ip);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
