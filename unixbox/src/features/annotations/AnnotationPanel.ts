/**
 * AnnotationPanel - UI component for displaying syscall annotations
 *
 * Provides a visual panel with green-on-black terminal aesthetic
 * for displaying educational content about Unix V5 system calls.
 */

import type { SyscallAnnotation } from './AnnotationEngine';

export class AnnotationPanel {
  private container: HTMLElement;
  private panelElement: HTMLElement | null = null;
  private isVisible: boolean = false;
  private currentAnnotation: SyscallAnnotation | null = null;

  constructor(containerId: string = 'annotation-panel-container') {
    // Find or create container
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    this.container = container;
    this.createPanel();
  }

  /**
   * Create the panel DOM structure
   */
  private createPanel(): void {
    // Main panel container
    const panel = document.createElement('div');
    panel.className = 'annotation-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 450px;
      max-height: 80vh;
      background-color: #001100;
      border: 2px solid #00ff00;
      border-radius: 4px;
      padding: 0;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #00ff00;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
      z-index: 1000;
      display: none;
      overflow: hidden;
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'annotation-panel-header';
    header.style.cssText = `
      background-color: #003300;
      padding: 10px 15px;
      border-bottom: 1px solid #00ff00;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const title = document.createElement('div');
    title.className = 'annotation-panel-title';
    title.style.cssText = `
      font-weight: bold;
      font-size: 14px;
      color: #00ff00;
    `;
    title.textContent = 'UNIX V5 System Call';

    const closeButton = document.createElement('button');
    closeButton.className = 'annotation-panel-close';
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      background: none;
      border: 1px solid #00ff00;
      color: #00ff00;
      width: 24px;
      height: 24px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 0;
      transition: all 0.2s;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.backgroundColor = '#00ff00';
      closeButton.style.color = '#001100';
    };
    closeButton.onmouseout = () => {
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.color = '#00ff00';
    };
    closeButton.onclick = () => this.hide();

    header.appendChild(title);
    header.appendChild(closeButton);

    // Content area
    const content = document.createElement('div');
    content.className = 'annotation-panel-content';
    content.style.cssText = `
      padding: 15px;
      max-height: calc(80vh - 60px);
      overflow-y: auto;
      line-height: 1.5;
    `;

    // Custom scrollbar styling
    content.innerHTML = `
      <style>
        .annotation-panel-content::-webkit-scrollbar {
          width: 8px;
        }
        .annotation-panel-content::-webkit-scrollbar-track {
          background: #001100;
        }
        .annotation-panel-content::-webkit-scrollbar-thumb {
          background: #00ff00;
          border-radius: 4px;
        }
        .annotation-panel-content::-webkit-scrollbar-thumb:hover {
          background: #00cc00;
        }
      </style>
    `;

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(content);

    this.container.appendChild(panel);
    this.panelElement = panel;
  }

  /**
   * Display an annotation
   */
  displayAnnotation(annotation: SyscallAnnotation): void {
    if (!this.panelElement) {
      console.error('[AnnotationPanel] Panel not initialized');
      return;
    }

    this.currentAnnotation = annotation;

    const content = this.panelElement.querySelector('.annotation-panel-content');
    if (!content) {
      console.error('[AnnotationPanel] Content element not found');
      return;
    }

    // Build the content HTML
    const html = `
      ${content.querySelector('style')?.outerHTML || ''}

      <div style="margin-bottom: 15px;">
        <div style="color: #00ff00; font-weight: bold; font-size: 16px; margin-bottom: 5px;">
          ${this.escapeHtml(annotation.name)}()
        </div>
        <div style="color: #00cc00; font-size: 12px; font-family: monospace; margin-bottom: 10px;">
          ${this.escapeHtml(annotation.signature)}
        </div>
        <div style="color: #00ff00; line-height: 1.6;">
          ${this.escapeHtml(annotation.description)}
        </div>
      </div>

      <div style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;"
             onclick="this.parentElement.querySelector('.implementation-details').style.display =
                      this.parentElement.querySelector('.implementation-details').style.display === 'none' ? 'block' : 'none';
                      this.querySelector('.expand-icon').textContent =
                      this.parentElement.querySelector('.implementation-details').style.display === 'none' ? '▶' : '▼';">
          <span class="expand-icon" style="color: #00ff00; margin-right: 8px; font-size: 12px;">▼</span>
          <span style="color: #00ff00; font-weight: bold; text-decoration: underline;">Implementation Details</span>
        </div>
        <div class="implementation-details" style="color: #00dd00; line-height: 1.6; padding-left: 20px;">
          ${this.escapeHtml(annotation.implementation)}
        </div>
      </div>

      ${annotation.codeSnippet ? `
        <div style="margin-bottom: 15px;">
          <div style="color: #00ff00; font-weight: bold; margin-bottom: 8px;">Code Snippet:</div>
          <pre style="background-color: #002200; border: 1px solid #00ff00; border-radius: 3px; padding: 10px; margin: 0; overflow-x: auto; font-size: 11px; line-height: 1.4; color: #00dd00;"><code>${this.escapeHtml(annotation.codeSnippet)}</code></pre>
        </div>
      ` : ''}

      <div style="background-color: #002200; border-left: 3px solid #00ff00; padding: 10px; margin-top: 15px;">
        <div style="color: #00ff00; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;">
          <span style="margin-right: 8px; font-size: 16px;">📜</span>
          <span>Historical Note</span>
        </div>
        <div style="color: #00dd00; line-height: 1.6; font-style: italic;">
          ${this.escapeHtml(annotation.historicalNote)}
        </div>
      </div>
    `;

    content.innerHTML = html;

    this.show();
  }

  /**
   * Show the panel
   */
  show(): void {
    if (this.panelElement) {
      this.panelElement.style.display = 'block';
      this.isVisible = true;

      // Add fade-in animation
      this.panelElement.style.opacity = '0';
      this.panelElement.style.transform = 'translateX(20px)';
      this.panelElement.style.transition = 'opacity 0.3s, transform 0.3s';

      setTimeout(() => {
        if (this.panelElement) {
          this.panelElement.style.opacity = '1';
          this.panelElement.style.transform = 'translateX(0)';
        }
      }, 10);
    }
  }

  /**
   * Hide the panel
   */
  hide(): void {
    if (this.panelElement) {
      // Fade out animation
      this.panelElement.style.opacity = '0';
      this.panelElement.style.transform = 'translateX(20px)';

      setTimeout(() => {
        if (this.panelElement) {
          this.panelElement.style.display = 'none';
          this.isVisible = false;
        }
      }, 300);
    }
  }

  /**
   * Toggle panel visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else if (this.currentAnnotation) {
      this.show();
    }
  }

  /**
   * Check if panel is visible
   */
  visible(): boolean {
    return this.isVisible;
  }

  /**
   * Get the current annotation being displayed
   */
  getCurrentAnnotation(): SyscallAnnotation | null {
    return this.currentAnnotation;
  }

  /**
   * Clear the panel content
   */
  clear(): void {
    const content = this.panelElement?.querySelector('.annotation-panel-content');
    if (content) {
      content.innerHTML = '<div style="color: #00ff00; text-align: center; padding: 20px;">No annotation selected</div>';
    }
    this.currentAnnotation = null;
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
   * Destroy the panel and clean up
   */
  destroy(): void {
    if (this.panelElement) {
      this.panelElement.remove();
      this.panelElement = null;
    }
  }

  /**
   * Set panel position
   */
  setPosition(top?: string, right?: string, bottom?: string, left?: string): void {
    if (!this.panelElement) return;

    if (top !== undefined) this.panelElement.style.top = top;
    if (right !== undefined) this.panelElement.style.right = right;
    if (bottom !== undefined) this.panelElement.style.bottom = bottom;
    if (left !== undefined) this.panelElement.style.left = left;
  }

  /**
   * Set panel width
   */
  setWidth(width: string): void {
    if (this.panelElement) {
      this.panelElement.style.width = width;
    }
  }
}

/**
 * Create and export a singleton instance
 */
export const annotationPanel = new AnnotationPanel();
