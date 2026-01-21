import { vi } from 'vitest';

// Mock HTMLCanvasElement methods with proper typing
const mockCanvas2DContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createPattern: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  globalAlpha: 1,
  lineWidth: 0,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: '',
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  globalCompositeOperation: 'source-over'
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvas2DContext as any);

// Mock toDataURL and toBlob with format-specific responses
HTMLCanvasElement.prototype.toDataURL = vi.fn((format?: string) => {
  if (format === 'image/jpeg') {
    return 'data:image/jpeg;base64,mock';
  }
  return 'data:image/png;base64,mock';
});
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback && callback(new Blob());
});

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 400,
  height: 200,
  top: 0,
  left: 0,
  bottom: 200,
  right: 400,
  x: 0,
  y: 0,
  toJSON: vi.fn()
}));

// Mock Touch and TouchEvent
global.Touch = vi.fn().mockImplementation((touchInitDict) => ({
  identifier: 0,
  target: null,
  clientX: touchInitDict?.clientX || 0,
  clientY: touchInitDict?.clientY || 0,
  pageX: touchInitDict?.pageX || 0,
  pageY: touchInitDict?.pageY || 0,
  screenX: touchInitDict?.screenX || 0,
  screenY: touchInitDict?.screenY || 0,
  radiusX: touchInitDict?.radiusX || 0,
  radiusY: touchInitDict?.radiusY || 0,
  rotationAngle: touchInitDict?.rotationAngle || 0,
  force: touchInitDict?.force || 1
}));

global.TouchEvent = vi.fn().mockImplementation((type, eventInitDict) => ({
  type,
  touches: eventInitDict?.touches || [],
  targetTouches: eventInitDict?.targetTouches || [],
  changedTouches: eventInitDict?.changedTouches || [],
  bubbles: eventInitDict?.bubbles || false,
  cancelable: eventInitDict?.cancelable || false,
  composed: eventInitDict?.composed || false,
  detail: eventInitDict?.detail || 0,
  view: eventInitDict?.view || window,
  sourceCapabilities: eventInitDict?.sourceCapabilities || null,
  which: eventInitDict?.which || 0,
  initEvent: vi.fn()
}));

// Mock MouseEvent
global.MouseEvent = vi.fn().mockImplementation((type, eventInitDict) => ({
  type,
  bubbles: eventInitDict?.bubbles || false,
  cancelable: eventInitDict?.cancelable || false,
  view: eventInitDict?.view || window,
  detail: eventInitDict?.detail || 0,
  screenX: eventInitDict?.screenX || 0,
  screenY: eventInitDict?.screenY || 0,
  clientX: eventInitDict?.clientX || 0,
  clientY: eventInitDict?.clientY || 0,
  ctrlKey: eventInitDict?.ctrlKey || false,
  shiftKey: eventInitDict?.shiftKey || false,
  altKey: eventInitDict?.altKey || false,
  metaKey: eventInitDict?.metaKey || false,
  button: eventInitDict?.button || 0,
  buttons: eventInitDict?.buttons || 0,
  relatedTarget: eventInitDict?.relatedTarget || null,
  region: eventInitDict?.region || null,
  initEvent: vi.fn()
}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Blob constructor
global.Blob = vi.fn().mockImplementation((parts, options) => ({
  parts,
  options,
  size: parts ? parts.join('').length : 0,
  type: options?.type || '',
  slice: vi.fn(),
  stream: vi.fn(),
  text: vi.fn().mockResolvedValue(''),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
}));

// Mock File constructor
global.File = vi.fn().mockImplementation((bits, name, options) => ({
  bits,
  name,
  options,
  size: bits ? bits.join('').length : 0,
  type: options?.type || '',
  lastModified: options?.lastModified || Date.now(),
  slice: vi.fn(),
  stream: vi.fn(),
  text: vi.fn().mockResolvedValue(''),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
}));

// Mock btoa and atob
global.btoa = vi.fn((str) => Buffer.from(str, 'binary').toString('base64'));
global.atob = vi.fn((b64) => Buffer.from(b64, 'base64').toString('binary'));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn(clearTimeout);

// Mock performance.now
Object.defineProperty(global.performance, 'now', {
  value: vi.fn(() => Date.now()),
  writable: true
});
