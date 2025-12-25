/**
 * Era Selector - UI Component for Time Machine
 *
 * Renders the era selection tabs in the header and handles user interactions.
 */

import { TimeMachine, EraConfig } from './TimeMachine';

export interface EraSelectorOptions {
  containerId: string;
  timeMachine: TimeMachine;
  onEraSwitch?: (eraId: string) => void;
}

/**
 * EraSelector creates and manages the era selection UI
 */
export class EraSelector {
  private container: HTMLElement;
  private timeMachine: TimeMachine;
  private onEraSwitchCallback?: (eraId: string) => void;
  private switching = false;

  constructor(options: EraSelectorOptions) {
    const container = document.getElementById(options.containerId);
    if (!container) {
      throw new Error(`Container not found: ${options.containerId}`);
    }

    this.container = container;
    this.timeMachine = options.timeMachine;
    this.onEraSwitchCallback = options.onEraSwitch;

    this.render();
    this.attachEventListeners();

    // Listen for era changes to update UI
    this.timeMachine.onEraChange((eraId) => {
      this.updateActiveEra(eraId);
    });
  }

  /**
   * Render the era selector UI
   */
  private render(): void {
    const eras = this.timeMachine.getEras();
    const currentEraId = this.timeMachine.getCurrentEraId();

    // Create era selector container
    const selectorHTML = `
      <div class="era-selector">
        <div class="era-selector-label">
          <span class="time-machine-icon">⏰</span>
          <span>Time Machine:</span>
        </div>
        <div class="era-tabs">
          ${eras.map(era => this.renderEraTab(era, era.id === currentEraId)).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = selectorHTML;
  }

  /**
   * Render a single era tab
   */
  private renderEraTab(era: EraConfig, isActive: boolean): string {
    const activeClass = isActive ? 'active' : '';
    const isDisabled = (era as any).disabled || era.compressed;
    const disabledClass = isDisabled ? 'disabled' : '';
    const title = (era as any).disabledReason || (era.compressed ? 'V6 requires decompression (coming soon)' : era.notes);

    return `
      <button
        class="era-tab ${activeClass} ${disabledClass}"
        data-era-id="${era.id}"
        title="${title}"
        ${isDisabled ? 'disabled' : ''}
      >
        <div class="era-tab-year">${era.year}</div>
        <div class="era-tab-name">V${era.id.substring(1)}</div>
        ${isActive ? '<div class="era-tab-indicator">●</div>' : ''}
      </button>
    `;
  }

  /**
   * Attach event listeners to era tabs
   */
  private attachEventListeners(): void {
    const tabs = this.container.querySelectorAll('.era-tab:not(.disabled)');

    tabs.forEach(tab => {
      tab.addEventListener('click', async (e) => {
        e.preventDefault();

        if (this.switching) {
          console.log('[EraSelector] Already switching eras, please wait...');
          return;
        }

        const button = e.currentTarget as HTMLButtonElement;
        const eraId = button.dataset.eraId;

        if (!eraId) return;

        // Don't switch if already active
        if (button.classList.contains('active')) {
          return;
        }

        await this.switchToEra(eraId);
      });
    });
  }

  /**
   * Switch to a specific era
   */
  private async switchToEra(eraId: string): Promise<void> {
    if (this.switching) return;

    this.switching = true;

    // Show loading state
    this.setLoadingState(true);

    try {
      // Notify callback
      if (this.onEraSwitchCallback) {
        this.onEraSwitchCallback(eraId);
      }

      // Perform era switch
      await this.timeMachine.switchEra(eraId);

      console.log(`[EraSelector] Successfully switched to era: ${eraId}`);
    } catch (error) {
      console.error('[EraSelector] Era switch failed:', error);
      // Show error message
      this.showError('Failed to switch era. Please try again.');
    } finally {
      this.switching = false;
      this.setLoadingState(false);
    }
  }

  /**
   * Update the active era in the UI
   */
  private updateActiveEra(eraId: string): void {
    // Remove active class from all tabs
    const tabs = this.container.querySelectorAll('.era-tab');
    tabs.forEach(tab => {
      tab.classList.remove('active');
      // Remove indicator
      const indicator = tab.querySelector('.era-tab-indicator');
      if (indicator) {
        indicator.remove();
      }
    });

    // Add active class to selected tab
    const activeTab = this.container.querySelector(`[data-era-id="${eraId}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
      // Add indicator
      const indicator = document.createElement('div');
      indicator.className = 'era-tab-indicator';
      indicator.textContent = '●';
      activeTab.appendChild(indicator);
    }
  }

