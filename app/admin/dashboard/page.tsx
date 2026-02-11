"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  MessageSquare,
  Navigation,
  Search,
  Clock,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Activity,
  MapPin,
  HelpCircle,
} from "lucide-react";

// Types for analytics data
interface AnalyticsData {
  summary: {
    overview: {
      totalInteractions: number;
      totalRouteQueries: number;
      totalRoomSearches: number;
      uniqueUsers: number;
    };
    last24h: { interactions: number; uniqueUsers: number };
    last7d: { interactions: number; uniqueUsers: number };
    last30d: { interactions: number; uniqueUsers: number };
    dailyStats: Array<{
      date: string;
      totalInteractions: number;
      uniqueUsers: number;
      navigationQueries: number;
      roomSearches: number;
      avgResponseTime: number;
    }>;
    lastUpdated: string;
  };
  topRoutes: Array<{ route: string; count: number }>;
  topRoomSearches: Array<{ roomId: string; count: number }>;
  topQuestions: Array<{ question: string; count: number }>;
  questionCategories: {
    navigation: number;
    roomSearch: number;
    facilities: number;
    general: number;
  };
  hourlyDistribution: Array<{ hour: string; count: number }>;
  recentInteractions: Array<{
    id: string;
    timestamp: string;
    userMessage: string;
    hasNavigation: boolean;
    responseTime?: number;
  }>;
  roomTypeDistribution: Array<{ type: string; count: number }>;
  zoneDistribution: Array<{ zone: string; count: number }>;
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "routes" | "activity">("overview");
  const router = useRouter();

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
      return;
    }

    try {
      const response = await fetch("/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        router.push("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    router.push("/admin");
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Chat</span>
            </Link>
            <div className="h-6 w-px bg-gray-700" />
            <h1 className="text-xl font-bold text-white">TACTONE Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "questions", label: "Questions", icon: HelpCircle },
            { id: "routes", label: "Routes & Rooms", icon: MapPin },
            { id: "activity", label: "Activity Log", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {activeTab === "overview" && data && <OverviewTab data={data} />}
        {activeTab === "questions" && data && <QuestionsTab data={data} />}
        {activeTab === "routes" && data && <RoutesTab data={data} />}
        {activeTab === "activity" && data && <ActivityTab data={data} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        Last updated: {data?.summary.lastUpdated ? new Date(data.summary.lastUpdated).toLocaleString() : "Never"}
      </footer>
    </div>
  );
}

// ============ TAB COMPONENTS ============

function OverviewTab({ data }: { data: AnalyticsData }) {
  const stats = [
    {
      label: "Total Interactions",
      value: data.summary.overview.totalInteractions,
      icon: MessageSquare,
      color: "bg-blue-500",
      delta: data.summary.last24h.interactions,
      deltaLabel: "last 24h",
    },
    {
      label: "Unique Users",
      value: data.summary.overview.uniqueUsers,
      icon: Users,
      color: "bg-purple-500",
      delta: data.summary.last24h.uniqueUsers,
      deltaLabel: "last 24h",
    },
    {
      label: "Route Queries",
      value: data.summary.overview.totalRouteQueries,
      icon: Navigation,
      color: "bg-green-500",
    },
    {
      label: "Room Searches",
      value: data.summary.overview.totalRoomSearches,
      icon: Search,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.color}/20`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace("bg-", "text-")}`} />
              </div>
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
            {stat.delta !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                +{stat.delta} {stat.deltaLabel}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Interactions Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Interactions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.summary.dailyStats}>
                <defs>
                  <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en", { month: "short", day: "numeric" })}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="totalInteractions"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorInteractions)"
                  name="Interactions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question Categories Pie Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Question Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(data.questionCategories).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {Object.keys(data.questionCategories).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Hourly Usage Distribution</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Top Questions */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Questions Asked</h3>
        <div className="space-y-3">
          {data.topQuestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions recorded yet</p>
          ) : (
            data.topQuestions.map((q, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600/20 text-primary-400 rounded-full flex items-center justify-center font-semibold text-sm">
                  {i + 1}
                </span>
                <p className="flex-1 text-gray-300 truncate">{q.question}</p>
                <span className="flex-shrink-0 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm font-medium">
                  {q.count}x
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Question Categories Bar Chart */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Question Types Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Object.entries(data.questionCategories).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function RoutesTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-green-400" />
            Most Requested Routes
          </h3>
          <div className="space-y-3">
            {data.topRoutes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No routes recorded yet</p>
            ) : (
              data.topRoutes.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-600/20 text-green-400 rounded text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 font-mono text-sm">{r.route}</span>
                  </div>
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm font-medium">
                    {r.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Room Searches */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-400" />
            Most Searched Rooms
          </h3>
          <div className="space-y-3">
            {data.topRoomSearches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No room searches recorded yet</p>
            ) : (
              data.topRoomSearches.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-amber-600/20 text-amber-400 rounded text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 font-mono">{r.roomId}</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-600/20 text-amber-400 rounded text-sm font-medium">
                    {r.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Zone Distribution */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Zone Popularity</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.zoneDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Queries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-gray-400">
            <strong className="text-white">Zone A:</strong> Learning areas
          </div>
          <div className="text-gray-400">
            <strong className="text-white">Zone B:</strong> WCs, group rooms
          </div>
          <div className="text-gray-400">
            <strong className="text-white">Zone C:</strong> Classrooms
          </div>
          <div className="text-gray-400">
            <strong className="text-white">Zone K:</strong> Utilities
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Recent Interactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Question</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {data.recentInteractions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No interactions recorded yet
                  </td>
                </tr>
              ) : (
                data.recentInteractions.map((interaction) => (
                  <tr key={interaction.id} className="text-gray-300">
                    <td className="py-3 pr-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(interaction.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 max-w-md truncate">
                      {interaction.userMessage}
                    </td>
                    <td className="py-3 pr-4">
                      {interaction.hasNavigation ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600/20 text-green-400 rounded text-xs">
                          <Navigation className="w-3 h-3" />
                          Navigation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">
                          <MessageSquare className="w-3 h-3" />
                          General
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-sm">
                      {interaction.responseTime ? (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          {interaction.responseTime}ms
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
