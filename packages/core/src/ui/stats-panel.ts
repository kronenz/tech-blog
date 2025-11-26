/**
 * Stats Panel UI Component
 */

import type { StatState } from '../types';
import { animateValue } from '../utils/animate-value';

/** Stats panel layout options */
export type StatsLayout = 'list' | 'grid' | 'cards';

/** Stats panel options */
export interface StatsPanelOptions {
  container: HTMLElement;
  title?: string;
  stats?: StatState[];
  layout?: StatsLayout;
  columns?: number;
  animateValues?: boolean;
  highlightOnChange?: boolean;
}

/**
 * Stats Panel for displaying real-time statistics
 */
export class StatsPanel {
  private container: HTMLElement;
  private element: HTMLElement;
  private options: StatsPanelOptions;
  private stats: Map<string, StatState> = new Map();
  private previousValues: Map<string, number> = new Map();
  private activeAnimations: Map<string, () => void> = new Map();

  constructor(options: StatsPanelOptions) {
    this.options = {
      layout: 'list',
      columns: 2,
      animateValues: true,
      highlightOnChange: true,
      ...options,
    };
    this.container = options.container;
    this.element = document.createElement('div');
    this.element.className = 'animflow-stats-panel';

    // Initialize stats if provided
    if (options.stats) {
      for (const stat of options.stats) {
        this.stats.set(stat.id, stat);
        this.previousValues.set(stat.id, stat.value);
      }
    }

    this.render();
    this.addStyles();
  }

  /**
   * Get layout-specific CSS class
   */
  private getLayoutClass(): string {
    switch (this.options.layout) {
      case 'grid':
        return 'animflow-stats-grid';
      case 'cards':
        return 'animflow-stats-cards';
      default:
        return 'animflow-stats-list';
    }
  }

  /**
   * Render the stats panel
   */
  private render(): void {
    const title = this.options.title || 'Statistics';
    const statsArray = Array.from(this.stats.values());
    const layoutClass = this.getLayoutClass();

    const statsHtml = statsArray.length > 0
      ? statsArray.map((stat) => this.renderStatItem(stat)).join('')
      : '<div class="animflow-stat-empty">No statistics defined</div>';

    // Set CSS variable for columns
    const columnsStyle = this.options.layout !== 'list'
      ? `style="--stat-columns: ${this.options.columns}"`
      : '';

    this.element.innerHTML = `
      <div class="animflow-stats-header">${title}</div>
      <div class="animflow-stats-content ${layoutClass}" ${columnsStyle}>
        ${statsHtml}
      </div>
    `;

    this.container.appendChild(this.element);
  }

  /**
   * Render a single stat item
   */
  private renderStatItem(stat: StatState): string {
    const isCard = this.options.layout === 'cards';
    const itemClass = isCard ? 'animflow-stat-card' : 'animflow-stat-item';

    if (isCard) {
      return `
        <div class="${itemClass}" data-stat-id="${stat.id}">
          <div class="animflow-stat-value">${this.formatValue(stat)}</div>
          <div class="animflow-stat-label">${stat.label}</div>
        </div>
      `;
    }

    return `
      <div class="${itemClass}" data-stat-id="${stat.id}">
        <span class="animflow-stat-label">${stat.label}</span>
        <span class="animflow-stat-value">${this.formatValue(stat)}</span>
      </div>
    `;
  }

