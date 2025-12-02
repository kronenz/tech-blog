/**
 * Stat Store - manages statistics values during scenario execution
 */

import type { StatState, StatFormat } from '../types';
import { DEFAULT_STAT_FORMAT, DEFAULT_STAT_VALUE } from '../types';

/** Stat definition for store initialization */
export interface StatStoreDefinition {
  id: string;
  label: string;
  initialValue?: number;
  format?: StatFormat;
  unit?: string;
}

/** Stat change event */
export interface StatChangeEvent {
  statId: string;
  oldValue: number;
  newValue: number;
  stat: StatState;
}

/**
 * Stat Store for managing runtime statistics
 */
export class StatStore {
  private stats: Map<string, StatState> = new Map();
  private onChange?: (event: StatChangeEvent) => void;

  constructor(onChange?: (event: StatChangeEvent) => void) {
    this.onChange = onChange;
  }

  /**
   * Initialize stats from definitions
   */
  initialize(definitions: StatStoreDefinition[]): void {
    this.stats.clear();
    for (const def of definitions) {
      this.stats.set(def.id, {
        id: def.id,
        label: def.label,
        value: def.initialValue ?? DEFAULT_STAT_VALUE,
        format: def.format ?? DEFAULT_STAT_FORMAT,
        unit: def.unit,
      });
    }
  }

  /**
   * Get a stat value
   */
  get(statId: string): number | undefined {
    return this.stats.get(statId)?.value;
  }

  /**
   * Get a stat state
   */
  getStat(statId: string): StatState | undefined {
    return this.stats.get(statId);
  }

  /**
   * Set a stat value
   */
  set(statId: string, value: number): void {
    const stat = this.stats.get(statId);
    if (stat) {
      const oldValue = stat.value;
      stat.value = value;
      this.onChange?.({
        statId,
        oldValue,
        newValue: value,
        stat,
      });
    }
  }

  /**
   * Increment a stat value
   */
  increment(statId: string, amount: number = 1): void {
    const current = this.get(statId) ?? 0;
    this.set(statId, current + amount);
  }

  /**
   * Decrement a stat value
   */
  decrement(statId: string, amount: number = 1): void {
    const current = this.get(statId) ?? 0;
    this.set(statId, current - amount);
  }

  /**
   * Reset all stats to initial values
   */
  reset(): void {
    for (const stat of this.stats.values()) {
      stat.value = DEFAULT_STAT_VALUE;
    }
  }

  /**
   * Get all stats as array
   */
  getAll(): StatState[] {
    return Array.from(this.stats.values());
  }

  /**
   * Check if a stat exists
   */
  has(statId: string): boolean {
    return this.stats.has(statId);
  }

  /**
   * Format a stat value for display
   */
  formatValue(statId: string): string {
    const stat = this.stats.get(statId);
    if (!stat) return '';

    const { value, format, unit } = stat;

    let formatted: string;
    switch (format) {
      case 'percentage':
        formatted = `${value.toFixed(1)}%`;
        break;
      case 'duration':
        formatted = `${value}ms`;
        break;
      case 'bytes':
        formatted = this.formatBytes(value);
        break;
      case 'number':
      default:
        formatted = value.toLocaleString();
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
}
