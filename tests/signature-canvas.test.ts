import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SignatureCanvas } from '../src/utils/signature-canvas';
import type { SignatureData } from '../src/types/signature';

describe('SignatureCanvas', () => {
  let canvas: HTMLCanvasElement;
  let signatureCanvas: SignatureCanvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    signatureCanvas = new SignatureCanvas(canvas);
  });

  afterEach(() => {
    signatureCanvas.destroy();
  });

  describe('Initialization', () => {
    it('should create a signature canvas with default options', () => {
      expect(signatureCanvas).toBeDefined();
      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(200);
    });

    it('should create a signature canvas with custom options', () => {
      const customCanvas = document.createElement('canvas');
      const customSignature = new SignatureCanvas(customCanvas, {
        width: 600,
        height: 300,
        color: '#ff0000',
        lineWidth: 3
      });

      expect(customCanvas.width).toBe(600);
      expect(customCanvas.height).toBe(300);
      customSignature.destroy();
    });

    it('should throw error when canvas context is not available', () => {
      const invalidCanvas = document.createElement('div') as any;
      expect(() => new SignatureCanvas(invalidCanvas)).toThrow('Unable to get 2D context from canvas');
    });
  });

  describe('Drawing functionality', () => {
    it('should start with empty signature', () => {
      expect(signatureCanvas.isEmpty()).toBe(true);
    });

    it('should handle mouse events correctly', () => {
      const rect = canvas.getBoundingClientRect();
      
      // Simulate mouse down
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseDownEvent);

      // Simulate mouse move
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseMoveEvent);

      // Simulate mouse up
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseUpEvent);

      expect(signatureCanvas.isEmpty()).toBe(false);
    });

    it('should handle touch events correctly', () => {
      const rect = canvas.getBoundingClientRect();
      
      // Simulate touch start
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{
          clientX: rect.left + 50,
          clientY: rect.top + 50,
          pageX: rect.left + 50,
          pageY: rect.top + 50,
          screenX: rect.left + 50,
          screenY: rect.top + 50,
          identifier: 0,
          target: canvas,
          force: 1,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
        }]
      });
      canvas.dispatchEvent(touchStartEvent);

      // Simulate touch move
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{
          clientX: rect.left + 100,
          clientY: rect.top + 50,
          pageX: rect.left + 100,
          pageY: rect.top + 50,
          screenX: rect.left + 100,
          screenY: rect.top + 50,
          identifier: 0,
          target: canvas,
          force: 1,
          radiusX: 1,
          radiusY: 1,
          rotationAngle: 0,
        }]
      });
      canvas.dispatchEvent(touchMoveEvent);

      // Simulate touch end
      const touchEndEvent = new TouchEvent('touchend');
      canvas.dispatchEvent(touchEndEvent);

      expect(signatureCanvas.isEmpty()).toBe(false);
    });
  });

  describe('Data management', () => {
    it('should get signature data correctly', () => {
      // Draw something first
      const rect = canvas.getBoundingClientRect();
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseUpEvent);

      const data = signatureCanvas.getData();
      expect(data).toBeDefined();
      expect(data.strokes).toHaveLength(1);
      expect(data.width).toBe(400);
      expect(data.height).toBe(200);
      expect(data.backgroundColor).toBe('#ffffff');
      expect(data.timestamp).toBeTypeOf('number');
    });

    it('should set signature data correctly', () => {
      const testData: SignatureData = {
        strokes: [{
          points: [
            { x: 10, y: 10, timestamp: Date.now() },
            { x: 20, y: 20, timestamp: Date.now() + 1 }
          ],
          color: '#000000',
          width: 2,
          timestamp: Date.now()
        }],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: Date.now()
      };

      signatureCanvas.setData(testData);
      expect(signatureCanvas.isEmpty()).toBe(false);

      const retrievedData = signatureCanvas.getData();
      expect(retrievedData.strokes).toHaveLength(1);
      expect(retrievedData.strokes[0]?.points).toHaveLength(2);
    });
  });

  describe('Canvas operations', () => {
    it('should clear the canvas', () => {
      // Draw something first
      const rect = canvas.getBoundingClientRect();
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseUpEvent);

      expect(signatureCanvas.isEmpty()).toBe(false);

      signatureCanvas.clear();
      expect(signatureCanvas.isEmpty()).toBe(true);
    });

    it('should undo last stroke', () => {
      // Draw two strokes
      const rect = canvas.getBoundingClientRect();
      
      // First stroke
      const mouseDown1 = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseDown1);

      const mouseMove1 = new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseMove1);

      const mouseUp1 = new MouseEvent('mouseup', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseUp1);

      // Second stroke
      const mouseDown2 = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 100
      });
      canvas.dispatchEvent(mouseDown2);

      const mouseMove2 = new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 100
      });
      canvas.dispatchEvent(mouseMove2);

      const mouseUp2 = new MouseEvent('mouseup', {
        clientX: rect.left + 100,
        clientY: rect.top + 100
      });
      canvas.dispatchEvent(mouseUp2);

      const dataBeforeUndo = signatureCanvas.getData();
      expect(dataBeforeUndo.strokes).toHaveLength(2);

      signatureCanvas.undo();
      const dataAfterUndo = signatureCanvas.getData();
      expect(dataAfterUndo.strokes).toHaveLength(1);
    });

    it('should redo a stroke', () => {
      // Draw a stroke
      const rect = canvas.getBoundingClientRect();
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseUpEvent);

      const dataBeforeUndo = signatureCanvas.getData();
      expect(dataBeforeUndo.strokes).toHaveLength(1);

      signatureCanvas.undo();
      expect(signatureCanvas.getData().strokes).toHaveLength(0);

      signatureCanvas.redo(dataBeforeUndo.strokes[0]!);
      expect(signatureCanvas.getData().strokes).toHaveLength(1);
    });
  });

  describe('Export functionality', () => {
    it('should export to data URL', () => {
      const dataURL = signatureCanvas.toDataURL();
      expect(dataURL).toBeTypeOf('string');
      expect(dataURL).toMatch(/^data:image\/png;base64,/);
    });

    it('should export to blob', async () => {
      const blob = await signatureCanvas.toBlob();
      expect(blob).toBeDefined();
      expect(blob!.type).toBe('image/png');
    });

    it('should export with different formats', () => {
      const pngDataURL = signatureCanvas.toDataURL('image/png');
      const jpegDataURL = signatureCanvas.toDataURL('image/jpeg');
      
      expect(pngDataURL).toMatch(/^data:image\/png;base64,/);
      expect(jpegDataURL).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('Options update', () => {
    it('should update options correctly', () => {
      signatureCanvas.updateOptions({
        color: '#ff0000',
        lineWidth: 5
      });

      // Draw something with new options
      const rect = canvas.getBoundingClientRect();
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: rect.left + 50,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: rect.left + 100,
        clientY: rect.top + 50
      });
      canvas.dispatchEvent(mouseUpEvent);

      const data = signatureCanvas.getData();
      expect(data.strokes[0]).toBeDefined();
      expect(data.strokes[0]!.color).toBe('#ff0000');
      expect(data.strokes[0]!.width).toBe(5);
    });
  });

  describe('Point calculation', () => {
    it('should calculate points correctly', () => {
      const point = signatureCanvas.getPointFromEvent({
        clientX: 50,
        clientY: 50
      } as MouseEvent);

      expect(point.x).toBeTypeOf('number');
      expect(point.y).toBeTypeOf('number');
    });

    it('should handle pressure when available', () => {
      const point = signatureCanvas.getPointFromEvent({
        clientX: 50,
        clientY: 50,
        pressure: 0.5
      } as any);

      expect(point.x).toBeTypeOf('number');
      expect(point.y).toBeTypeOf('number');
    });
  });
});
