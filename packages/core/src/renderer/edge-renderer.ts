/**
 * Edge Renderer - renders connections between nodes
 */

import type { Edge, Node } from '../model';
import type { Point, LineType } from '../types';

/** Rendering context */
export interface EdgeRenderContext {
  ctx: CanvasRenderingContext2D;
  getNode: (id: string) => Node | undefined;
}

/**
 * Render an edge on the canvas
 */
export function renderEdge(edge: Edge, context: EdgeRenderContext): void {
  const { ctx, getNode } = context;
  const fromNode = getNode(edge.from);
  const toNode = getNode(edge.to);

  if (!fromNode || !toNode) {
    console.warn(`Edge ${edge.id}: Cannot find nodes ${edge.from} -> ${edge.to}`);
    return;
  }

  const { state, style } = edge;

  // Calculate connection points
  const fromCenter = fromNode.position;
  const toCenter = toNode.position;
  const fromBounds = fromNode.bounds;
  const toBounds = toNode.bounds;

  // Get intersection points with node boundaries
  const fromPoint = getEdgePoint(fromCenter, toCenter, fromBounds);
  const toPoint = getEdgePoint(toCenter, fromCenter, toBounds);

  // Determine color
  const color = state.highlighted && state.highlightColor
    ? state.highlightColor
    : style.color;

  ctx.save();

  // Draw the line
  ctx.strokeStyle = color;
  ctx.lineWidth = style.lineWidth;
  setLineStyle(ctx, style.lineType);

  ctx.beginPath();
  ctx.moveTo(fromPoint.x, fromPoint.y);
  ctx.lineTo(toPoint.x, toPoint.y);
  ctx.stroke();

  // Draw arrow head
  drawArrowHead(ctx, fromPoint, toPoint, color, style.lineWidth);

  // Draw edge label if present
  if (edge.label || state.animationLabel) {
    const label = state.animationLabel || edge.label;
    const midPoint = {
      x: (fromPoint.x + toPoint.x) / 2,
      y: (fromPoint.y + toPoint.y) / 2,
    };
    drawEdgeLabel(ctx, label!, midPoint, color);
  }

  // Draw animation indicator
  if (state.animating) {
    drawAnimationDot(ctx, fromPoint, toPoint, state.animationProgress, color);
  }

  ctx.restore();
}

/**
 * Get the point where edge intersects with node boundary
 */
function getEdgePoint(
  from: Point,
  to: Point,
  bounds: { x: number; y: number; width: number; height: number }
): Point {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 0 && dy === 0) {
    return { x: centerX, y: centerY };
  }

  // Calculate intersection with rectangle
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;

  let t = 1;

  if (dx !== 0) {
    const tx = dx > 0 ? halfWidth / dx : -halfWidth / dx;
    t = Math.min(t, tx);
  }

  if (dy !== 0) {
    const ty = dy > 0 ? halfHeight / dy : -halfHeight / dy;
    t = Math.min(t, ty);
  }

  return {
    x: centerX + dx * t,
    y: centerY + dy * t,
  };
}

/**
 * Set line dash pattern based on line type
 */
function setLineStyle(ctx: CanvasRenderingContext2D, lineType: LineType): void {
  switch (lineType) {
    case 'dashed':
      ctx.setLineDash([8, 4]);
      break;
    case 'dotted':
      ctx.setLineDash([3, 3]);
      break;
    case 'solid':
    default:
      ctx.setLineDash([]);
  }
}

/**
 * Draw arrow head at the end of the edge
 */
function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  lineWidth: number
): void {
  const headLength = 10 + lineWidth;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - headLength * Math.cos(angle - Math.PI / 6),
    to.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    to.x - headLength * Math.cos(angle + Math.PI / 6),
    to.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw edge label
 */
function drawEdgeLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  position: Point,
  color: string
): void {
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw background
  const metrics = ctx.measureText(label);
  const padding = 4;
  const bgWidth = metrics.width + padding * 2;
  const bgHeight = 16;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(
    position.x - bgWidth / 2,
    position.y - bgHeight / 2,
    bgWidth,
    bgHeight
  );

  // Draw text
  ctx.fillStyle = color;
  ctx.fillText(label, position.x, position.y);
}

/**
 * Draw animated dot traveling along the edge
 */
function drawAnimationDot(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  progress: number,
  color: string
): void {
  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
