import type { SignaturePoint, SignatureStroke, SignatureData, SignatureOptions } from '../types/signature';

export class SignatureCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentStroke: SignaturePoint[] = [];
  private strokes: SignatureStroke[] = [];
  private options: Required<SignatureOptions>;
  
  constructor(canvas: HTMLCanvasElement, options: SignatureOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get 2D context from canvas');
    this.ctx = ctx;
    
    this.options = {
      width: 400,
      height: 200,
      color: '#000000',
      backgroundColor: '#ffffff',
      lineWidth: 2,
      smoothing: 0.5,
      pressure: false,
      ...options
    };
    
    this.setupCanvas();
    this.bindEvents();
  }
  
  private setupCanvas(): void {
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.clear();
  }
  
  private bindEvents(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleStart.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleEnd.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleEnd.bind(this));
    
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleEnd.bind(this));
  }
  
  private getPoint(e: MouseEvent | Touch): SignaturePoint {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    let x: number, y: number, pressure: number | undefined;
    
    if ('touches' in e) {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
      pressure = this.options.pressure ? (e as any).force : undefined;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
      pressure = this.options.pressure ? (e as any).pressure : undefined;
    }
    
    return { x, y, pressure, timestamp: Date.now() };
  }
  
  private handleStart(e: MouseEvent): void {
    e.preventDefault();
    this.isDrawing = true;
    const point = this.getPoint(e);
    this.currentStroke = [point];
    this.startStroke(point);
  }
  
  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.isDrawing = true;
      const point = this.getPoint(e.touches[0]);
      this.currentStroke = [point];
      this.startStroke(point);
    }
  }
  
  private handleMove(e: MouseEvent): void {
    if (!this.isDrawing) return;
    e.preventDefault();
    const point = this.getPoint(e);
    this.currentStroke.push(point);
    this.drawPoint(point);
  }
  
  private handleTouchMove(e: TouchEvent): void {
    if (!this.isDrawing || e.touches.length !== 1) return;
    e.preventDefault();
    const point = this.getPoint(e.touches[0]);
    this.currentStroke.push(point);
    this.drawPoint(point);
  }
  
  private handleEnd(): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.currentStroke.length > 1) {
      this.endStroke();
    }
    this.currentStroke = [];
  }
  
  private startStroke(point: SignaturePoint): void {
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
  }
  
  private drawPoint(point: SignaturePoint): void {
    const lastPoint = this.currentStroke[this.currentStroke.length - 2];
    if (!lastPoint) return;
    
    this.ctx.strokeStyle = this.options.color;
    this.ctx.lineWidth = point.pressure ? 
      this.options.lineWidth * (0.5 + point.pressure * 0.5) : 
      this.options.lineWidth;
    
    if (this.options.smoothing > 0 && this.currentStroke.length > 2) {
      const smoothedPoint = this.smoothPoint(this.currentStroke);
      this.ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, smoothedPoint.x, smoothedPoint.y);
    } else {
      this.ctx.lineTo(point.x, point.y);
    }
    
    this.ctx.stroke();
  }
  
  private smoothPoint(points: SignaturePoint[]): SignaturePoint {
    if (points.length < 3) return points[points.length - 1];
    
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const prevPrev = points[points.length - 3];
    
    return {
      x: prev.x * (1 - this.options.smoothing) + (prevPrev.x + last.x) / 2 * this.options.smoothing,
      y: prev.y * (1 - this.options.smoothing) + (prevPrev.y + last.y) / 2 * this.options.smoothing,
      pressure: last.pressure,
      timestamp: last.timestamp
    };
  }
  
  private endStroke(): void {
    const stroke: SignatureStroke = {
      points: [...this.currentStroke],
      color: this.options.color,
      width: this.options.lineWidth,
      timestamp: Date.now()
    };
    this.strokes.push(stroke);
  }
  
  public clear(): void {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.strokes = [];
    this.currentStroke = [];
  }
  
  public undo(): void {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this.redraw();
    }
  }
  
  public redo(stroke: SignatureStroke): void {
    this.strokes.push(stroke);
    this.redraw();
  }
  
  private redraw(): void {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (const stroke of this.strokes) {
      this.ctx.strokeStyle = stroke.color;
      this.ctx.lineWidth = stroke.width;
      this.ctx.beginPath();
      
      for (let i = 0; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        if (i === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      }
      
      this.ctx.stroke();
    }
  }
  
  public isEmpty(): boolean {
    return this.strokes.length === 0;
  }
  
  public getData(): SignatureData {
    return {
      strokes: [...this.strokes],
      width: this.canvas.width,
      height: this.canvas.height,
      backgroundColor: this.options.backgroundColor,
      timestamp: Date.now()
    };
  }
  
  public setData(data: SignatureData): void {
    this.strokes = [...data.strokes];
    this.redraw();
  }
  
  public toDataURL(format = 'image/png', quality = 1.0): string {
    return this.canvas.toDataURL(format, quality);
  }
  
  public toBlob(format = 'image/png', quality = 1.0): Promise<Blob> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, format, quality);
    });
  }
  
  public updateOptions(options: Partial<SignatureOptions>): void {
    this.options = { ...this.options, ...options };
    this.redraw();
  }
  
  public getPointFromEvent(e: MouseEvent | Touch): SignaturePoint {
    return this.getPoint(e);
  }
  
  public destroy(): void {
    this.canvas.removeEventListener('mousedown', this.handleStart.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleEnd.bind(this));
    this.canvas.removeEventListener('mouseleave', this.handleEnd.bind(this));
    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.handleEnd.bind(this));
  }
}
