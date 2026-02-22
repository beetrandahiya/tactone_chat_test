/**
 * Multi-floor pathfinding system using Dijkstra's algorithm
 * for HSLU Perron Building navigation across all floors
 */

import floor0Data from "../floordata/HSLU_floorA00.json";
import floor1Data from "../floordata/HSLU_floor1.json";
import floor2Data from "../floordata/HSLU_floor2.json";
import floor3Data from "../floordata/HSLU_floorA03.json";
import floor4Data from "../floordata/HSLU_floor4.json";
import floor5Data from "../floordata/HSLU_floor5.json";

// ============================================================
// Types
// ============================================================

interface NormalizedNode {
  id: string;
  name: string;
  roomType: string;
  area: number | null;
  floor: string;
  floorLabel: string;
}

interface NormalizedEdge {
  source: string;
  target: string;
  bidirectional: boolean;
  distance: number;
}

interface PathResult {
  found: boolean;
  path: string[];
  pathDetails: NodeInfo[];
  totalDistance: number;
  steps: NavigationStep[];
  crossesFloors: boolean;
  floorsTraversed: string[];
}

export interface NodeInfo {
  id: string;
  roomType: string;
  area: number | null;
  floor: string;
  floorLabel: string;
}

interface NavigationStep {
  from: string;
  fromType: string;
  fromFloor: string;
  to: string;
  toType: string;
  toFloor: string;
  distance: number;
  isFloorChange: boolean;
}

// ============================================================
// Floor metadata
// ============================================================

