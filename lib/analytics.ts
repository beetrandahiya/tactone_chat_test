/**
 * Analytics logging and storage for TACTONE chatbot
 * Stores user interactions, navigation patterns, and usage metrics
 */

import fs from "fs";
import path from "path";

// ============ DATA TYPES ============

export interface ChatInteraction {
  id: string;
  timestamp: string;
  ipHash: string; // Hashed for privacy
  userMessage: string;
  assistantResponse?: string;
  navigationData?: {
    fromRoom: string | null;
    toRoom: string | null;
    roomType: string | null;
    pathFound: boolean;
    distance: number | null;
  };
  responseTime?: number; // milliseconds
  tokenCount?: number;
}

export interface RouteQuery {
  id: string;
  timestamp: string;
  fromRoom: string;
  toRoom: string;
  pathFound: boolean;
  distance: number;
}

export interface RoomSearch {
  id: string;
  timestamp: string;
  roomId: string;
  roomType: string;
  found: boolean;
}

export interface DailyStats {
  date: string;
  totalInteractions: number;
  uniqueUsers: number;
  navigationQueries: number;
  roomSearches: number;
  avgResponseTime: number;
}

export interface AnalyticsData {
  interactions: ChatInteraction[];
  routeQueries: RouteQuery[];
  roomSearches: RoomSearch[];
  dailyStats: DailyStats[];
  lastUpdated: string;
}

// ============ FILE STORAGE ============

const DATA_DIR = path.join(process.cwd(), "data");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");

// Check if we're in a read-only environment (like Vercel serverless)
function isReadOnlyEnvironment(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function ensureDataDir(): void {
  if (isReadOnlyEnvironment()) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.warn("Could not create data directory:", error);
  }
}

function getEmptyAnalytics(): AnalyticsData {
  return {
    interactions: [],
    routeQueries: [],
    roomSearches: [],
    dailyStats: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function loadAnalytics(): AnalyticsData {
  try {
    ensureDataDir();
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    // In production/serverless, file system access may fail - return empty data
    console.warn("Could not load analytics (this is expected in serverless environments):", error);
  }
  return getEmptyAnalytics();
}

export function saveAnalytics(data: AnalyticsData): void {
  // Skip saving in read-only environments
  if (isReadOnlyEnvironment()) {
    console.log("Skipping analytics save in read-only environment");
    return;
  }
  try {
    ensureDataDir();
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.warn("Could not save analytics:", error);
  }
}

// ============ HASHING ============

function hashIP(ip: string): string {
  // Simple hash for privacy - not cryptographically secure but sufficient for analytics
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

// ============ LOGGING FUNCTIONS ============

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function logInteraction(params: {
  ip: string;
  userMessage: string;
  assistantResponse?: string;
  navigationData?: ChatInteraction["navigationData"];
  responseTime?: number;
  tokenCount?: number;
}): ChatInteraction {
  const interaction: ChatInteraction = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ipHash: hashIP(params.ip),
    userMessage: params.userMessage,
    assistantResponse: params.assistantResponse,
    navigationData: params.navigationData,
    responseTime: params.responseTime,
    tokenCount: params.tokenCount,
  };

  const analytics = loadAnalytics();
  analytics.interactions.push(interaction);
  
  // Update daily stats
  updateDailyStats(analytics, interaction);
  
  saveAnalytics(analytics);
  return interaction;
}

export function logRouteQuery(params: {
  fromRoom: string;
  toRoom: string;
  pathFound: boolean;
  distance: number;
}): RouteQuery {
  const query: RouteQuery = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...params,
  };

  const analytics = loadAnalytics();
  analytics.routeQueries.push(query);
  saveAnalytics(analytics);
  return query;
}

export function logRoomSearch(params: {
  roomId: string;
  roomType: string;
  found: boolean;
}): RoomSearch {
  const search: RoomSearch = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...params,
  };

  const analytics = loadAnalytics();
  analytics.roomSearches.push(search);
  saveAnalytics(analytics);
  return search;
}

function updateDailyStats(analytics: AnalyticsData, interaction: ChatInteraction): void {
  const date = interaction.timestamp.split("T")[0];
  let dayStats = analytics.dailyStats.find((s) => s.date === date);

  if (!dayStats) {
    dayStats = {
      date,
      totalInteractions: 0,
      uniqueUsers: 0,
      navigationQueries: 0,
      roomSearches: 0,
      avgResponseTime: 0,
    };
    analytics.dailyStats.push(dayStats);
  }

  dayStats.totalInteractions++;
  
  // Count unique users for this day
  const todayInteractions = analytics.interactions.filter(
    (i) => i.timestamp.startsWith(date)
  );
  const uniqueIPs = new Set(todayInteractions.map((i) => i.ipHash));
  dayStats.uniqueUsers = uniqueIPs.size;

  if (interaction.navigationData?.fromRoom && interaction.navigationData?.toRoom) {
    dayStats.navigationQueries++;
  }

  if (interaction.navigationData?.roomType) {
    dayStats.roomSearches++;
  }

  // Update average response time
  const todayWithResponseTime = todayInteractions.filter((i) => i.responseTime);
  if (todayWithResponseTime.length > 0) {
    const totalTime = todayWithResponseTime.reduce((sum, i) => sum + (i.responseTime || 0), 0);
    dayStats.avgResponseTime = Math.round(totalTime / todayWithResponseTime.length);
  }
}

