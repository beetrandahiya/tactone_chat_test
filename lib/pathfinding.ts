/**
 * Deterministic pathfinding system using Dijkstra's algorithm
 * for HSLU Floor 5 building navigation
 */

import buildingData from "../HSLU_floor5.json";

// Types based on the JSON structure
interface Node {
  id: string;
  label_raw: string;
  room_type: string;
  area_m2: number | null;
  style: { fillcolor: string };
}

interface Edge {
  source: string;
  target: string;
  bidirectional: boolean;
  label_raw: string;
  distance_m: number;
  fire_rating: string | null;
  style: { color: string; penwidth: number; linestyle: string };
}

interface PathResult {
  found: boolean;
  path: string[];
  pathDetails: NodeInfo[];
  totalDistance: number;
  steps: NavigationStep[];
}

interface NodeInfo {
  id: string;
  roomType: string;
  area: number | null;
}

interface NavigationStep {
  from: string;
  fromType: string;
  to: string;
  toType: string;
  distance: number;
}

// Build adjacency list from the graph
function buildAdjacencyList(): Map<string, Map<string, number>> {
  const adjacency = new Map<string, Map<string, number>>();
  const edges = buildingData.graph.edges as Edge[];
  const nodes = buildingData.graph.nodes as Node[];

  // Initialize all nodes
  for (const node of nodes) {
    adjacency.set(node.id, new Map());
  }

  // Add edges
  for (const edge of edges) {
    const distance = edge.distance_m;

    // Add forward edge
    adjacency.get(edge.source)?.set(edge.target, distance);

    // Add reverse edge if bidirectional
    if (edge.bidirectional) {
      adjacency.get(edge.target)?.set(edge.source, distance);
    }
  }

  return adjacency;
}

// Get node info by ID
function getNodeInfo(nodeId: string): NodeInfo | null {
  const nodes = buildingData.graph.nodes as Node[];
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  return {
    id: node.id,
    roomType: node.room_type,
    area: node.area_m2,
  };
}

