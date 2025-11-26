/**
 * Node Renderer - renders individual nodes on canvas
 */

import type { Node } from '../model';
import type { NodeShape } from '../types';

/** Rendering context */
export interface NodeRenderContext {
  ctx: CanvasRenderingContext2D;
  scale: number;
}

/**
 * Render a node on the canvas
 */
export function renderNode(node: Node, context: NodeRenderContext): void {
  const { ctx } = context;
  const { bounds, style, state, label } = node;

  // Determine colors
  const fillColor = state.highlighted && state.highlightColor
    ? state.highlightColor
    : style.color;

  // Save context
  ctx.save();

  // Apply glow effect if highlighted
  if (state.highlighted && state.glow) {
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Draw shape based on style
  drawShape(ctx, bounds, style.shape, fillColor);

  // Reset shadow for text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Draw label
  drawLabel(ctx, label, bounds);

  // Restore context
  ctx.restore();
}

/**
 * Draw the node shape
 */
function drawShape(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number },
  shape: NodeShape,
  color: string
): void {
  ctx.fillStyle = adjustAlpha(color, 0.15);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  switch (shape) {
    case 'rect':
      drawRect(ctx, bounds);
      break;
    case 'rounded-rect':
      drawRoundedRect(ctx, bounds, 8);
      break;
    case 'circle':
      drawCircle(ctx, bounds);
      break;
    case 'diamond':
      drawDiamond(ctx, bounds);
      break;
    default:
      drawRoundedRect(ctx, bounds, 8);
  }

  ctx.fill();
  ctx.stroke();
}

/**
 * Draw a rectangle
 */
function drawRect(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  ctx.beginPath();
  ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
}

/**
 * Draw a rounded rectangle
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number },
  radius: number
): void {
  const { x, y, width, height } = bounds;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a circle (ellipse fit to bounds)
 */
function drawCircle(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const radiusX = bounds.width / 2;
  const radiusY = bounds.height / 2;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
}

/**
 * Draw a diamond shape
 */
function drawDiamond(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  const { x, y, width, height } = bounds;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  ctx.beginPath();
  ctx.moveTo(centerX, y);
  ctx.lineTo(x + width, centerY);
  ctx.lineTo(centerX, y + height);
  ctx.lineTo(x, centerY);
  ctx.closePath();
}

/**
 * Draw the node label
 */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  ctx.fillStyle = '#333333';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  // Handle multiline labels
  const lines = label.split('\n');
  const lineHeight = 18;
  const totalHeight = lines.length * lineHeight;
  const startY = centerY - totalHeight / 2 + lineHeight / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, centerX, startY + index * lineHeight);
  });
}

/**
 * Adjust color alpha
 */
function adjustAlpha(hexColor: string, alpha: number): string {
  // Parse hex color
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