  /**
   * Set loading state for all tabs
   */
  private setLoadingState(loading: boolean): void {
    const tabs = this.container.querySelectorAll('.era-tab');
    tabs.forEach(tab => {
      if (loading) {
        tab.classList.add('loading');
        (tab as HTMLButtonElement).disabled = true;
      } else {
        tab.classList.remove('loading');
        const isCompressed = tab.classList.contains('disabled');
        (tab as HTMLButtonElement).disabled = isCompressed;
      }
    });
  }

  /**
   * Show error message to user
   */
  private showError(message: string): void {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'era-selector-error';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Refresh the UI
   */
  refresh(): void {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Get the current era ID
   */
  getCurrentEraId(): string {
    return this.timeMachine.getCurrentEraId();
  }
}

/**
 * Initialize CSS styles for the era selector
 */
export function initializeEraSelectorStyles(): void {
  if (document.getElementById('era-selector-styles')) {
    return; // Already initialized
  }

  const styles = `
    .era-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.75rem;
    }

    .era-selector-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #00cc00;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .time-machine-icon {
      font-size: 1.2rem;
      animation: pulse-icon 2s ease-in-out infinite;
    }

    @keyframes pulse-icon {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .era-tabs {
      display: flex;
      gap: 0.5rem;
    }

    .era-tab {
      background: rgba(0, 26, 0, 0.5);
      border: 2px solid rgba(0, 255, 0, 0.3);
      color: #00ff00;
      padding: 0.5rem 1rem;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.3s ease;
      text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
      position: relative;
      min-width: 80px;
      text-align: center;
    }

    .era-tab:hover:not(.disabled):not(.loading) {
      background: rgba(0, 51, 0, 0.8);
      border-color: #00ff00;
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
      transform: translateY(-2px);
    }

    .era-tab.active {
      background: rgba(0, 255, 0, 0.2);
      border-color: #00ff00;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
      font-weight: bold;
    }

    .era-tab.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      border-color: rgba(0, 255, 0, 0.2);
    }

    .era-tab.loading {
      opacity: 0.6;
      cursor: wait;
      animation: loading-pulse 1s ease-in-out infinite;
    }

    @keyframes loading-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.3; }
    }

    .era-tab-year {
      font-size: 0.75rem;
      color: #00cc00;
      margin-bottom: 0.25rem;
      opacity: 0.8;
    }

    .era-tab-name {
      font-size: 1rem;
      font-weight: bold;
      letter-spacing: 0.05em;
    }

    .era-tab-indicator {
      position: absolute;
      top: -8px;
      right: -8px;
      color: #00ff00;
      font-size: 1.2rem;
      animation: blink-indicator 1.5s ease-in-out infinite;
      text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
    }

    @keyframes blink-indicator {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .era-selector-error {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 51, 0, 0.95);
      color: #fff;
      padding: 1rem 2rem;
      border-radius: 8px;
      border: 2px solid #ff0000;
      box-shadow: 0 0 30px rgba(255, 51, 0, 0.6);
      z-index: 10000;
      font-family: 'Courier New', monospace;
      font-size: 1rem;
      animation: error-slide-in 0.3s ease-out;
    }

    @keyframes error-slide-in {
      from {
        opacity: 0;
        transform: translate(-50%, -60%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.id = 'era-selector-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
