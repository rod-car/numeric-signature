import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useSignature } from '../src/composables/useSignature';
import { SignatureCanvas } from '../src/utils/signature-canvas';
import type { SignatureData } from '../src/types/signature';

// Mock SignatureCanvas with proper implementation
vi.mock('../src/utils/signature-canvas', () => ({
  SignatureCanvas: vi.fn().mockImplementation(() => ({
    clear: vi.fn(),
    undo: vi.fn(),
    getData: vi.fn().mockReturnValue({
      strokes: [],
      width: 400,
      height: 200,
      backgroundColor: '#ffffff',
      timestamp: Date.now()
    }),
    setData: vi.fn(),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    toBlob: vi.fn().mockResolvedValue(new Blob()),
    updateOptions: vi.fn(),
    isEmpty: vi.fn().mockReturnValue(true),
    getPointFromEvent: vi.fn().mockReturnValue({ x: 50, y: 50 }),
    destroy: vi.fn()
  }))
}));

describe('useSignature', () => {
  let canvasRef: any;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 400;
    mockCanvas.height = 200;
    
    // Create ref
    canvasRef = ref(null);
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { isDrawing, isEmpty, signatureData } = useSignature(canvasRef);
      
      expect(isDrawing.value).toBe(false);
      expect(isEmpty.value).toBe(true);
      expect(signatureData.value).toBe(null);
    });

    it('should initialize with custom options', () => {
      const options = {
        width: 600,
        height: 300,
        color: '#ff0000',
        lineWidth: 3
      };
      
      canvasRef.value = mockCanvas;
      const { isDrawing, isEmpty } = useSignature(canvasRef, options);
      
      expect(isDrawing.value).toBe(false);
      expect(isEmpty.value).toBe(true);
    });
  });

  describe('Canvas operations', () => {
    beforeEach(() => {
      canvasRef.value = mockCanvas;
    });

    it('should provide clear function', () => {
      const { clear } = useSignature(canvasRef);
      
      expect(typeof clear).toBe('function');
    });

    it('should provide undo function', () => {
      const { undo } = useSignature(canvasRef);
      
      expect(typeof undo).toBe('function');
    });

    it('should provide getData function', () => {
      const { getData } = useSignature(canvasRef);
      
      expect(typeof getData).toBe('function');
    });

    it('should provide setData function', () => {
      const { setData } = useSignature(canvasRef);
      
      expect(typeof setData).toBe('function');
    });
  });

  describe('Export functionality', () => {
    beforeEach(() => {
      canvasRef.value = mockCanvas;
    });

    it('should provide toDataURL function', () => {
      const { toDataURL } = useSignature(canvasRef);
      
      expect(typeof toDataURL).toBe('function');
    });

    it('should provide toBlob function', () => {
      const { toBlob } = useSignature(canvasRef);
      
      expect(typeof toBlob).toBe('function');
    });
  });

  describe('Options management', () => {
    beforeEach(() => {
      canvasRef.value = mockCanvas;
    });

    it('should provide updateOptions function', () => {
      const { updateOptions } = useSignature(canvasRef);
      
      expect(typeof updateOptions).toBe('function');
    });
  });

  describe('Event handling', () => {
    beforeEach(() => {
      canvasRef.value = mockCanvas;
    });

    it('should provide on function', () => {
      const { on } = useSignature(canvasRef);
      
      expect(typeof on).toBe('function');
    });
  });

  describe('Error handling', () => {
    it('should handle null canvas reference', () => {
      canvasRef.value = null;
      
      const { isDrawing, isEmpty, signatureData } = useSignature(canvasRef);
      
      expect(isDrawing.value).toBe(false);
      expect(isEmpty.value).toBe(true);
      expect(signatureData.value).toBe(null);
    });
  });

  describe('Reactive properties', () => {
    beforeEach(() => {
      canvasRef.value = mockCanvas;
    });

    it('should provide isDrawing ref', () => {
      const { isDrawing } = useSignature(canvasRef);
      
      expect(isDrawing.value).toBe(false);
    });

    it('should provide isEmpty ref', () => {
      const { isEmpty } = useSignature(canvasRef);
      
      expect(isEmpty.value).toBe(true);
    });

    it('should provide signatureData ref', () => {
      const { signatureData } = useSignature(canvasRef);
      
      expect(signatureData.value).toBe(null);
    });
  });
});
