/**
 * Node model class
 */

import type {
  NodeConfig,
  NodeType,
  NodeShape,
  NodeStyle,
  Point,
} from '../types';
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
} from '../types';

/** Runtime state for a node */
export interface NodeState {
  highlighted: boolean;
  highlightColor?: string;
  glow: boolean;
}

/**
 * Node model representing a diagram element
 */
export class Node {
  public readonly id: string;
  public readonly type: NodeType;
  public readonly label: string;
  public readonly position: Point;
  public readonly section?: string;
  public readonly style: Required<Omit<NodeStyle, 'icon'>> & Pick<NodeStyle, 'icon'>;

  private _state: NodeState = {
    highlighted: false,
    glow: false,
  };

  constructor(config: NodeConfig) {
    this.id = config.id;
    this.type = config.type || 'box';
    this.label = config.label;
    this.position = { ...config.position };
    this.section = config.section;
    this.style = {
      color: config.style?.color || DEFAULT_NODE_COLOR,
      shape: config.style?.shape || DEFAULT_NODE_SHAPE,
      width: config.style?.width || DEFAULT_NODE_WIDTH,
      height: config.style?.height || DEFAULT_NODE_HEIGHT,
      icon: config.style?.icon,
    };
  }

  /** Get current node state */
  get state(): Readonly<NodeState> {
    return this._state;
  }

  /** Get node bounds */
  get bounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x - this.style.width / 2,
      y: this.position.y - this.style.height / 2,
      width: this.style.width,
      height: this.style.height,
    };
  }

  /** Highlight this node */
  highlight(color?: string, glow = false): void {
    this._state = {
      highlighted: true,
      highlightColor: color,
      glow,
    };
  }

  /** Clear highlight */
  clearHighlight(): void {
    this._state = {
      highlighted: false,
      glow: false,
    };
  }

  /** Reset to initial state */
  reset(): void {
    this.clearHighlight();
  }

  /** Create from config */
  static fromConfig(config: NodeConfig): Node {
    return new Node(config);
  }
}
