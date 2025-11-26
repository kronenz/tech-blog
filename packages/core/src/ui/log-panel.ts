/**
 * Log Panel UI Component
 */

import type { LogEntry, LogMessageType } from '../types';
import { DEFAULT_MAX_LOG_ENTRIES, DEFAULT_LOG_TITLE } from '../types';

/** Log panel options */
export interface LogPanelOptions {
  container: HTMLElement;
  title?: string;
  maxEntries?: number;
  showTimestamp?: boolean;
}

/**
 * Log Panel for displaying system messages
 */
export class LogPanel {
  private container: HTMLElement;
  private element: HTMLElement;
  private contentEl: HTMLElement | null = null;
  private options: LogPanelOptions;
  private entries: LogEntry[] = [];
  private maxEntries: number;
  private showTimestamp: boolean;
  private startTime: number;

  constructor(options: LogPanelOptions) {
    this.options = options;
    this.container = options.container;
    this.maxEntries = options.maxEntries ?? DEFAULT_MAX_LOG_ENTRIES;
    this.showTimestamp = options.showTimestamp !== false;
    this.startTime = Date.now();

    this.element = document.createElement('div');
    this.element.className = 'animflow-log-panel';

    this.render();
    this.addStyles();
  }

  /**
   * Render the log panel
   */
  private render(): void {
    const title = this.options.title || DEFAULT_LOG_TITLE;

    this.element.innerHTML = `
      <div class="animflow-log-header">
        <span class="animflow-log-title">${title}</span>
        <button class="animflow-log-clear" type="button" title="Clear logs">Clear</button>
      </div>
      <div class="animflow-log-content"></div>
    `;

    this.contentEl = this.element.querySelector('.animflow-log-content');

    // Bind clear button
    const clearBtn = this.element.querySelector('.animflow-log-clear');
    clearBtn?.addEventListener('click', () => this.clear());

    this.container.appendChild(this.element);
  }

  /**
   * Add a log entry
   */
  log(message: string, type: LogMessageType = 'info'): void {
    const entry: LogEntry = {
      timestamp: Date.now() - this.startTime,
      message,
      type,
    };

    this.entries.push(entry);

    // Remove oldest entries if exceeding max
    while (this.entries.length > this.maxEntries) {
      this.entries.shift();
      this.removeOldestEntry();
    }

    this.addEntryToDOM(entry);
    this.scrollToBottom();
  }

  /**
   * Add entry to DOM
   */
  private addEntryToDOM(entry: LogEntry): void {
    if (!this.contentEl) return;

    const entryEl = document.createElement('div');
    entryEl.className = `animflow-log-entry animflow-log-${entry.type}`;

    const timestampHtml = this.showTimestamp
      ? `<span class="animflow-log-timestamp">[${this.formatTimestamp(entry.timestamp)}]</span>`
      : '';

    entryEl.innerHTML = `
      ${timestampHtml}
      <span class="animflow-log-message">${this.escapeHtml(entry.message)}</span>
    `;

    this.contentEl.appendChild(entryEl);
  }

  /**
   * Remove oldest entry from DOM
   */
  private removeOldestEntry(): void {
    if (!this.contentEl) return;
    const firstEntry = this.contentEl.querySelector('.animflow-log-entry');
    firstEntry?.remove();
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = ms % 1000;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(3, '0').slice(0, 2)}`;
    }
    return `${seconds}.${remainingMs.toString().padStart(3, '0').slice(0, 2)}s`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Scroll to bottom of log content
   */
  private scrollToBottom(): void {
    if (this.contentEl) {
      this.contentEl.scrollTop = this.contentEl.scrollHeight;
    }
  }

  /**
   * Clear all log entries
   */
  clear(): void {
    this.entries = [];
    if (this.contentEl) {
      this.contentEl.innerHTML = '';
    }
    this.resetTimer();
  }

  /**
   * Reset the timer
   */
  resetTimer(): void {
    this.startTime = Date.now();
  }

  /**
   * Get all entries
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Add CSS styles
   */
  private addStyles(): void {
    const styleId = 'animflow-log-panel-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .animflow-log-panel {
        background: #1e293b;
        border-radius: 8px;
        overflow: hidden;
        min-width: 300px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }

      .animflow-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: #0f172a;
        border-bottom: 1px solid #334155;
      }

      .animflow-log-title {
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .animflow-log-clear {
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        background: #334155;
        color: #94a3b8;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .animflow-log-clear:hover {
        background: #475569;
        color: #e2e8f0;
      }

      .animflow-log-content {
        max-height: 200px;
        overflow-y: auto;
        padding: 8px 0;
      }

      .animflow-log-entry {
        padding: 4px 14px;
        font-size: 12px;
        line-height: 1.5;
        animation: animflow-log-slide-in 0.2s ease;
      }

      @keyframes animflow-log-slide-in {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animflow-log-timestamp {
        color: #64748b;
        margin-right: 8px;
      }

      .animflow-log-message {
        color: #e2e8f0;
      }

      .animflow-log-info .animflow-log-message {
        color: #93c5fd;
      }

      .animflow-log-success .animflow-log-message {
        color: #86efac;
      }

      .animflow-log-warning .animflow-log-message {
        color: #fcd34d;
      }

      .animflow-log-error .animflow-log-message {
        color: #fca5a5;
      }

      /* Scrollbar styling */
      .animflow-log-content::-webkit-scrollbar {
        width: 6px;
      }

      .animflow-log-content::-webkit-scrollbar-track {
        background: #1e293b;
      }

      .animflow-log-content::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 3px;
      }

      .animflow-log-content::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.element.remove();
  }
}