// Dijkstra's algorithm for shortest path
export function findShortestPath(startId: string, endId: string): PathResult {
  const adjacency = buildAdjacencyList();
  const nodes = buildingData.graph.nodes as Node[];

  // Normalize IDs (case-insensitive lookup)
  const normalizedStart = nodes.find(
    (n) => n.id.toLowerCase() === startId.toLowerCase()
  )?.id;
  const normalizedEnd = nodes.find(
    (n) => n.id.toLowerCase() === endId.toLowerCase()
  )?.id;

  if (!normalizedStart || !normalizedEnd) {
    return {
      found: false,
      path: [],
      pathDetails: [],
      totalDistance: 0,
      steps: [],
    };
  }

  // Dijkstra's algorithm
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  // Initialize
  for (const node of nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }
  distances.set(normalizedStart, 0);

  while (unvisited.size > 0) {
    // Find minimum distance node
    let minNode: string | null = null;
    let minDistance = Infinity;
    const unvisitedArray = Array.from(unvisited);
    for (const nodeId of unvisitedArray) {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        minNode = nodeId;
      }
    }

    if (minNode === null || minDistance === Infinity) break;
    if (minNode === normalizedEnd) break;

    unvisited.delete(minNode);

    // Update neighbors
    const neighbors = adjacency.get(minNode);
    if (neighbors) {
      const neighborsArray = Array.from(neighbors.entries());
      for (const [neighbor, edgeDistance] of neighborsArray) {
        if (unvisited.has(neighbor)) {
          const newDistance = (distances.get(minNode) ?? 0) + edgeDistance;
          if (newDistance < (distances.get(neighbor) ?? Infinity)) {
            distances.set(neighbor, newDistance);
            previous.set(neighbor, minNode);
          }
        }
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = normalizedEnd;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  // Check if path was found
  if (path[0] !== normalizedStart) {
    return {
      found: false,
      path: [],
      pathDetails: [],
      totalDistance: 0,
      steps: [],
    };
  }

  // Build path details and steps
  const pathDetails: NodeInfo[] = [];
  const steps: NavigationStep[] = [];

  for (let i = 0; i < path.length; i++) {
    const nodeInfo = getNodeInfo(path[i]);
    if (nodeInfo) pathDetails.push(nodeInfo);

    if (i < path.length - 1) {
      const fromInfo = getNodeInfo(path[i]);
      const toInfo = getNodeInfo(path[i + 1]);
      const distance = adjacency.get(path[i])?.get(path[i + 1]) ?? 0;

      steps.push({
        from: path[i],
        fromType: fromInfo?.roomType ?? "Unknown",
        to: path[i + 1],
        toType: toInfo?.roomType ?? "Unknown",
        distance,
      });
    }
  }

  return {
    found: true,
    path,
    pathDetails,
    totalDistance: distances.get(normalizedEnd) ?? 0,
    steps,
  };
}

// Find room by partial name or type
export function findRoom(query: string): NodeInfo[] {
  const nodes = buildingData.graph.nodes as Node[];
  const queryLower = query.toLowerCase();

  return nodes
    .filter(
      (n) =>
        n.id.toLowerCase().includes(queryLower) ||
        n.room_type.toLowerCase().includes(queryLower)
    )
    .map((n) => ({
      id: n.id,
      roomType: n.room_type,
      area: n.area_m2,
    }));
}

// Get all rooms of a specific type
export function getRoomsByType(roomType: string): NodeInfo[] {
  const nodes = buildingData.graph.nodes as Node[];
  const typeLower = roomType.toLowerCase();

  return nodes
    .filter((n) => n.room_type.toLowerCase().includes(typeLower))
    .map((n) => ({
      id: n.id,
      roomType: n.room_type,
      area: n.area_m2,
    }));
}

// Get all available room types
export function getAllRoomTypes(): string[] {
  const nodes = buildingData.graph.nodes as Node[];
  const types = new Set<string>();
  for (const node of nodes) {
    types.add(node.room_type);
  }
  return Array.from(types).sort();
}

// Get all rooms
export function getAllRooms(): NodeInfo[] {
  const nodes = buildingData.graph.nodes as Node[];
  return nodes.map((n) => ({
    id: n.id,
    roomType: n.room_type,
    area: n.area_m2,
  }));
}

// Find nearest room of a type from a starting point
export function findNearestOfType(
  startId: string,
  roomType: string
): PathResult | null {
  const targetRooms = getRoomsByType(roomType);
  if (targetRooms.length === 0) return null;

  let bestPath: PathResult | null = null;

  for (const room of targetRooms) {
    const path = findShortestPath(startId, room.id);
    if (path.found) {
      if (!bestPath || path.totalDistance < bestPath.totalDistance) {
        bestPath = path;
      }
    }
  }

  return bestPath;
}

// Format path result for AI consumption
export function formatPathForAI(result: PathResult): string {
  if (!result.found) {
    return "PATH_NOT_FOUND: No valid path exists between these locations.";
  }

  let output = `PATH_FOUND:\n`;
  output += `- Total distance: ${result.totalDistance} meters\n`;
  output += `- Number of steps: ${result.steps.length}\n\n`;
  output += `ROUTE:\n`;

  for (let i = 0; i < result.steps.length; i++) {
    const step = result.steps[i];
    output += `${i + 1}. From ${step.from} (${step.fromType}) → ${step.to} (${step.toType}) - ${step.distance}m\n`;
  }

  output += `\nROOMS PASSED:\n`;
  for (const room of result.pathDetails) {
    output += `- ${room.id}: ${room.roomType}${room.area ? ` (${room.area}m²)` : ""}\n`;
  }

  return output;
}

// Get building summary for context
export function getBuildingSummary(): string {
  const rooms = getAllRooms();
  const types = getAllRoomTypes();

  let summary = `HSLU Floor 5 Building Summary:\n`;
  summary += `- Total rooms: ${rooms.length}\n`;
  summary += `- Room types: ${types.join(", ")}\n\n`;

  summary += `Room counts by type:\n`;
  for (const type of types) {
    const count = rooms.filter((r) => r.roomType === type).length;
    summary += `- ${type}: ${count}\n`;
  }

  return summary;
}
