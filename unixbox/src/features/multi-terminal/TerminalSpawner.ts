/**
 * TerminalSpawner - UI component for spawning new terminals
 *
 * Adds "+ New TTY" button to status bar and shows active terminal count.
 */

import { MultiTerminalManager } from './MultiTerminalManager';

export class TerminalSpawner {
  private manager: MultiTerminalManager;
  private statusBarElement: HTMLElement | null = null;
  private spawnButton: HTMLButtonElement | null = null;
  private countDisplay: HTMLSpanElement | null = null;

  constructor(manager: MultiTerminalManager) {
    this.manager = manager;
  }

  /**
   * Inject UI elements into the status bar
   */
  injectUI(): void {
    this.statusBarElement = document.getElementById('status-bar');

    if (!this.statusBarElement) {
      console.error('[TerminalSpawner] Status bar not found');
      return;
    }

    // Create spawn button
    this.spawnButton = this.createSpawnButton();

    // Create count display
    this.countDisplay = this.createCountDisplay();

    // Create container for multi-terminal controls
    const container = document.createElement('div');
    container.className = 'status-item multi-terminal-controls';
    container.style.marginLeft = 'auto';
    container.appendChild(this.countDisplay);
    container.appendChild(this.spawnButton);

    // Add to status bar
    this.statusBarElement.appendChild(container);

    console.log('[TerminalSpawner] UI injected');
  }

  /**
   * Create the spawn button
   */
  private createSpawnButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'spawn-tty-btn';
    button.textContent = '+ New TTY';
    button.title = 'Open new terminal in new tab';
    button.style.cssText = `
      background: #001a00;
      border: 2px solid #00ff00;
      color: #00ff00;
      padding: 0.4rem 0.8rem;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
      margin-left: 0.5rem;
    `;

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.background = '#003300';
      button.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.6)';
      button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#001a00';
      button.style.boxShadow = 'none';
      button.style.transform = 'translateY(0)';
    });

    // Click handler
    button.addEventListener('click', () => {
      this.handleSpawnClick();
    });

    return button;
  }

  /**
   * Create the terminal count display
   */
  private createCountDisplay(): HTMLSpanElement {
    const container = document.createElement('div');
    container.className = 'status-item';

    const label = document.createElement('span');
    label.className = 'status-label';
    label.textContent = 'Active TTYs:';

    const value = document.createElement('span');
    value.className = 'status-value';
    value.id = 'active-tty-count';
    value.textContent = '1';

    container.appendChild(label);
    container.appendChild(value);

    return container as HTMLSpanElement;
  }

  /**
   * Handle spawn button click
   */
  private handleSpawnClick(): void {
    const windowRef = this.manager.spawnTerminal();

    if (windowRef) {
      // Update count
      this.updateCount();

      // Flash button feedback
      if (this.spawnButton) {
        this.spawnButton.style.background = '#00ff00';
        this.spawnButton.style.color = '#000';
        setTimeout(() => {
          if (this.spawnButton) {
            this.spawnButton.style.background = '#001a00';
            this.spawnButton.style.color = '#00ff00';
          }
        }, 200);
      }
    }
  }

  /**
   * Update the terminal count display
   */
  updateCount(): void {
    const count = this.manager.getActiveCount();
    const countElement = document.getElementById('active-tty-count');

    if (countElement) {
      countElement.textContent = count.toString();

      // Flash the count
      countElement.style.color = '#ffff00';
      setTimeout(() => {
        if (countElement) {
          countElement.style.color = '#00ff00';
        }
      }, 300);
    }
  }

  /**
   * Enable/disable spawn button
   */
  setEnabled(enabled: boolean): void {
    if (this.spawnButton) {
      this.spawnButton.disabled = !enabled;
      this.spawnButton.style.opacity = enabled ? '1' : '0.5';
      this.spawnButton.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
  }

  /**
   * Show notification about terminal spawning
   */
  showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 26, 0, 0.95);
      border: 2px solid #00ff00;
      border-radius: 8px;
      padding: 1.5rem 2rem;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 1rem;
      z-index: 10000;
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.6);
      text-align: center;
      pointer-events: none;
      animation: fadeInOut 2s ease-in-out;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      }
    `;
    document.head.appendChild(style);

    // Remove after animation
    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 2000);
  }

  /**
   * Clean up UI elements
   */
  destroy(): void {
    if (this.spawnButton && this.spawnButton.parentNode) {
      this.spawnButton.parentNode.removeChild(this.spawnButton);
    }

    if (this.countDisplay && this.countDisplay.parentNode) {
      this.countDisplay.parentNode.removeChild(this.countDisplay);
    }

    console.log('[TerminalSpawner] UI destroyed');
  }
}
