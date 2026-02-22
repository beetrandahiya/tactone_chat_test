import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/analytics";

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

    // Validate ratings are 1-5
    const { accuracy, clarity, helpfulness } = ratings;
    for (const [key, val] of Object.entries({ accuracy, clarity, helpfulness })) {
      if (typeof val !== "number" || val < 1 || val > 5) {
        return NextResponse.json(
          { error: `Invalid rating for ${key}: must be 1-5` },
          { status: 400 }
        );
      }
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
