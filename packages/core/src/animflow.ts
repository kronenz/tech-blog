/**
 * AnimFlow - Main class for the AnimFlow DSL Engine
 */

import { Parser } from './parser';
import { Diagram } from './model';
import { CanvasRenderer, AnimationManager } from './renderer';
import { ScenarioRunner, type ScenarioState, type StepProgressEvent } from './engine';
import { ControlBar, LayoutManager, HeaderPanel, LegendPanel, FooterPanel, PresetSelector, ComparisonPanel, StepProgressIndicator } from './ui';
import type { DiagramConfig, LayoutConfig } from './types';

export type { ScenarioState };

/** AnimFlow initialization options */
export interface AnimFlowOptions {
  /** Target container element or selector */
  container: HTMLElement | string;
  /** YAML or JSON source content */
  source?: string;
  /** Source format hint */
  format?: 'yaml' | 'json';
  /** Auto-render on initialization */
  autoRender?: boolean;
  /** Device pixel ratio override */
  pixelRatio?: number;
  /** Show control bar */
  showControls?: boolean;
  /** Default scenario to run */
  defaultScenario?: string;
  /** Enable layout system */
  enableLayout?: boolean;
  /** Show step progress indicator */
  showProgress?: boolean;
}

/** AnimFlow events */
export type AnimFlowEvent =
  | 'render'
  | 'error'
  | 'scenario:start'
  | 'scenario:end'
  | 'scenario:step'
  | 'state:change'
  | 'preset:change';

/** Event handler type */
export type AnimFlowEventHandler<T = unknown> = (payload: T) => void;

/**
 * AnimFlow - Declarative diagram visualization engine
 */
export class AnimFlow {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private animationManager: AnimationManager | null = null;
  private scenarioRunner: ScenarioRunner | null = null;
  private controlBar: ControlBar | null = null;
  private layoutManager: LayoutManager | null = null;
  private headerPanel: HeaderPanel | null = null;
  private legendPanel: LegendPanel | null = null;
  private footerPanel: FooterPanel | null = null;
  private presetSelector: PresetSelector | null = null;
  private comparisonPanel: ComparisonPanel | null = null;
  private stepProgressIndicator: StepProgressIndicator | null = null;
  private diagram: Diagram | null = null;
  private config: DiagramConfig | null = null;
  private options: AnimFlowOptions;
  private eventHandlers: Map<AnimFlowEvent, Set<AnimFlowEventHandler>> = new Map();

  constructor(options: AnimFlowOptions) {
    this.options = options;

    // Get container element
    if (typeof options.container === 'string') {
      const el = document.querySelector<HTMLElement>(options.container);
      if (!el) {
        throw new Error(`Container element not found: ${options.container}`);
      }
      this.container = el;
    } else {
      this.container = options.container;
    }

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';

    // If layout is enabled, we'll append canvas to layout's main slot later
    // Otherwise, append directly to container
    if (!options.enableLayout) {
      this.container.appendChild(this.canvas);
    }

    // Create renderer
    this.renderer = new CanvasRenderer({
      canvas: this.canvas,
      pixelRatio: options.pixelRatio,
    });

    // Load source if provided
    if (options.source) {
      this.loadSource(options.source, options.format);
    }

    // Auto-render if requested
    if (options.autoRender !== false && this.diagram) {
      this.render();
    }
  }

  /**
   * Load diagram from source string
   */
  loadSource(source: string, format?: 'yaml' | 'json'): void {
    try {
      this.config = Parser.parse(source, { format });
      this.diagram = Diagram.fromConfig(this.config);

      // Initialize layout system if enabled
      this.initializeLayout(this.config.layout);

      this.renderer.setDiagram(this.diagram);
      this.initializeAnimationSystem();
    } catch (error) {
      this.emit('error', { error });
      throw error;
    }
  }

