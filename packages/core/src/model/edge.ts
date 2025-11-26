/**
 * Edge model class
 */

import type { EdgeConfig, EdgeStyle, LineType } from '../types';
import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_LINE_TYPE,
  DEFAULT_LINE_WIDTH,
} from '../types';

/** Runtime state for an edge */
export interface EdgeState {
  highlighted: boolean;
  highlightColor?: string;
  animating: boolean;
  animationProgress: number;
  animationLabel?: string;
}

/**
 * Edge model representing a connection between nodes
 */
export class Edge {
  public readonly id: string;
  public readonly from: string;
  public readonly to: string;
  public readonly label?: string;
  public readonly style: Required<Omit<EdgeStyle, 'animated'>> & Pick<EdgeStyle, 'animated'>;

  private _state: EdgeState = {
    highlighted: false,
    animating: false,
    animationProgress: 0,
  };

  constructor(config: EdgeConfig) {
    this.id = config.id;
    this.from = config.from;
    this.to = config.to;
    this.label = config.label;
    this.style = {
      color: config.style?.color || DEFAULT_EDGE_COLOR,
      lineType: config.style?.lineType || DEFAULT_LINE_TYPE,
      lineWidth: config.style?.lineWidth || DEFAULT_LINE_WIDTH,
      animated: config.style?.animated,
    };
  }

  /** Get current edge state */
  get state(): Readonly<EdgeState> {
    return this._state;
  }

  /** Highlight this edge */
  highlight(color?: string): void {
    this._state = {
      ...this._state,
      highlighted: true,
      highlightColor: color,
    };
  }

  /** Clear highlight */
  clearHighlight(): void {
    this._state = {
      ...this._state,
      highlighted: false,
      highlightColor: undefined,
    };
  }

  /** Start animation */
  startAnimation(label?: string): void {
    this._state = {
      ...this._state,
      animating: true,
      animationProgress: 0,
      animationLabel: label,
    };
  }

  /** Update animation progress (0-1) */
  setAnimationProgress(progress: number): void {
    this._state = {
      ...this._state,
      animationProgress: Math.max(0, Math.min(1, progress)),
    };
  }

  /** Stop animation */
  stopAnimation(): void {
    this._state = {
      ...this._state,
      animating: false,
      animationProgress: 0,
      animationLabel: undefined,
    };
  }

  /** Reset to initial state */
  reset(): void {
    this._state = {
      highlighted: false,
      animating: false,
      animationProgress: 0,
    };
  }

  /** Create from config */
  static fromConfig(config: EdgeConfig): Edge {
    return new Edge(config);
  }
}
