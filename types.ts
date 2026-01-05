
export interface Point {
  x: number;
  y: number;
}

export interface TriangleState {
  vertices: Point[]; // A, B, C
  sides: number[];    // a (BC), b (AC), c (AB)
  angles: number[];   // α (A), β (B), γ (C)
}

export type InputType = 'side' | 'angle';

export interface HistoryEntry {
  type: InputType;
  index: number; // 0, 1, 2
  value: number;
}

export enum CalculationMode {
  INTERACTIVE = 'INTERACTIVE',
  STRUCTURED = 'STRUCTURED'
}

export enum StructuredType {
  SAS = '边角边',
  ASA = '角边角'
}

export enum ColorTheme {
  STANDARD = 'STANDARD',
  DEUTERANOPIA = 'DEUTERANOPIA', // Red-Green
  TRITANOPIA = 'TRITANOPIA'      // Blue-Yellow
}

export enum ThemeMode {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}
