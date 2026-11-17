import { AfterViewInit, Component, effect, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { Camera, panBy, zoomAt } from '../core/camera';
import { spectrumColor } from '../core/spectrum';
import { SimulationService } from '../simulation.service';

const CELL_SIZE = 8;
const BACKGROUND_COLOR = '#111318';
const ANT_COLOR = '#ff4d6d';
const EMPTY_BORDER_COLOR = 'rgba(96, 165, 250, 0.45)';
const EMPTY_GLOW_COLOR = 'rgba(96, 165, 250, 0.6)';
const MIN_CELL_SCREEN_SIZE = 4;
const MIN_SCALE = 0.1;
const MAX_SCALE = 20;
const ZOOM_STEP = 1.1;
const MAX_STEPS_PER_FRAME = 2000;

const ANT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="none" stroke="${ANT_COLOR}" stroke-width="4" stroke-linecap="round">
    <line x1="50" y1="30" x2="38" y2="10"/>
    <line x1="50" y1="30" x2="62" y2="10"/>
    <line x1="35" y1="45" x2="12" y2="35"/>
    <line x1="35" y1="45" x2="10" y2="50"/>
    <line x1="35" y1="45" x2="14" y2="62"/>
    <line x1="65" y1="45" x2="88" y2="35"/>
    <line x1="65" y1="45" x2="90" y2="50"/>
    <line x1="65" y1="45" x2="86" y2="62"/>
  </g>
  <g fill="${ANT_COLOR}">
    <circle cx="50" cy="28" r="12"/>
    <ellipse cx="50" cy="50" rx="15" ry="17"/>
    <ellipse cx="50" cy="78" rx="19" ry="23"/>
  </g>
</svg>`;

@Component({
  selector: 'app-simulation-canvas',
  styleUrl: './simulation-canvas.css',
  templateUrl: './simulation-canvas.html',
})
export class SimulationCanvas implements AfterViewInit, OnDestroy {
  private readonly simulation = inject(SimulationService);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId = 0;
  private camera: Camera = { scale: 1, offsetX: 0, offsetY: 0 };
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartCamera: Camera = { scale: 1, offsetX: 0, offsetY: 0 };
  private readonly antImage = new Image();
  private gridPattern: CanvasPattern | null = null;
  private gridPatternTileSize = -1;
  private lastFrameTime = 0;
  private stepAccumulatorMs = 0;

  constructor() {
    effect(() => {
      const tick = this.simulation.resetTick();
      if (tick > 0) {
        this.stepAccumulatorMs = 0;
        this.centerCamera();
      }
    });
  }

  private readonly onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const rect = this.canvasRef().nativeElement.getBoundingClientRect();
    const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    this.camera = zoomAt(this.camera, e.clientX - rect.left, e.clientY - rect.top, factor, MIN_SCALE, MAX_SCALE);
  };

  private readonly onContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
  };

  private readonly onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 2) return;
    this.dragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartCamera = this.camera;
  };

  private readonly onMouseMove = (e: MouseEvent): void => {
    if (!this.dragging) return;
    this.camera = panBy(this.dragStartCamera, e.clientX - this.dragStartX, e.clientY - this.dragStartY);
  };

  private readonly onMouseUp = (e: MouseEvent): void => {
    if (e.button === 2) this.dragging = false;
  };

  private readonly onResize = (): void => {
    const canvas = this.canvasRef().nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.antImage.src = `data:image/svg+xml,${encodeURIComponent(ANT_SVG)}`;
    this.onResize();
    this.centerCamera();

    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', this.onContextMenu);
    canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.onResize);

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    const canvas = this.canvasRef().nativeElement;
    canvas.removeEventListener('wheel', this.onWheel);
    canvas.removeEventListener('contextmenu', this.onContextMenu);
    canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('resize', this.onResize);
  }

  private centerCamera(): void {
    const canvas = this.canvasRef().nativeElement;
    this.camera = { scale: 1, offsetX: canvas.width / 2, offsetY: canvas.height / 2 };
  }

  private loop = (time: number): void => {
    const dt = this.lastFrameTime ? time - this.lastFrameTime : 0;
    this.lastFrameTime = time;

    if (this.simulation.running()) {
      this.stepAccumulatorMs += dt;
      const stepIntervalMs = 1000 / this.simulation.speed();
      let steps = 0;
      while (this.stepAccumulatorMs >= stepIntervalMs && steps < MAX_STEPS_PER_FRAME) {
        this.simulation.ant.step();
        this.stepAccumulatorMs -= stepIntervalMs;
        steps++;
      }
    } else {
      this.stepAccumulatorMs = 0;
    }

    this.draw();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private draw(): void {
    const ant = this.simulation.ant;
    const canvas = this.canvasRef().nativeElement;
    const { scale, offsetX, offsetY } = this.camera;
    const cellScreenSize = CELL_SIZE * scale;

    this.ctx.fillStyle = BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawEmptyGrid(canvas, offsetX, offsetY, cellScreenSize);

    for (const cell of ant.onCells()) {
      const x = cell.col * CELL_SIZE * scale + offsetX;
      const y = cell.row * CELL_SIZE * scale + offsetY;
      if (x + cellScreenSize < 0 || x > canvas.width || y + cellScreenSize < 0 || y > canvas.height) continue;
      this.ctx.fillStyle = spectrumColor(cell.order);
      this.ctx.fillRect(x, y, cellScreenSize, cellScreenSize);
    }

    const antSize = cellScreenSize * 2;
    const antCenterX = ant.col * CELL_SIZE * scale + offsetX + cellScreenSize / 2;
    const antCenterY = ant.row * CELL_SIZE * scale + offsetY + cellScreenSize / 2;

    this.ctx.save();
    this.ctx.translate(antCenterX, antCenterY);
    this.ctx.rotate((ant.dir * Math.PI) / 2);
    if (this.antImage.complete) {
      this.ctx.drawImage(this.antImage, -antSize / 2, -antSize / 2, antSize, antSize);
    } else {
      this.ctx.fillStyle = ANT_COLOR;
      this.ctx.fillRect(-cellScreenSize / 2, -cellScreenSize / 2, cellScreenSize, cellScreenSize);
    }
    this.ctx.restore();
  }

  private drawEmptyGrid(canvas: HTMLCanvasElement, offsetX: number, offsetY: number, cellScreenSize: number): void {
    if (cellScreenSize < MIN_CELL_SCREEN_SIZE) return;

    const pattern = this.getGridPattern(cellScreenSize);
    if (!pattern) return;

    const tileX = ((offsetX % cellScreenSize) + cellScreenSize) % cellScreenSize;
    const tileY = ((offsetY % cellScreenSize) + cellScreenSize) % cellScreenSize;
    pattern.setTransform(new DOMMatrix().translate(tileX, tileY));

    this.ctx.fillStyle = pattern;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private getGridPattern(cellScreenSize: number): CanvasPattern | null {
    const tileSize = Math.max(1, Math.round(cellScreenSize));
    if (this.gridPattern && this.gridPatternTileSize === tileSize) return this.gridPattern;

    const tile = document.createElement('canvas');
    tile.width = tileSize;
    tile.height = tileSize;
    const tileCtx = tile.getContext('2d')!;

    const radius = tileSize * 0.2;
    tileCtx.strokeStyle = EMPTY_BORDER_COLOR;
    tileCtx.lineWidth = 1;
    tileCtx.shadowColor = EMPTY_GLOW_COLOR;
    tileCtx.shadowBlur = tileSize * 0.3;
    tileCtx.beginPath();
    tileCtx.roundRect(1, 1, tileSize - 2, tileSize - 2, radius);
    tileCtx.stroke();

    this.gridPattern = this.ctx.createPattern(tile, 'repeat');
    this.gridPatternTileSize = tileSize;
    return this.gridPattern;
  }
}