  /**
   * Format stat value for display
   */
  private formatValue(stat: StatState): string {
    const { value, format, unit } = stat;

    let formatted: string;
    switch (format) {
      case 'percentage':
        formatted = `${value.toFixed(1)}%`;
        break;
      case 'duration':
        formatted = `${Math.round(value)}ms`;
        break;
      case 'bytes':
        formatted = this.formatBytes(value);
        break;
      case 'number':
      default:
        formatted = Math.round(value).toLocaleString();
    }

    return unit ? `${formatted} ${unit}` : formatted;
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Update a stat value with optional animation
   */
  updateStat(statId: string, value: number): void {
    const stat = this.stats.get(statId);
    if (!stat) return;

    const previousValue = this.previousValues.get(statId) ?? 0;
    const valueEl = this.element.querySelector(
      `[data-stat-id="${statId}"] .animflow-stat-value`
    ) as HTMLElement;

    if (!valueEl) return;

    // Cancel any existing animation
    const cancelExisting = this.activeAnimations.get(statId);
    if (cancelExisting) {
      cancelExisting();
      this.activeAnimations.delete(statId);
    }

    // Determine if value increased or decreased
    const increased = value > previousValue;
    const changed = value !== previousValue;

    if (this.options.animateValues && changed && Math.abs(value - previousValue) > 0.01) {
      // Animate the value
      const cancel = animateValue({
        from: previousValue,
        to: value,
        duration: 400,
        easing: 'easeOut',
        onUpdate: (currentValue) => {
          stat.value = currentValue;
          valueEl.textContent = this.formatValue(stat);
        },
        onComplete: () => {
          this.activeAnimations.delete(statId);
        },
      });
      this.activeAnimations.set(statId, cancel);
    } else {
      stat.value = value;
      valueEl.textContent = this.formatValue(stat);
    }

    // Highlight change
    if (this.options.highlightOnChange && changed) {
      const highlightClass = increased
        ? 'animflow-stat-increased'
        : 'animflow-stat-decreased';

      valueEl.classList.add('animflow-stat-updated', highlightClass);

      setTimeout(() => {
        valueEl.classList.remove('animflow-stat-updated', highlightClass);
      }, 500);
    }

    this.previousValues.set(statId, value);
  }

  /**
   * Set stats definitions
   */
  setStats(stats: StatState[]): void {
    // Cancel all animations
    this.activeAnimations.forEach((cancel) => cancel());
    this.activeAnimations.clear();

    this.stats.clear();
    this.previousValues.clear();

    for (const stat of stats) {
      this.stats.set(stat.id, stat);
      this.previousValues.set(stat.id, stat.value);
    }

    this.element.innerHTML = '';
    this.render();
  }

  /**
   * Reset all stats to zero
   */
  reset(): void {
    // Cancel all animations
    this.activeAnimations.forEach((cancel) => cancel());
    this.activeAnimations.clear();

    for (const stat of this.stats.values()) {
      stat.value = 0;
      this.previousValues.set(stat.id, 0);
    }

    // Update display without animation
    const animateValues = this.options.animateValues;
    this.options.animateValues = false;

    for (const stat of this.stats.values()) {
      this.updateStat(stat.id, 0);
    }

    this.options.animateValues = animateValues;
  }

  /**
   * Set layout mode
   */
  setLayout(layout: StatsLayout, columns?: number): void {
    this.options.layout = layout;
    if (columns !== undefined) {
      this.options.columns = columns;
    }
    this.element.innerHTML = '';
    this.render();
  }

  /**
   * Add CSS styles
   */
  private addStyles(): void {
    const styleId = 'animflow-stats-panel-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .animflow-stats-panel {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
        min-width: 200px;
      }

      .animflow-stats-header {
        padding: 10px 14px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 13px;
        font-weight: 600;
        color: #334155;
      }

      /* List Layout */
      .animflow-stats-list {
        padding: 8px 0;
      }

      .animflow-stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 14px;
        transition: background-color 0.15s ease;
      }

      .animflow-stat-item:hover {
        background: #f8fafc;
      }

      /* Grid Layout */
      .animflow-stats-grid {
        display: grid;
        grid-template-columns: repeat(var(--stat-columns, 2), 1fr);
        gap: 1px;
        background: #e2e8f0;
        padding: 1px;
      }

      .animflow-stats-grid .animflow-stat-item {
        background: white;
        padding: 12px;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      /* Cards Layout */
      .animflow-stats-cards {
        display: grid;
        grid-template-columns: repeat(var(--stat-columns, 2), 1fr);
        gap: 12px;
        padding: 12px;
      }

      .animflow-stat-card {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .animflow-stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .animflow-stat-card .animflow-stat-value {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .animflow-stat-card .animflow-stat-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Common styles */
      .animflow-stat-label {
        font-size: 13px;
        color: #64748b;
      }

      .animflow-stat-value {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        font-variant-numeric: tabular-nums;
        transition: color 0.3s ease, transform 0.2s ease;
      }

      .animflow-stat-value.animflow-stat-updated {
        animation: statPulse 0.5s ease;
      }

      .animflow-stat-value.animflow-stat-increased {
        color: #10b981;
      }

      .animflow-stat-value.animflow-stat-decreased {
        color: #ef4444;
      }

      .animflow-stat-empty {
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: #94a3b8;
        font-style: italic;
      }

      @keyframes statPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    // Cancel all animations
    this.activeAnimations.forEach((cancel) => cancel());
    this.activeAnimations.clear();

    this.element.remove();
  }
}