interface FloorInfo {
  id: string;
  floorNum: string;
  label: string;
  prefix: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const FLOORS: FloorInfo[] = [
  { id: "A00", floorNum: "0", label: "Ground Floor (EG)", prefix: "0", data: floor0Data },
  { id: "A01", floorNum: "1", label: "Floor 1 (OG1)",     prefix: "1", data: floor1Data },
  { id: "A02", floorNum: "2", label: "Floor 2 (OG2)",     prefix: "2", data: floor2Data },
  { id: "A03", floorNum: "3", label: "Floor 3 (OG3)",     prefix: "3", data: floor3Data },
  { id: "4",   floorNum: "4", label: "Floor 4 (OG4)",     prefix: "4", data: floor4Data },
  { id: "5",   floorNum: "5", label: "Floor 5 (OG5)",     prefix: "5", data: floor5Data },
];

// ============================================================
// Normalize heterogeneous JSON formats
// ============================================================

function normalizeNodes(floorInfo: FloorInfo): NormalizedNode[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawNodes = floorInfo.data.graph.nodes as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawNodes.map((n: any) => {
    let name = n.name || "";
    if (!name && n.label_raw) {
      const parts = n.label_raw.split(/[\n]|(?:\s+-\s+)/);
      name = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    }
    if (!name && n.label) {
      const spaceIdx = n.label.indexOf(" ");
      name = spaceIdx >= 0 ? n.label.substring(spaceIdx + 1).trim() : n.label;
    }

    return {
      id: n.id,
      name,
      roomType: n.room_type || "Unknown",
      area: n.area_m2 ?? null,
      floor: floorInfo.floorNum,
      floorLabel: floorInfo.label,
    };
  });
}

function normalizeEdges(floorInfo: FloorInfo): NormalizedEdge[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawEdges = floorInfo.data.graph.edges as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawEdges.map((e: any) => ({
    source: e.source,
    target: e.target,
    bidirectional: e.bidirectional !== false,
    distance: e.distance_m ?? 10,
  }));
}

// ============================================================
// Build unified multi-floor graph
// ============================================================

let allNodes: NormalizedNode[] = [];
let nodeMap: Map<string, NormalizedNode> = new Map();
let adjacency: Map<string, Map<string, number>> = new Map();

// Stairwell/lift suffixes that connect vertically between floors
const STAIRWELL_SUFFIXES = ["K041", "K121", "K191", "K262"];
const LIFT_VESTIBULE_SUFFIXES = ["K042", "K122", "K192", "K271"];

const STAIR_FLOOR_CHANGE_DISTANCE = 15; // meters walking-equivalent per floor
const LIFT_FLOOR_CHANGE_DISTANCE = 10;

function buildInterFloorEdges(): NormalizedEdge[] {
  const interFloorEdges: NormalizedEdge[] = [];
  const floorPrefixes = FLOORS.map(f => f.prefix).sort();

  for (let i = 0; i < floorPrefixes.length - 1; i++) {
    const lowerPrefix = floorPrefixes[i];
    const upperPrefix = floorPrefixes[i + 1];

    for (const suffix of STAIRWELL_SUFFIXES) {
      const lowerNodeId = `${lowerPrefix}${suffix}`;
      const upperNodeId = `${upperPrefix}${suffix}`;
      if (nodeMap.has(lowerNodeId) && nodeMap.has(upperNodeId)) {
        interFloorEdges.push({
          source: lowerNodeId,
          target: upperNodeId,
          bidirectional: true,
          distance: STAIR_FLOOR_CHANGE_DISTANCE,
        });
      }
    }

    for (const suffix of LIFT_VESTIBULE_SUFFIXES) {
      const lowerNodeId = `${lowerPrefix}${suffix}`;
      const upperNodeId = `${upperPrefix}${suffix}`;
      if (nodeMap.has(lowerNodeId) && nodeMap.has(upperNodeId)) {
        interFloorEdges.push({
          source: lowerNodeId,
          target: upperNodeId,
          bidirectional: true,
          distance: LIFT_FLOOR_CHANGE_DISTANCE,
        });
      }
    }
  }

  return interFloorEdges;
}

function initializeGraph() {
  allNodes = [];
  nodeMap = new Map();
  adjacency = new Map();

  // 1. Normalize all nodes
  for (const floorInfo of FLOORS) {
    const nodes = normalizeNodes(floorInfo);
    for (const node of nodes) {
      allNodes.push(node);
      nodeMap.set(node.id, node);
      adjacency.set(node.id, new Map());
    }
  }

  // 2. Add intra-floor edges
  for (const floorInfo of FLOORS) {
    const edges = normalizeEdges(floorInfo);
    for (const edge of edges) {
      if (adjacency.has(edge.source) && adjacency.has(edge.target)) {
        adjacency.get(edge.source)!.set(edge.target, edge.distance);
        if (edge.bidirectional) {
          adjacency.get(edge.target)!.set(edge.source, edge.distance);
        }
      }
    }
  }

  // 3. Add inter-floor edges
  const interFloorEdges = buildInterFloorEdges();
  for (const edge of interFloorEdges) {
    adjacency.get(edge.source)!.set(edge.target, edge.distance);
    if (edge.bidirectional) {
      adjacency.get(edge.target)!.set(edge.source, edge.distance);
    }
  }
}

// Initialize on module load
initializeGraph();

// ============================================================
// Pathfinding: Dijkstra's Algorithm (multi-floor)
// ============================================================

export function findShortestPath(startId: string, endId: string): PathResult {
  const normalizedStart = allNodes.find(
    (n) => n.id.toLowerCase() === startId.toLowerCase()
  )?.id;
  const normalizedEnd = allNodes.find(
    (n) => n.id.toLowerCase() === endId.toLowerCase()
  )?.id;

  if (!normalizedStart || !normalizedEnd) {
    return {
      found: false,
      path: [],
      pathDetails: [],
      totalDistance: 0,
      steps: [],
      crossesFloors: false,
      floorsTraversed: [],
    };
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const node of allNodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }
  distances.set(normalizedStart, 0);

  while (unvisited.size > 0) {
    let minNode: string | null = null;
    let minDistance = Infinity;
    const unvisitedArr = Array.from(unvisited);
    for (const nodeId of unvisitedArr) {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        minNode = nodeId;
      }
    }

    if (minNode === null || minDistance === Infinity) break;
    if (minNode === normalizedEnd) break;

    unvisited.delete(minNode);

    const neighbors = adjacency.get(minNode);
    if (neighbors) {
      const neighborsArr = Array.from(neighbors.entries());
      for (const [neighbor, edgeDistance] of neighborsArr) {
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

  if (path[0] !== normalizedStart) {
    return {
      found: false,
      path: [],
      pathDetails: [],
      totalDistance: 0,
      steps: [],
      crossesFloors: false,
      floorsTraversed: [],
    };
  }

  // Build path details and steps
  const pathDetails: NodeInfo[] = [];
  const steps: NavigationStep[] = [];
  const floorsSet = new Set<string>();

  for (let i = 0; i < path.length; i++) {
    const node = nodeMap.get(path[i]);
    if (node) {
      pathDetails.push({
        id: node.id,
        roomType: node.roomType,
        area: node.area,
        floor: node.floor,
        floorLabel: node.floorLabel,
      });
      floorsSet.add(node.floor);
    }

    if (i < path.length - 1) {
      const fromNode = nodeMap.get(path[i]);
      const toNode = nodeMap.get(path[i + 1]);
      const distance = adjacency.get(path[i])?.get(path[i + 1]) ?? 0;
      const isFloorChange = (fromNode?.floor ?? "") !== (toNode?.floor ?? "");

      steps.push({
        from: path[i],
        fromType: fromNode?.roomType ?? "Unknown",
        fromFloor: fromNode?.floorLabel ?? "Unknown",
        to: path[i + 1],
        toType: toNode?.roomType ?? "Unknown",
        toFloor: toNode?.floorLabel ?? "Unknown",
        distance,
        isFloorChange,
      });
    }
  }

  const floorsTraversed = Array.from(floorsSet).sort();

  return {
    found: true,
    path,
    pathDetails,
    totalDistance: distances.get(normalizedEnd) ?? 0,
    steps,
    crossesFloors: floorsTraversed.length > 1,
    floorsTraversed,
  };
}

// ============================================================
// Room search & lookup
// ============================================================

export function findRoom(query: string): NodeInfo[] {
  const queryLower = query.toLowerCase();
  return allNodes
    .filter(
      (n) =>
        n.id.toLowerCase().includes(queryLower) ||
        n.name.toLowerCase().includes(queryLower) ||
        n.roomType.toLowerCase().includes(queryLower)
    )
    .map((n) => ({
      id: n.id,
      roomType: n.roomType,
      area: n.area,
      floor: n.floor,
      floorLabel: n.floorLabel,
    }));
}

export function getRoomsByType(roomType: string): NodeInfo[] {
  const typeLower = roomType.toLowerCase();
  return allNodes
    .filter((n) => n.roomType.toLowerCase().includes(typeLower))
    .map((n) => ({
      id: n.id,
      roomType: n.roomType,
      area: n.area,
      floor: n.floor,
      floorLabel: n.floorLabel,
    }));
}

export function getRoomsByTypeOnFloor(roomType: string, floor: string): NodeInfo[] {
  const typeLower = roomType.toLowerCase();
  return allNodes
    .filter(
      (n) => n.roomType.toLowerCase().includes(typeLower) && n.floor === floor
    )
    .map((n) => ({
      id: n.id,
      roomType: n.roomType,
      area: n.area,
      floor: n.floor,
      floorLabel: n.floorLabel,
    }));
}

export function getAllRoomTypes(): string[] {
  const types = new Set<string>();
  for (const node of allNodes) {
    types.add(node.roomType);
  }
  return Array.from(types).sort();
}

export function getRoomsOnFloor(floor: string): NodeInfo[] {
  return allNodes
    .filter((n) => n.floor === floor)
    .map((n) => ({
      id: n.id,
      roomType: n.roomType,
      area: n.area,
      floor: n.floor,
      floorLabel: n.floorLabel,
    }));
}

export function getAllRooms(): NodeInfo[] {
  return allNodes.map((n) => ({
    id: n.id,
    roomType: n.roomType,
    area: n.area,
    floor: n.floor,
    floorLabel: n.floorLabel,
  }));
}

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

export function findNearestOfTypeSameFloor(
  startId: string,
  roomType: string
): PathResult | null {
  const startNode = nodeMap.get(startId.toUpperCase()) ?? nodeMap.get(startId);
  if (!startNode) return findNearestOfType(startId, roomType);

  const sameFloorRooms = getRoomsByTypeOnFloor(roomType, startNode.floor);
  let bestPath: PathResult | null = null;
  for (const room of sameFloorRooms) {
    const path = findShortestPath(startId, room.id);
    if (path.found) {
      if (!bestPath || path.totalDistance < bestPath.totalDistance) {
        bestPath = path;
      }
    }
  }
  if (bestPath) return bestPath;
  return findNearestOfType(startId, roomType);
}

export function getFloorForRoom(roomId: string): string | null {
  const node = nodeMap.get(roomId.toUpperCase()) ?? nodeMap.get(roomId);
  return node?.floor ?? null;
}

export function getFloorLabel(floorNum: string): string {
  const floor = FLOORS.find(f => f.floorNum === floorNum);
  return floor?.label ?? `Floor ${floorNum}`;
}

export function getAllFloors(): { floorNum: string; label: string }[] {
  return FLOORS.map(f => ({ floorNum: f.floorNum, label: f.label }));
}

// ============================================================
// Format path for AI consumption
// ============================================================

export function formatPathForAI(result: PathResult): string {
  if (!result.found) {
    return "PATH_NOT_FOUND: No valid path exists between these locations.";
  }

  let output = `PATH_FOUND:\n`;
  output += `- Total distance: ${Math.round(result.totalDistance)} meters\n`;
  output += `- Number of steps: ${result.steps.length}\n`;
  output += `- Crosses floors: ${result.crossesFloors ? "YES" : "No"}\n`;

  if (result.crossesFloors) {
    output += `- Floors traversed: ${result.floorsTraversed.map(f => getFloorLabel(f)).join(" → ")}\n`;
  }

  output += `\nROUTE:\n`;
  for (let i = 0; i < result.steps.length; i++) {
    const step = result.steps[i];
    if (step.isFloorChange) {
      output += `${i + 1}. ⬆️ FLOOR CHANGE: ${step.from} (${step.fromType}, ${step.fromFloor}) → ${step.to} (${step.toType}, ${step.toFloor}) - take stairs/lift\n`;
    } else {
      output += `${i + 1}. ${step.from} (${step.fromType}) → ${step.to} (${step.toType}) - ${step.distance}m\n`;
    }
  }

  output += `\nROOMS PASSED:\n`;
  for (const room of result.pathDetails) {
    output += `- ${room.id}: ${room.roomType}${room.area ? ` (${room.area}m²)` : ""} [${room.floorLabel}]\n`;
  }

  return output;
}

// ============================================================
// Building summary for AI context
// ============================================================

export function getBuildingSummary(): string {
  const rooms = getAllRooms();
  const types = getAllRoomTypes();

  let summary = `HSLU Perron Building Summary (All Floors):\n`;
  summary += `- Total rooms across all floors: ${rooms.length}\n`;
  summary += `- Floors: ${FLOORS.map(f => f.label).join(", ")}\n\n`;

  for (const floor of FLOORS) {
    const floorRooms = rooms.filter(r => r.floor === floor.floorNum);
    summary += `${floor.label}: ${floorRooms.length} rooms\n`;
  }

  summary += `\nRoom types: ${types.join(", ")}\n\n`;

  summary += `Room counts by type (top 15):\n`;
  const typeCounts = types.map(t => ({
    type: t,
    count: rooms.filter(r => r.roomType === t).length,
  }));
  typeCounts.sort((a, b) => b.count - a.count);
  for (const tc of typeCounts.slice(0, 15)) {
    summary += `- ${tc.type}: ${tc.count}\n`;
  }

  return summary;
}
