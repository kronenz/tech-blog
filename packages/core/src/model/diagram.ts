/**
 * Diagram model class - root container for all diagram elements
 */

import type {
  DiagramConfig,
  DiagramMetadata,
} from '../types';
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_BACKGROUND,
} from '../types';
import { Node } from './node';
import { Edge } from './edge';
import { Section } from './section';
import { Scenario } from './scenario';

/**
 * Canvas settings with defaults applied
 */
export interface CanvasSettings {
  width: number;
  height: number;
  background: string;
}

/**
 * Diagram model representing a complete AnimFlow diagram
 */
export class Diagram {
  public readonly version: string;
  public readonly metadata: DiagramMetadata;
  public readonly canvas: CanvasSettings;
  public readonly nodes: Map<string, Node>;
  public readonly edges: Map<string, Edge>;
  public readonly sections: Map<string, Section>;
  public readonly scenarios: Map<string, Scenario>;

  constructor(config: DiagramConfig) {
    this.version = config.version;
    this.metadata = config.metadata || {};
    this.canvas = {
      width: config.canvas?.width || DEFAULT_CANVAS_WIDTH,
      height: config.canvas?.height || DEFAULT_CANVAS_HEIGHT,
      background: config.canvas?.background || DEFAULT_CANVAS_BACKGROUND,
    };

    // Build nodes map
    this.nodes = new Map(
      config.nodes.map((nodeConfig) => {
        const node = Node.fromConfig(nodeConfig);
        return [node.id, node];
      })
    );

    // Build edges map
    this.edges = new Map(
      (config.edges || []).map((edgeConfig) => {
        const edge = Edge.fromConfig(edgeConfig);
        return [edge.id, edge];
      })
    );

    // Build sections map
    this.sections = new Map(
      (config.canvas?.sections || []).map((sectionConfig) => {
        const section = Section.fromConfig(sectionConfig);
        return [section.id, section];
      })
    );

    // Build scenarios map
    this.scenarios = new Map(
      (config.scenarios || []).map((scenarioConfig) => {
        const scenario = Scenario.fromConfig(scenarioConfig);
        return [scenario.id, scenario];
      })
    );
  }

  /** Get a node by ID */
  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  /** Get an edge by ID */
  getEdge(id: string): Edge | undefined {
    return this.edges.get(id);
  }

  /** Get a section by ID */
  getSection(id: string): Section | undefined {
    return this.sections.get(id);
  }

  /** Get all nodes as array */
  getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  /** Get all edges as array */
  getEdges(): Edge[] {
    return Array.from(this.edges.values());
  }

  /** Get all sections as array */
  getSections(): Section[] {
    return Array.from(this.sections.values());
  }

  /** Get a scenario by ID */
  getScenario(id: string): Scenario | undefined {
    return this.scenarios.get(id);
  }

  /** Get all scenarios as array */
  getScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  /** Get nodes in a specific section */
  getNodesInSection(sectionId: string): Node[] {
    return this.getNodes().filter((node) => node.section === sectionId);
  }

  /** Get edges connected to a node */
  getEdgesForNode(nodeId: string): Edge[] {
    return this.getEdges().filter(
      (edge) => edge.from === nodeId || edge.to === nodeId
    );
  }

  /** Reset all elements to initial state */
  reset(): void {
    this.nodes.forEach((node) => node.reset());
    this.edges.forEach((edge) => edge.reset());
  }

  /** Create from config */
  static fromConfig(config: DiagramConfig): Diagram {
    return new Diagram(config);
  }
}
