export interface SignaturePoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface SignatureStroke {
  points: SignaturePoint[];
  color: string;
  width: number;
  timestamp: number;
}

export interface SignatureData {
  strokes: SignatureStroke[];
  width: number;
  height: number;
  backgroundColor: string;
  timestamp: number;
}

export interface SignatureOptions {
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  lineWidth?: number;
  smoothing?: number;
  pressure?: boolean;
}

export interface SignatureExportOptions {
  format?: 'png' | 'jpeg' | 'svg' | 'json';
  quality?: number;
  backgroundColor?: string;
}

export type SignatureEvent = 'start' | 'draw' | 'end' | 'clear';

export interface SignatureCallbacks {
  onStart?: (point: SignaturePoint) => void;
  onDraw?: (point: SignaturePoint) => void;
  onEnd?: (data: SignatureData) => void;
  onClear?: () => void;
}
