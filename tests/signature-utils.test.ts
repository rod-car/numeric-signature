import { describe, it, expect } from 'vitest';
import { SignatureUtils } from '../src/utils/signature-utils';
import type { SignatureData } from '../src/types/signature';

describe('SignatureUtils', () => {
  const mockSignatureData: SignatureData = {
    strokes: [
      {
        points: [
          { x: 10, y: 10, timestamp: 1000 },
          { x: 20, y: 20, timestamp: 1001 },
          { x: 30, y: 30, timestamp: 1002 }
        ],
        color: '#000000',
        width: 2,
        timestamp: 1000
      },
      {
        points: [
          { x: 50, y: 50, timestamp: 2000 },
          { x: 60, y: 60, timestamp: 2001 }
        ],
        color: '#ff0000',
        width: 3,
        timestamp: 2000
      }
    ],
    width: 400,
    height: 200,
    backgroundColor: '#ffffff',
    timestamp: 2000
  };

  describe('Export functionality', () => {
    it('should export to PNG format', () => {
      const pngData = SignatureUtils.exportToPNG(mockSignatureData);
      expect(pngData).toBeTypeOf('string');
      expect(pngData).toMatch(/^data:image\/png;base64,/);
    });

    it('should export to JPEG format', () => {
      const jpegData = SignatureUtils.exportToJPEG(mockSignatureData);
      expect(jpegData).toBeTypeOf('string');
      expect(jpegData).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should export to SVG format', () => {
      const svgData = SignatureUtils.exportToSVG(mockSignatureData);
      expect(svgData).toBeTypeOf('string');
      expect(svgData).toContain('<svg');
      expect(svgData).toContain('</svg>');
      expect(svgData).toContain('stroke="#000000"');
      expect(svgData).toContain('stroke="#ff0000"');
    });

    it('should export to JSON format', () => {
      const jsonData = SignatureUtils.exportToJSON(mockSignatureData);
      expect(jsonData).toBeTypeOf('string');
      
      const parsed = JSON.parse(jsonData);
      expect(parsed.strokes).toHaveLength(2);
      expect(parsed.width).toBe(400);
      expect(parsed.height).toBe(200);
    });

    it('should handle export options correctly', () => {
      const pngData = SignatureUtils.exportToPNG(mockSignatureData, {
        quality: 0.8,
        backgroundColor: '#f0f0f0'
      });
      expect(pngData).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('Import functionality', () => {
    it('should import from JSON correctly', () => {
      const jsonData = SignatureUtils.exportToJSON(mockSignatureData);
      const importedData = SignatureUtils.importFromJSON(jsonData);
      
      expect(importedData.strokes).toHaveLength(2);
      expect(importedData.width).toBe(400);
      expect(importedData.height).toBe(200);
      expect(importedData.backgroundColor).toBe('#ffffff');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => SignatureUtils.importFromJSON('invalid json')).toThrow();
    });
  });

  describe('Validation', () => {
    it('should validate correct signature data', () => {
      expect(SignatureUtils.validateSignatureData(mockSignatureData)).toBe(true);
    });

    it('should reject invalid signature data', () => {
      const invalidData = {
        strokes: 'not an array',
        width: 'not a number',
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: 2000
      } as any;
      
      expect(SignatureUtils.validateSignatureData(invalidData)).toBe(false);
    });

    it('should reject data with invalid strokes', () => {
      const invalidData = {
        strokes: [
          {
            points: 'not an array',
            color: '#000000',
            width: 2,
            timestamp: 1000
          }
        ],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: 2000
      } as any;
      
      expect(SignatureUtils.validateSignatureData(invalidData)).toBe(false);
    });

    it('should reject data with invalid points', () => {
      const invalidData = {
        strokes: [
          {
            points: [
              { x: 'not a number', y: 10 }
            ],
            color: '#000000',
            width: 2,
            timestamp: 1000
          }
        ],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: 2000
      } as any;
      
      expect(SignatureUtils.validateSignatureData(invalidData)).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should calculate signature statistics correctly', () => {
      const stats = SignatureUtils.getSignatureStats(mockSignatureData);
      
      expect(stats.strokeCount).toBe(2);
      expect(stats.totalPoints).toBe(5); // 3 points in first stroke + 2 in second
      expect(stats.duration).toBe(1001); // 2001 - 1000
      expect(stats.bounds.minX).toBe(10);
      expect(stats.bounds.minY).toBe(10);
      expect(stats.bounds.maxX).toBe(60);
      expect(stats.bounds.maxY).toBe(60);
    });

    it('should handle empty signature data', () => {
      const emptyData: SignatureData = {
        strokes: [],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: Date.now()
      };
      
      const stats = SignatureUtils.getSignatureStats(emptyData);
      expect(stats.strokeCount).toBe(0);
      expect(stats.totalPoints).toBe(0);
      expect(stats.duration).toBeGreaterThanOrEqual(Number.NEGATIVE_INFINITY);
    });
  });

  describe('Optimization', () => {
    it('should optimize signature data by removing redundant points', () => {
      const denseData: SignatureData = {
        strokes: [
          {
            points: [
              { x: 10, y: 10 },
              { x: 10.5, y: 10.5 }, // Should be removed with tolerance=2
              { x: 11, y: 11 },
              { x: 20, y: 20 },     // Should be kept
              { x: 30, y: 30 }
            ],
            color: '#000000',
            width: 2,
            timestamp: 1000
          }
        ],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: 1000
      };

      const optimized = SignatureUtils.optimizeSignatureData(denseData, 2);
      expect(optimized.strokes).toBeDefined();
      expect(denseData.strokes).toBeDefined();
      expect(optimized.strokes.length).toBeGreaterThan(0);
      expect(denseData.strokes.length).toBeGreaterThan(0);
      if (optimized.strokes[0] && denseData.strokes[0]) {
        expect(optimized.strokes[0].points.length).toBeLessThan(denseData.strokes[0].points.length);
        expect(optimized.strokes[0].points[0]).toEqual(denseData.strokes[0].points[0]);
        const lastPoint = optimized.strokes[0].points[optimized.strokes[0].points.length - 1];
        const originalLastPoint = denseData.strokes[0].points[denseData.strokes[0].points.length - 1];
        expect(lastPoint).toEqual(originalLastPoint);
      }
    });

    it('should not optimize strokes with less than 3 points', () => {
      const shortStrokeData: SignatureData = {
        strokes: [
          {
            points: [
              { x: 10, y: 10 },
              { x: 20, y: 20 }
            ],
            color: '#000000',
            width: 2,
            timestamp: 1000
          }
        ],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: 1000
      };

      const optimized = SignatureUtils.optimizeSignatureData(shortStrokeData, 2);
      expect(optimized.strokes[0]?.points).toHaveLength(2);
    });

    it('should handle empty data optimization', () => {
      const emptyData: SignatureData = {
        strokes: [],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: Date.now()
      };

      const optimized = SignatureUtils.optimizeSignatureData(emptyData);
      expect(optimized.strokes).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle single point strokes in SVG export', () => {
      const singlePointData: SignatureData = {
        strokes: [
          {
            points: [
              { x: 50, y: 50, timestamp: 1000 }
            ],
            color: '#000000',
            width: 2,
            timestamp: 1000
          }
        ],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: 1000
      };

      const svgData = SignatureUtils.exportToSVG(singlePointData);
      expect(svgData).toContain('<svg');
      expect(svgData).toContain('</svg>');
      // Should not contain path elements for single points
      expect(svgData).not.toContain('<path');
    });

    it('should handle empty strokes in SVG export', () => {
      const emptyStrokeData: SignatureData = {
        strokes: [
          {
            points: [],
            color: '#000000',
            width: 2,
            timestamp: 1000
          }
        ],
        width: 400,
        height: 200,
        backgroundColor: '#ffffff',
        timestamp: 1000
      };

      const svgData = SignatureUtils.exportToSVG(emptyStrokeData);
      expect(svgData).toContain('<svg');
      expect(svgData).toContain('</svg>');
      expect(svgData).not.toContain('<path');
    });
  });
});
