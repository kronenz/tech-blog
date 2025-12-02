/**
 * Flow Number Overlay - displays step numbers on active nodes/edges
 */

/** Flow number info for a node or edge */
export interface FlowNumberInfo {
  elementId: string;
  elementType: 'node' | 'edge';
  stepNumber: number;
  x: number;
  y: number;
  color?: string;
  isActive?: boolean;
}

/** Flow Number Overlay options */
export interface FlowNumberOverlayOptions {
  container: HTMLElement;
}

/**
 * Flow Number Overlay renders step numbers on the diagram
 */
export class FlowNumberOverlay {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private flowNumbers: Map<string, FlowNumberInfo> = new Map();
  private stepHistory: FlowNumberInfo[] = [];
  private maxHistorySize = 10;

  constructor(options: FlowNumberOverlayOptions) {
    this.container = options.container;

    // Create overlay canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'animflow-flow-overlay';
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 50;
    `;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context for overlay');
    }
    this.ctx = ctx;

    this.container.style.position = 'relative';
    this.container.appendChild(this.canvas);
  }

  /**
   * Resize canvas to match container
   */
  resize(width: number, height: number): void {
    const pixelRatio = window.devicePixelRatio || 1;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = width * pixelRatio;
    this.canvas.height = height * pixelRatio;

    this.ctx.scale(pixelRatio, pixelRatio);
  }

  /**
   * Add a flow number to display
   */
  addFlowNumber(info: FlowNumberInfo): void {
    const key = `${info.elementType}-${info.elementId}`;
    this.flowNumbers.set(key, info);

    // Add to history
    this.stepHistory.push({ ...info });
    if (this.stepHistory.length > this.maxHistorySize) {
      this.stepHistory.shift();
    }

    this.render();
  }

  /**
   * Mark a flow number as complete (no longer active)
   */
  completeFlowNumber(elementType: 'node' | 'edge', elementId: string): void {
    const key = `${elementType}-${elementId}`;
    const info = this.flowNumbers.get(key);
    if (info) {
      info.isActive = false;
      this.render();
    }
  }

  /**
   * Clear all flow numbers
   */
  clear(): void {
    this.flowNumbers.clear();
    this.stepHistory = [];
    this.render();
  }

  /**
   * Render all flow numbers
   */
  render(): void {
    const { ctx, canvas } = this;
    const pixelRatio = window.devicePixelRatio || 1;

    // Clear canvas
    ctx.save();
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);

    // Render history (faded) first
    for (let i = 0; i < this.stepHistory.length - 1; i++) {
      const info = this.stepHistory[i];
      const opacity = 0.3 + (i / this.stepHistory.length) * 0.3;
      this.renderFlowNumber(info, opacity, false);
    }

    // Render active flow numbers
    for (const [, info] of this.flowNumbers) {
      if (info.isActive !== false) {
        this.renderFlowNumber(info, 1, true);
      }
    }

    ctx.restore();
  }

  /**
   * Render a single flow number
   */
  private renderFlowNumber(
    info: FlowNumberInfo,
    opacity: number,
    showPulse: boolean
  ): void {
    const { ctx } = this;
    const { x, y, stepNumber, color } = info;

    const radius = 14;
    const bgColor = color || '#4f46e5';

    ctx.save();
    ctx.globalAlpha = opacity;

    // Draw pulse animation circle (for active numbers)
    if (showPulse) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = bgColor;
      ctx.globalAlpha = opacity * 0.3;
      ctx.fill();
      ctx.globalAlpha = opacity;
    }

    // Draw background circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(stepNumber), x, y + 1);

    ctx.restore();
  }

  /**
   * Get step history
   */
  getHistory(): FlowNumberInfo[] {
    return [...this.stepHistory];
  }

  /**
   * Destroy the overlay
   */
  destroy(): void {
    this.canvas.remove();
    this.flowNumbers.clear();
    this.stepHistory = [];
  }
}