  /**
   * Initialize the layout system with panels
   */
  private initializeLayout(layoutConfig?: LayoutConfig): void {
    if (!this.options.enableLayout) return;

    // Create layout manager
    this.layoutManager = new LayoutManager({
      container: this.container,
      config: layoutConfig,
    });

    // Create header panel if configured
    if (layoutConfig?.header) {
      this.headerPanel = new HeaderPanel({
        config: layoutConfig.header,
      });
      this.layoutManager.registerComponent('top', this.headerPanel);
    }

    // Create legend panel if configured
    if (layoutConfig?.legend?.enabled !== false && layoutConfig?.legend?.items) {
      this.legendPanel = new LegendPanel({
        config: layoutConfig.legend,
      });
      // Legend goes in top slot (below header)
      this.layoutManager.registerComponent('top', this.legendPanel);
    }

    // Create preset selector if presets are defined
    if (this.config?.presets && this.config.presets.length > 0) {
      this.presetSelector = new PresetSelector({
        presets: this.config.presets.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          isDefault: p.default,
        })),
        activePresetId: this.config.presets.find((p) => p.default)?.id,
        onPresetChange: (presetId) => {
          this.setPreset(presetId);
        },
      });
      this.layoutManager.registerComponent('top', this.presetSelector);
    }

    // Append canvas to the main slot
    const mainSlot = this.layoutManager.getMainSlot();
    if (mainSlot) {
      mainSlot.appendChild(this.canvas);
    }

    // Create comparison panel if configured
    if (this.config?.comparison?.enabled !== false && this.config?.comparison?.items) {
      this.comparisonPanel = new ComparisonPanel({
        config: this.config.comparison,
        activePresetId: this.config.presets?.find((p) => p.default)?.id,
        onPresetClick: (presetId) => {
          this.setPreset(presetId);
          this.presetSelector?.setActivePreset(presetId);
        },
      });
      this.layoutManager.registerComponent('bottom', this.comparisonPanel);
    }

    // Create footer panel if configured
    if (layoutConfig?.footer) {
      this.footerPanel = new FooterPanel({
        config: layoutConfig.footer,
      });
      this.layoutManager.registerComponent('bottom', this.footerPanel);
    }
  }

  /**
   * Initialize animation manager and scenario runner
   */
  private initializeAnimationSystem(): void {
    if (!this.diagram) return;

    // Create animation manager with update callback
    this.animationManager = new AnimationManager(this.diagram, () => {
      this.renderer.invalidate();
      this.renderer.renderOnce();
    });

    // Create step progress indicator if enabled
    if (this.options.showProgress !== false) {
      this.createStepProgressIndicator();
    }

    // Create scenario runner with event forwarding
    this.scenarioRunner = new ScenarioRunner(
      this.diagram,
      this.animationManager,
      {
        onStateChange: (state) => {
          this.emit('state:change', { state });
          this.controlBar?.setRunning(state === 'running');
          // Hide progress indicator when not running
          if (state === 'idle' || state === 'completed') {
            this.stepProgressIndicator?.hide();
          }
        },
        onScenarioStart: (scenarioId) => {
          this.emit('scenario:start', { scenarioId });
          this.stepProgressIndicator?.show();
        },
        onScenarioEnd: (scenarioId) => {
          this.emit('scenario:end', { scenarioId });
        },
        onStepStart: (scenarioId, stepIndex, step) => {
          this.emit('scenario:step', { scenarioId, stepIndex, step, phase: 'start' });
        },
        onStepEnd: (scenarioId, stepIndex, step) => {
          this.emit('scenario:step', { scenarioId, stepIndex, step, phase: 'end' });
        },
        onStepProgress: (progress: StepProgressEvent) => {
          this.stepProgressIndicator?.update({
            currentStep: progress.currentStep,
            totalSteps: progress.totalSteps,
            scenarioName: progress.scenarioName,
            stepLabel: progress.stepLabel,
            branchPath: progress.branchPath,
            isSubScenario: progress.isSubScenario,
            parentScenarioName: progress.parentScenarioName,
          });
        },
        onBranchPath: (scenarioId, path, _condition) => {
          this.emit('scenario:step', { scenarioId, branchPath: path, phase: 'branch' });
        },
        onError: (error) => {
          this.emit('error', { error });
        },
      }
    );

    // Load presets if defined in config
    if (this.config?.presets && this.config.presets.length > 0) {
      this.scenarioRunner.loadPresets(this.config.presets);
    }

    // Create control bar if requested
    if (this.options.showControls) {
      this.createControlBar();
    }
  }

  /**
   * Create the step progress indicator
   */
  private createStepProgressIndicator(): void {
    // Get the container for the progress indicator
    const progressContainer = this.layoutManager?.getMainSlot() || this.container;

    this.stepProgressIndicator = new StepProgressIndicator({
      container: progressContainer,
      position: 'top-right',
    });
  }

  /**
   * Create the control bar UI
   */
  private createControlBar(): void {
    this.controlBar = new ControlBar({
      container: this.container,
      showSpeed: true,
      enableKeyboard: true,
      onStart: () => {
        const defaultScenario = this.options.defaultScenario || this.getDefaultScenarioId();
        if (defaultScenario) {
          this.runScenario(defaultScenario);
        }
      },
      onStop: () => {
        this.stopScenario();
      },
      onReset: () => {
        this.stopScenario();
        this.reset();
      },
      onSpeedChange: (speed) => {
        this.setSpeed(speed);
      },
    });
  }

  /**
   * Get the default scenario ID (first scenario)
   */
  private getDefaultScenarioId(): string | null {
    if (!this.diagram) return null;
    const scenarios = this.diagram.getScenarios();
    return scenarios.length > 0 ? scenarios[0].id : null;
  }

  /**
   * Load diagram from URL
   */
  async loadUrl(url: string, format?: 'yaml' | 'json'): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load diagram: ${response.statusText}`);
    }
    const source = await response.text();

    // Auto-detect format from URL if not specified
    if (!format) {
      if (url.endsWith('.json')) {
        format = 'json';
      } else if (url.endsWith('.yaml') || url.endsWith('.yml')) {
        format = 'yaml';
      }
    }

    this.loadSource(source, format);
  }

  /**
   * Render the diagram
   */
  async render(): Promise<void> {
    if (!this.diagram) {
      throw new Error('No diagram loaded');
    }
    this.renderer.renderOnce();
    this.emit('render', { diagram: this.diagram });
  }

  /**
   * Get the diagram model
   */
  getDiagram(): Diagram | null {
    return this.diagram;
  }

  /**
   * Get the diagram config
   */
  getConfig(): DiagramConfig | null {
    return this.config;
  }

  /**
   * Reset diagram to initial state
   */
  reset(): void {
    if (this.diagram) {
      this.diagram.reset();
      if (this.animationManager) {
        this.animationManager.reset();
      }
      this.renderer.invalidate();
      this.renderer.renderOnce();
    }
  }

  /**
   * Run a scenario by ID
   */
  async runScenario(scenarioId: string): Promise<void> {
    if (!this.scenarioRunner) {
      throw new Error('No diagram loaded');
    }
    this.startRenderLoop();
    try {
      await this.scenarioRunner.runScenario(scenarioId);
    } finally {
      this.stopRenderLoop();
    }
  }

  /**
   * Stop the currently running scenario
   */
  stopScenario(): void {
    if (this.scenarioRunner) {
      this.scenarioRunner.stop();
    }
    this.stopRenderLoop();
  }

  /**
   * Set the animation speed multiplier
   */
  setSpeed(multiplier: number): void {
    if (this.scenarioRunner) {
      this.scenarioRunner.setSpeed(multiplier);
    }
  }

  /**
   * Get current scenario state
   */
  getScenarioState(): ScenarioState {
    return this.scenarioRunner?.getState() ?? 'idle';
  }

  /**
   * Get list of available scenarios
   */
  getScenarios(): Array<{ id: string; name: string; description?: string }> {
    if (!this.diagram) return [];
    return this.diagram.getScenarios().map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
    }));
  }

  /**
   * Get list of available presets
   */
  getPresets(): Array<{ id: string; name: string; description?: string; isDefault: boolean }> {
    return this.scenarioRunner?.getPresets() ?? [];
  }

  /**
   * Set the active preset
   */
  setPreset(presetId: string): void {
    if (!this.scenarioRunner) {
      throw new Error('No diagram loaded');
    }
    this.scenarioRunner.applyPreset(presetId);

    // Update UI components
    this.presetSelector?.setActivePreset(presetId);
    this.comparisonPanel?.setActivePreset(presetId);

    this.emit('preset:change', { presetId });
  }

  /**
   * Get the active preset ID
   */
  getActivePresetId(): string | null {
    return this.scenarioRunner?.getActivePresetId() ?? null;
  }

  /**
   * Run a scenario with a specific preset
   */
  async runScenarioWithPreset(scenarioId: string, presetId: string): Promise<void> {
    if (!this.scenarioRunner) {
      throw new Error('No diagram loaded');
    }
    this.startRenderLoop();
    try {
      await this.scenarioRunner.runWithPreset(scenarioId, presetId);
    } finally {
      this.stopRenderLoop();
    }
  }

  /**
   * Subscribe to events
   */
  on<T = unknown>(event: AnimFlowEvent, handler: AnimFlowEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as AnimFlowEventHandler);
  }

  /**
   * Unsubscribe from events
   */
  off<T = unknown>(event: AnimFlowEvent, handler: AnimFlowEventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as AnimFlowEventHandler);
    }
  }

  /**
   * Emit an event
   */
  private emit<T>(event: AnimFlowEvent, payload: T): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(payload));
    }
  }

  /**
   * Start the render loop (for animations)
   */
  startRenderLoop(): void {
    this.renderer.startRenderLoop();
  }

  /**
   * Stop the render loop
   */
  stopRenderLoop(): void {
    this.renderer.stopRenderLoop();
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get the renderer
   */
  getRenderer(): CanvasRenderer {
    return this.renderer;
  }

  /**
   * Destroy the AnimFlow instance
   */
  destroy(): void {
    this.stopScenario();
    this.controlBar?.destroy();

    // Destroy layout components
    this.headerPanel?.destroy();
    this.legendPanel?.destroy();
    this.presetSelector?.destroy();
    this.comparisonPanel?.destroy();
    this.footerPanel?.destroy();
    this.stepProgressIndicator?.destroy();
    this.layoutManager?.destroy();

    this.renderer.destroy();
    this.canvas.remove();
    this.diagram = null;
    this.config = null;
    this.animationManager = null;
    this.scenarioRunner = null;
    this.controlBar = null;
    this.layoutManager = null;
    this.headerPanel = null;
    this.legendPanel = null;
    this.presetSelector = null;
    this.comparisonPanel = null;
    this.stepProgressIndicator = null;
    this.footerPanel = null;
    this.eventHandlers.clear();
  }

  /**
   * Get the layout manager
   */
  getLayoutManager(): LayoutManager | null {
    return this.layoutManager;
  }
}
