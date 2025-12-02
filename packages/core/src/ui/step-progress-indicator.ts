/**
 * Step Progress Indicator UI Component
 * Shows current step number, total steps, and branch path information
 */

/** Step progress info */
export interface StepProgressInfo {
  currentStep: number;
  totalSteps: number;
  scenarioName: string;
  stepLabel?: string;
  branchPath?: 'then' | 'else';
  isSubScenario?: boolean;
  parentScenarioName?: string;
}

/** Step Progress Indicator options */
export interface StepProgressIndicatorOptions {
  container: HTMLElement;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Step Progress Indicator for showing animation progress
 */
export class StepProgressIndicator {
  private container: HTMLElement;
  private element: HTMLElement;
  private position: string;
  private isVisible = false;

  constructor(options: StepProgressIndicatorOptions) {
    this.container = options.container;
    this.position = options.position || 'top-right';
    this.element = document.createElement('div');
    this.element.className = 'animflow-step-progress';
    this.addStyles();
    this.render();
  }

  /**
   * Add CSS styles
   */
  private addStyles(): void {
    const styleId = 'animflow-step-progress-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .animflow-step-progress {
        position: absolute;
        z-index: 100;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        min-width: 180px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.2s ease, transform 0.2s ease;
        pointer-events: none;
      }

      .animflow-step-progress.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .animflow-step-progress.top-left {
        top: 16px;
        left: 16px;
      }

      .animflow-step-progress.top-right {
        top: 16px;
        right: 16px;
      }

      .animflow-step-progress.bottom-left {
        bottom: 16px;
        left: 16px;
      }

      .animflow-step-progress.bottom-right {
        bottom: 16px;
        right: 16px;
      }

      .animflow-step-progress__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }

      .animflow-step-progress__scenario {
        font-weight: 600;
        font-size: 14px;
        color: #a78bfa;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .animflow-step-progress__counter {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .animflow-step-progress__step-num {
        font-size: 18px;
        font-weight: 700;
        color: #60a5fa;
      }

      .animflow-step-progress__step-total {
        font-size: 13px;
        color: #94a3b8;
      }

      .animflow-step-progress__bar {
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
        margin: 8px 0;
      }

      .animflow-step-progress__bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #60a5fa, #a78bfa);
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .animflow-step-progress__label {
        font-size: 12px;
        color: #e2e8f0;
        margin-top: 6px;
      }

      .animflow-step-progress__branch {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .animflow-step-progress__branch--then {
        background: rgba(34, 197, 94, 0.2);
        color: #4ade80;
      }

      .animflow-step-progress__branch--else {
        background: rgba(251, 146, 60, 0.2);
        color: #fb923c;
      }

      .animflow-step-progress__sub-scenario {
        margin-top: 6px;
        padding: 4px 8px;
        background: rgba(139, 92, 246, 0.2);
        border-radius: 4px;
        font-size: 11px;
        color: #c4b5fd;
      }

      .animflow-step-progress__sub-scenario::before {
        content: '↳ ';
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Render the indicator (initially hidden)
   */
  private render(): void {
    this.element.classList.add(this.position);
    this.element.innerHTML = `
      <div class="animflow-step-progress__header">
        <span class="animflow-step-progress__scenario">-</span>
        <div class="animflow-step-progress__counter">
          <span class="animflow-step-progress__step-num">0</span>
          <span class="animflow-step-progress__step-total">/ 0</span>
        </div>
      </div>
      <div class="animflow-step-progress__bar">
        <div class="animflow-step-progress__bar-fill" style="width: 0%"></div>
      </div>
      <div class="animflow-step-progress__label"></div>
    `;
    this.container.style.position = 'relative';
    this.container.appendChild(this.element);
  }

  /**
   * Update progress display
   */
  update(info: StepProgressInfo): void {
    const scenarioEl = this.element.querySelector('.animflow-step-progress__scenario');
    const stepNumEl = this.element.querySelector('.animflow-step-progress__step-num');
    const stepTotalEl = this.element.querySelector('.animflow-step-progress__step-total');
    const barFillEl = this.element.querySelector('.animflow-step-progress__bar-fill') as HTMLElement;
    const labelEl = this.element.querySelector('.animflow-step-progress__label');

    if (scenarioEl) scenarioEl.textContent = info.scenarioName;
    if (stepNumEl) stepNumEl.textContent = String(info.currentStep);
    if (stepTotalEl) stepTotalEl.textContent = `/ ${info.totalSteps}`;

    const progress = info.totalSteps > 0
      ? ((info.currentStep / info.totalSteps) * 100).toFixed(0)
      : 0;
    if (barFillEl) barFillEl.style.width = `${progress}%`;

    // Build label content
    let labelContent = '';
    if (info.stepLabel) {
      labelContent = info.stepLabel;
    }

    // Add branch indicator
    if (info.branchPath) {
      const branchClass = info.branchPath === 'then'
        ? 'animflow-step-progress__branch--then'
        : 'animflow-step-progress__branch--else';
      const branchIcon = info.branchPath === 'then' ? '✓' : '✗';
      const branchText = info.branchPath === 'then' ? 'Condition True' : 'Condition False';
      labelContent += `<div class="animflow-step-progress__branch ${branchClass}">${branchIcon} ${branchText}</div>`;
    }

    // Add sub-scenario indicator
    if (info.isSubScenario && info.parentScenarioName) {
      labelContent += `<div class="animflow-step-progress__sub-scenario">from ${info.parentScenarioName}</div>`;
    }

    if (labelEl) labelEl.innerHTML = labelContent;
  }

  /**
   * Show the indicator
   */
  show(): void {
    if (!this.isVisible) {
      this.isVisible = true;
      this.element.classList.add('visible');
    }
  }

  /**
   * Hide the indicator
   */
  hide(): void {
    if (this.isVisible) {
      this.isVisible = false;
      this.element.classList.remove('visible');
    }
  }

  /**
   * Destroy the indicator
   */
  destroy(): void {
    this.element.remove();
  }
}
