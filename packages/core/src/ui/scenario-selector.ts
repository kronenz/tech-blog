/**
 * Scenario Selector UI Component
 */

/** Scenario info for display */
export interface ScenarioInfo {
  id: string;
  name: string;
  description?: string;
  default?: boolean;
}

/** Scenario selector options */
export interface ScenarioSelectorOptions {
  container: HTMLElement;
  scenarios: ScenarioInfo[];
  onSelect?: (scenarioId: string) => void;
}

/**
 * Scenario Selector component for choosing scenarios
 */
export class ScenarioSelector {
  private container: HTMLElement;
  private element: HTMLElement;
  private options: ScenarioSelectorOptions;
  private selectedId: string | null = null;

  constructor(options: ScenarioSelectorOptions) {
    this.options = options;
    this.container = options.container;
    this.element = document.createElement('div');
    this.element.className = 'animflow-scenario-selector';

    // Find default scenario
    const defaultScenario = options.scenarios.find((s) => s.default);
    this.selectedId = defaultScenario?.id || options.scenarios[0]?.id || null;

    this.render();
    this.addStyles();
  }

  /**
   * Render the scenario selector
   */
  private render(): void {
    const { scenarios } = this.options;

    if (scenarios.length === 0) {
      this.element.innerHTML = '<span class="animflow-scenario-empty">No scenarios</span>';
      this.container.appendChild(this.element);
      return;
    }

    const buttons = scenarios
      .map(
        (s) => `
        <button
          class="animflow-scenario-btn ${s.id === this.selectedId ? 'selected' : ''}"
          data-scenario-id="${s.id}"
          title="${s.description || s.name}"
          type="button"
        >
          ${s.name}
        </button>
      `
      )
      .join('');

    this.element.innerHTML = `
      <div class="animflow-scenario-label">Scenario:</div>
      <div class="animflow-scenario-buttons">
        ${buttons}
      </div>
    `;

    this.bindEvents();
    this.container.appendChild(this.element);
  }

  /**
   * Bind click events
   */
  private bindEvents(): void {
    const buttons = this.element.querySelectorAll('.animflow-scenario-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const scenarioId = target.dataset.scenarioId;
        if (scenarioId) {
          this.select(scenarioId);
        }
      });
    });
  }

  /**
   * Select a scenario
   */
  select(scenarioId: string): void {
    this.selectedId = scenarioId;

    // Update button states
    const buttons = this.element.querySelectorAll('.animflow-scenario-btn');
    buttons.forEach((btn) => {
      const btnElement = btn as HTMLElement;
      if (btnElement.dataset.scenarioId === scenarioId) {
        btnElement.classList.add('selected');
      } else {
        btnElement.classList.remove('selected');
      }
    });

    this.options.onSelect?.(scenarioId);
  }

  /**
   * Get currently selected scenario ID
   */
  getSelectedId(): string | null {
    return this.selectedId;
  }

  /**
   * Add CSS styles
   */
  private addStyles(): void {
    const styleId = 'animflow-scenario-selector-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .animflow-scenario-selector {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: #f1f5f9;
        border-radius: 6px;
      }

      .animflow-scenario-label {
        font-size: 13px;
        font-weight: 500;
        color: #64748b;
      }

      .animflow-scenario-buttons {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .animflow-scenario-btn {
        padding: 6px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: white;
        font-size: 13px;
        color: #475569;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .animflow-scenario-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }

      .animflow-scenario-btn.selected {
        background: #4f46e5;
        border-color: #4f46e5;
        color: white;
      }

      .animflow-scenario-btn.selected:hover {
        background: #4338ca;
        border-color: #4338ca;
      }

      .animflow-scenario-empty {
        font-size: 13px;
        color: #94a3b8;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Update scenarios list
   */
  updateScenarios(scenarios: ScenarioInfo[]): void {
    this.options.scenarios = scenarios;
    this.element.innerHTML = '';
    this.render();
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.element.remove();
  }
}
