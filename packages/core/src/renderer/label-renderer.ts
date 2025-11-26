/**
 * Label Renderer - utility for rendering text labels
 */

import type { Point } from '../types';

/** Label style options */
export interface LabelStyle {
  font?: string;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
}

/** Default label style */
const DEFAULT_LABEL_STYLE: Required<LabelStyle> = {
  font: '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#333333',
  backgroundColor: 'transparent',
  padding: 4,
  align: 'center',
  baseline: 'middle',
};

/**
 * Render a text label at a position
 */
export function renderLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: Point,
  style: LabelStyle = {}
): void {
  const mergedStyle = { ...DEFAULT_LABEL_STYLE, ...style };

  ctx.save();

  ctx.font = mergedStyle.font;
  ctx.textAlign = mergedStyle.align;
  ctx.textBaseline = mergedStyle.baseline;

  // Draw background if specified
  if (mergedStyle.backgroundColor !== 'transparent') {
    const metrics = ctx.measureText(text);
    const width = metrics.width + mergedStyle.padding * 2;
    const height = 20; // Approximate height

    let bgX = position.x - mergedStyle.padding;
    if (mergedStyle.align === 'center') {
      bgX = position.x - width / 2;
    } else if (mergedStyle.align === 'right') {
      bgX = position.x - width + mergedStyle.padding;
    }

    ctx.fillStyle = mergedStyle.backgroundColor;
    ctx.fillRect(bgX, position.y - height / 2, width, height);
  }

  // Draw text
  ctx.fillStyle = mergedStyle.color;
  ctx.fillText(text, position.x, position.y);

  ctx.restore();
}

/**
 * Render multiline text
 */
export function renderMultilineLabel(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  position: Point,
  lineHeight: number,
  style: LabelStyle = {}
): void {
  const mergedStyle = { ...DEFAULT_LABEL_STYLE, ...style };
  const totalHeight = lines.length * lineHeight;
  const startY = position.y - totalHeight / 2 + lineHeight / 2;

  ctx.save();
  ctx.font = mergedStyle.font;
  ctx.textAlign = mergedStyle.align;
  ctx.textBaseline = mergedStyle.baseline;
  ctx.fillStyle = mergedStyle.color;

  lines.forEach((line, index) => {
    ctx.fillText(line, position.x, startY + index * lineHeight);
  });

  ctx.restore();
}

/**
 * Measure text dimensions
 */
export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string = DEFAULT_LABEL_STYLE.font
): { width: number; height: number } {
  ctx.save();
  ctx.font = font;
  const metrics = ctx.measureText(text);
  ctx.restore();

  return {
    width: metrics.width,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || 16,
  };
}
