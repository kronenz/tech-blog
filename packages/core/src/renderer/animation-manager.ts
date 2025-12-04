/**
 * Animation Manager - handles animation state and timing
 */

import type { Diagram, Node, Edge } from '../model';
import type { AnimationStyle } from '../types';

/** Animation state for tracking active animations */
export interface AnimationState {
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  animatingEdges: Map<string, EdgeAnimationState>;
}

/** Edge animation state */
export interface EdgeAnimationState {
  progress: number;
  startTime: number;
  duration: number;
  label?: string;
  color?: string;
  flowNumber?: number;
}

/**
 * Animation Manager for coordinating diagram animations
 */
export class AnimationManager {
  private diagram: Diagram;
  private state: AnimationState;
  private onUpdate: () => void;

  constructor(diagram: Diagram, onUpdate: () => void) {
    this.diagram = diagram;
    this.onUpdate = onUpdate;
    this.state = {
      highlightedNodes: new Set(),
      highlightedEdges: new Set(),
      animatingEdges: new Map(),
    };
  }

  /**
   * Highlight nodes
   */
  highlightNodes(
    nodeIds: string[],
    style?: AnimationStyle
  ): void {
    for (const id of nodeIds) {
      const node = this.diagram.getNode(id);
      if (node) {
        node.highlight(style?.color, style?.glow);
        this.state.highlightedNodes.add(id);
      }
    }
    this.onUpdate();
  }

  /**
   * Highlight edges
   */
  highlightEdges(
    edgeIds: string[],
    style?: AnimationStyle
  ): void {
    for (const id of edgeIds) {
      const edge = this.diagram.getEdge(id);
      if (edge) {
        edge.highlight(style?.color);
        this.state.highlightedEdges.add(id);
      }
    }
    this.onUpdate();
  }

  /**
   * Start edge animation (dot traveling along edge)
   */
  startEdgeAnimation(
    edgeId: string,
    duration: number,
    label?: string,
    color?: string,
    flowNumber?: number
  ): Promise<void> {
    const edge = this.diagram.getEdge(edgeId);
    if (!edge) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const startTime = performance.now();

      this.state.animatingEdges.set(edgeId, {
        progress: 0,
        startTime,
        duration,
        label,
        color,
        flowNumber,
      });

      edge.startAnimation(label, flowNumber);
      if (color) {
        edge.highlight(color);
      }

      const animate = (): void => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        edge.setAnimationProgress(progress);
        this.onUpdate();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          edge.stopAnimation();
          this.state.animatingEdges.delete(edgeId);
          this.onUpdate();
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Clear all highlights
   */
  clearHighlights(): void {
    for (const id of this.state.highlightedNodes) {
      const node = this.diagram.getNode(id);
      if (node) {
        node.clearHighlight();
      }
    }
    this.state.highlightedNodes.clear();

    for (const id of this.state.highlightedEdges) {
      const edge = this.diagram.getEdge(id);
      if (edge) {
        edge.clearHighlight();
      }
    }
    this.state.highlightedEdges.clear();

    this.onUpdate();
  }

  /**
   * Reset all animations and highlights
   */
  reset(): void {
    this.clearHighlights();

    for (const [edgeId] of this.state.animatingEdges) {
      const edge = this.diagram.getEdge(edgeId);
      if (edge) {
        edge.stopAnimation();
      }
    }
    this.state.animatingEdges.clear();

    this.diagram.reset();
    this.onUpdate();
  }

  /**
   * Get current animation state
   */
  getState(): Readonly<AnimationState> {
    return this.state;
  }
}
