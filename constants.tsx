
import { TriangleState } from './types';

export const INITIAL_SIDE = 10;
export const INITIAL_ANGLE = 60;

export const DEFAULT_TRIANGLE: TriangleState = {
  vertices: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 5, y: -8.66 }
  ],
  sides: [10, 10, 10],
  angles: [60, 60, 60]
};

export const MIN_ZOOM = 5;
export const MAX_ZOOM = 500;
export const BASE_PIXELS_PER_UNIT = 30;
