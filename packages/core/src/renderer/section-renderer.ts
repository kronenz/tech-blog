/**
 * Section Renderer - renders background sections on canvas
 */

import type { Section } from '../model';

/** Rendering context */
export interface SectionRenderContext {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
}

/**
 * Render a section on the canvas
 */
export function renderSection(section: Section, context: SectionRenderContext): void {
  const { ctx, canvasWidth } = context;
  const bounds = section.getFullBounds(canvasWidth);

  ctx.save();

  // Draw background
  if (section.style.background) {
    ctx.fillStyle = section.style.background;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  // Draw section border (subtle)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bounds.x, bounds.y);
  ctx.lineTo(bounds.x + bounds.width, bounds.y);
  ctx.moveTo(bounds.x, bounds.y + bounds.height);
  ctx.lineTo(bounds.x + bounds.width, bounds.y + bounds.height);
  ctx.stroke();

  // Draw label
  if (section.label) {
    drawSectionLabel(ctx, section, bounds);
  }

  ctx.restore();
}

/**
 * Draw section label on the left side
 */
function drawSectionLabel(
  ctx: CanvasRenderingContext2D,
  section: Section,
  bounds: { x: number; y: number; width: number; height: number }
): void {
  ctx.save();

  // Position label on the left, vertically centered
  const labelX = 10;
  const labelY = bounds.y + bounds.height / 2;

  // Rotate text to be vertical
  ctx.translate(labelX, labelY);
  ctx.rotate(-Math.PI / 2);

  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = section.style.labelColor || 'rgba(0, 0, 0, 0.5)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(section.label!, 0, 0);

  ctx.restore();
}
