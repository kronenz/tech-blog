/**
 * Canvas Renderer - main renderer for AnimFlow diagrams
 */

import type { Diagram } from '../model';
import { renderNode } from './node-renderer';
import { renderEdge } from './edge-renderer';
import { renderSection } from './section-renderer';
import { RenderError } from '../errors';

/** Renderer options */
export interface CanvasRendererOptions {
  /** Target canvas element or selector */
  canvas: HTMLCanvasElement | string;
  /** Device pixel ratio for high DPI displays */
  pixelRatio?: number;
}

/**
 * Canvas Renderer for AnimFlow diagrams
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pixelRatio: number;
  private diagram: Diagram | null = null;
  private animationFrameId: number | null = null;
  private needsRender = true;

  constructor(options: CanvasRendererOptions) {
    // Get canvas element
    if (typeof options.canvas === 'string') {
      const el = document.querySelector<HTMLCanvasElement>(options.canvas);
      if (!el) {
        throw new RenderError(`Canvas element not found: ${options.canvas}`);
      }
      this.canvas = el;
    } else {
      this.canvas = options.canvas;
    }

    // Get 2D context
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new RenderError('Failed to get 2D canvas context');
    }
    this.ctx = ctx;

    // Set pixel ratio
    this.pixelRatio = options.pixelRatio ?? window.devicePixelRatio ?? 1;
  }

  /**
   * Set the diagram to render
   */
  setDiagram(diagram: Diagram): void {
    this.diagram = diagram;
    this.resizeCanvas(diagram.canvas.width, diagram.canvas.height);
    this.invalidate();
  }

  /**
   * Resize canvas to match diagram dimensions
   */
  private resizeCanvas(width: number, height: number): void {
    // Set display size
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Set actual size in memory (scaled for high DPI)
    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;

    // Scale context to match
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  /**
   * Mark the diagram as needing re-render
   */
  invalidate(): void {
    this.needsRender = true;
  }

  /**
   * Render the diagram
   */
  render(): void {
    if (!this.diagram) {
      return;
    }

    const { canvas, ctx } = this;
    const { width, height } = this.diagram.canvas;

    // Clear canvas
    ctx.save();
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = this.diagram.canvas.background;
    ctx.fillRect(0, 0, width, height);

    // Draw sections (background layers)
    const sections = this.diagram.getSections();
    for (const section of sections) {
      renderSection(section, { ctx, canvasWidth: width });
    }

    // Draw edges (below nodes)
    const edges = this.diagram.getEdges();
    for (const edge of edges) {
      renderEdge(edge, {
        ctx,
        getNode: (id) => this.diagram!.getNode(id),
      });
    }

    // Draw nodes (on top)
    const nodes = this.diagram.getNodes();
    for (const node of nodes) {
      renderNode(node, { ctx, scale: 1 });
    }

    ctx.restore();
    this.needsRender = false;
  }

  /**
   * Start the render loop
   */
  startRenderLoop(): void {
    const loop = (): void => {
      if (this.needsRender) {
        this.render();
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  /**
   * Stop the render loop
   */
  stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Render once (without loop)
   */
  renderOnce(): void {
    this.needsRender = true;
    this.render();
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get the 2D context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Destroy the renderer
   */
  destroy(): void {
    this.stopRenderLoop();
    this.diagram = null;
  }
}