// ============ ANALYTICS QUERIES ============

export function getAnalyticsSummary() {
  const analytics = loadAnalytics();
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter interactions by time period
  const last24hInteractions = analytics.interactions.filter(
    (i) => new Date(i.timestamp) > last24h
  );
  const last7dInteractions = analytics.interactions.filter(
    (i) => new Date(i.timestamp) > last7d
  );
  const last30dInteractions = analytics.interactions.filter(
    (i) => new Date(i.timestamp) > last30d
  );

  // Calculate metrics
  return {
    overview: {
      totalInteractions: analytics.interactions.length,
      totalRouteQueries: analytics.routeQueries.length,
      totalRoomSearches: analytics.roomSearches.length,
      uniqueUsers: new Set(analytics.interactions.map((i) => i.ipHash)).size,
    },
    last24h: {
      interactions: last24hInteractions.length,
      uniqueUsers: new Set(last24hInteractions.map((i) => i.ipHash)).size,
    },
    last7d: {
      interactions: last7dInteractions.length,
      uniqueUsers: new Set(last7dInteractions.map((i) => i.ipHash)).size,
    },
    last30d: {
      interactions: last30dInteractions.length,
      uniqueUsers: new Set(last30dInteractions.map((i) => i.ipHash)).size,
    },
    dailyStats: analytics.dailyStats.slice(-30), // Last 30 days
    lastUpdated: analytics.lastUpdated,
  };
}

export function getTopRoutes(limit: number = 10) {
  const analytics = loadAnalytics();
  const routeCounts = new Map<string, number>();

  for (const query of analytics.routeQueries) {
    const key = `${query.fromRoom} → ${query.toRoom}`;
    routeCounts.set(key, (routeCounts.get(key) || 0) + 1);
  }

  return Array.from(routeCounts.entries())
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopRoomSearches(limit: number = 10) {
  const analytics = loadAnalytics();
  const roomCounts = new Map<string, number>();

  for (const search of analytics.roomSearches) {
    roomCounts.set(search.roomId, (roomCounts.get(search.roomId) || 0) + 1);
  }

  return Array.from(roomCounts.entries())
    .map(([roomId, count]) => ({ roomId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopQuestions(limit: number = 10) {
  const analytics = loadAnalytics();
  const questionCounts = new Map<string, number>();

  for (const interaction of analytics.interactions) {
    // Normalize questions for grouping
    const normalized = interaction.userMessage.toLowerCase().trim();
    questionCounts.set(normalized, (questionCounts.get(normalized) || 0) + 1);
  }

  return Array.from(questionCounts.entries())
    .map(([question, count]) => ({ question, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getQuestionCategories() {
  const analytics = loadAnalytics();
  const categories = {
    navigation: 0,
    roomSearch: 0,
    facilities: 0,
    general: 0,
  };

  for (const interaction of analytics.interactions) {
    const msg = interaction.userMessage.toLowerCase();
    
    if (msg.includes("from") && msg.includes("to") || msg.includes("how do i get") || msg.includes("directions")) {
      categories.navigation++;
    } else if (msg.includes("where is") || msg.includes("find") || msg.match(/5[A-K]\d{3}/i)) {
      categories.roomSearch++;
    } else if (msg.includes("wc") || msg.includes("toilet") || msg.includes("lift") || msg.includes("stairs")) {
      categories.facilities++;
    } else {
      categories.general++;
    }
  }

  return categories;
}

export function getHourlyDistribution() {
  const analytics = loadAnalytics();
  const hours = new Array(24).fill(0);

  for (const interaction of analytics.interactions) {
    const hour = new Date(interaction.timestamp).getHours();
    hours[hour]++;
  }

  return hours.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    count,
  }));
}

export function getRecentInteractions(limit: number = 50) {
  const analytics = loadAnalytics();
  return analytics.interactions
    .slice(-limit)
    .reverse()
    .map((i) => ({
      id: i.id,
      timestamp: i.timestamp,
      userMessage: i.userMessage.substring(0, 100) + (i.userMessage.length > 100 ? "..." : ""),
      hasNavigation: !!i.navigationData?.fromRoom,
      responseTime: i.responseTime,
    }));
}

export function getRoomTypeDistribution() {
  const analytics = loadAnalytics();
  const typeCounts = new Map<string, number>();

  for (const search of analytics.roomSearches) {
    typeCounts.set(search.roomType, (typeCounts.get(search.roomType) || 0) + 1);
  }

  return Array.from(typeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function getZoneDistribution() {
  const analytics = loadAnalytics();
  const zones = { A: 0, B: 0, C: 0, K: 0, Other: 0 };

  const allRooms = [
    ...analytics.routeQueries.flatMap((q) => [q.fromRoom, q.toRoom]),
    ...analytics.roomSearches.map((s) => s.roomId),
  ];

  for (const room of allRooms) {
    const match = room.match(/5([A-K])\d{3}/i);
    if (match) {
      const zone = match[1].toUpperCase() as keyof typeof zones;
      if (zone in zones) {
        zones[zone]++;
      } else {
        zones.Other++;
      }
    }
  }

  return Object.entries(zones).map(([zone, count]) => ({ zone, count }));
}
