import { NextRequest } from "next/server";
import {
  getAnalyticsSummary,
  getTopRoutes,
  getTopRoomSearches,
  getTopQuestions,
  getQuestionCategories,
  getHourlyDistribution,
  getRecentInteractions,
  getRoomTypeDistribution,
  getZoneDistribution,
} from "@/lib/analytics";

// Simple admin authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tactone-admin-2026";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;
  
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") return false;
  
  return token === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const summary = getAnalyticsSummary();
    const topRoutes = getTopRoutes(10);
    const topRoomSearches = getTopRoomSearches(10);
    const topQuestions = getTopQuestions(15);
    const questionCategories = getQuestionCategories();
    const hourlyDistribution = getHourlyDistribution();
    const recentInteractions = getRecentInteractions(50);
    const roomTypeDistribution = getRoomTypeDistribution();
    const zoneDistribution = getZoneDistribution();

    return new Response(
      JSON.stringify({
        summary,
        topRoutes,
        topRoomSearches,
        topQuestions,
        questionCategories,
        hourlyDistribution,
        recentInteractions,
        roomTypeDistribution,
        zoneDistribution,
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Analytics API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
