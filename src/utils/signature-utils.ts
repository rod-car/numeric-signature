import type { SignatureData, SignatureExportOptions } from '../types/signature';

export class SignatureUtils {
  static exportToPNG(data: SignatureData, options: SignatureExportOptions = {}): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = data.width;
    canvas.height = data.height;
    
    // Background
    ctx.fillStyle = options.backgroundColor || data.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw strokes
    for (const stroke of data.strokes) {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      
      for (let i = 0; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      
      ctx.stroke();
    }
    
    const quality = options.quality || 1.0;
    return canvas.toDataURL('image/png', quality);
  }
  
  static exportToJPEG(data: SignatureData, options: SignatureExportOptions = {}): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = data.width;
    canvas.height = data.height;
    
    // Background (white for JPEG)
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw strokes
    for (const stroke of data.strokes) {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      
      for (let i = 0; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      
      ctx.stroke();
    }
    
    const quality = options.quality || 0.9;
    return canvas.toDataURL('image/jpeg', quality);
  }
  
  static exportToSVG(data: SignatureData): string {
    const paths: string[] = [];
    
    for (const stroke of data.strokes) {
      if (stroke.points.length < 2) continue;
      
      let path = `M ${stroke.points[0].x} ${stroke.points[0].y}`;
      
      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        path += ` L ${point.x} ${point.y}`;
      }
      
      paths.push(`<path d="${path}" stroke="${stroke.color}" stroke-width="${stroke.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${data.width}" height="${data.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${data.backgroundColor}"/>
  ${paths.join('\n  ')}
</svg>`;
  }
  
  static exportToJSON(data: SignatureData): string {
    return JSON.stringify(data, null, 2);
  }
  
  static importFromJSON(json: string): SignatureData {
    return JSON.parse(json);
  }
  
  static validateSignatureData(data: any): data is SignatureData {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.strokes) &&
      typeof data.width === 'number' &&
      typeof data.height === 'number' &&
      typeof data.backgroundColor === 'string' &&
      typeof data.timestamp === 'number' &&
      data.strokes.every((stroke: any) =>
        Array.isArray(stroke.points) &&
        typeof stroke.color === 'string' &&
        typeof stroke.width === 'number' &&
        typeof stroke.timestamp === 'number' &&
        stroke.points.every((point: any) =>
          typeof point.x === 'number' &&
          typeof point.y === 'number' &&
          (point.pressure === undefined || typeof point.pressure === 'number') &&
          (point.timestamp === undefined || typeof point.timestamp === 'number')
        )
      )
    );
  }
  
  static getSignatureStats(data: SignatureData): {
    strokeCount: number;
    totalPoints: number;
    duration: number;
    bounds: { minX: number; minY: number; maxX: number; maxY: number };
  } {
    let totalPoints = 0;
    let minX = data.width;
    let minY = data.height;
    let maxX = 0;
    let maxY = 0;
    let minTime = Infinity;
    let maxTime = 0;
    
    for (const stroke of data.strokes) {
      totalPoints += stroke.points.length;
      
      for (const point of stroke.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
        
        if (point.timestamp) {
          minTime = Math.min(minTime, point.timestamp);
          maxTime = Math.max(maxTime, point.timestamp);
        }
      }
      
      minTime = Math.min(minTime, stroke.timestamp);
      maxTime = Math.max(maxTime, stroke.timestamp);
    }
    
    return {
      strokeCount: data.strokes.length,
      totalPoints,
      duration: maxTime - minTime,
      bounds: { minX, minY, maxX, maxY }
    };
  }
  
  static optimizeSignatureData(data: SignatureData, tolerance = 2): SignatureData {
    const optimizedStrokes = data.strokes.map(stroke => {
      if (stroke.points.length <= 2) return stroke;
      
      const optimizedPoints = [stroke.points[0]];
      let lastPoint = stroke.points[0];
      
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const point = stroke.points[i];
        const distance = Math.sqrt(
          Math.pow(point.x - lastPoint.x, 2) + 
          Math.pow(point.y - lastPoint.y, 2)
        );
        
        if (distance >= tolerance) {
          optimizedPoints.push(point);
          lastPoint = point;
        }
      }
      
      optimizedPoints.push(stroke.points[stroke.points.length - 1]);
      
      return {
        ...stroke,
        points: optimizedPoints
      };
    });
    
    return {
      ...data,
      strokes: optimizedStrokes
    };
  }
}
