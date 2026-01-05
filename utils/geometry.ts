
import { Point, TriangleState } from '../types';

export const degToRad = (deg: number) => (deg * Math.PI) / 180;
export const radToDeg = (rad: number) => (rad * 180) / Math.PI;

export const getDistance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const isValidTriangle = (a: number, b: number, c: number): boolean => {
  return a + b > c && a + c > b && b + c > a && a > 0 && b > 0 && c > 0;
};

// Calculate angles using Law of Cosines
export const calculateAnglesFromSides = (a: number, b: number, c: number): number[] => {
  const alpha = radToDeg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
  const beta = radToDeg(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
  const gamma = 180 - alpha - beta;
  return [alpha, beta, gamma];
};

// Law of Cosines: find side c given a, b and angle C
export const solveSAS = (a: number, b: number, gamma: number): number => {
  const gammaRad = degToRad(gamma);
  return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(gammaRad));
};

// Generate vertices based on side lengths for visualization
// A at origin (mostly), B on X-axis
export const generateVertices = (a: number, b: number, c: number): Point[] => {
  const alpha = Math.acos((b * b + c * c - a * a) / (2 * b * c));
  const pA: Point = { x: 0, y: 0 };
  const pB: Point = { x: c, y: 0 };
  const pC: Point = { x: b * Math.cos(alpha), y: -b * Math.sin(alpha) }; // -y for standard screen coordinate space
  return [pA, pB, pC];
};

// Get the centroid of the triangle to center the view
export const getCentroid = (pts: Point[]): Point => {
  return {
    x: (pts[0].x + pts[1].x + pts[2].x) / 3,
    y: (pts[0].y + pts[1].y + pts[2].y) / 3,
  };
};

// Recalculate full state from vertices
export const updateStateFromVertices = (vertices: Point[]): TriangleState => {
  const c = getDistance(vertices[0], vertices[1]); // AB
  const b = getDistance(vertices[0], vertices[2]); // AC
  const a = getDistance(vertices[1], vertices[2]); // BC
  
  const angles = calculateAnglesFromSides(a, b, c);
  return { vertices, sides: [a, b, c], angles };
};
