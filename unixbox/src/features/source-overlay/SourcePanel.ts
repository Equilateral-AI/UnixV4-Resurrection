/**
 * SourcePanel.ts
 * UI component for displaying Unix V4 source code overlay
 *
 * Vanilla TypeScript/JavaScript implementation (no React)
 * Green-on-black terminal aesthetic matching UnixBox theme
 */

import { SourceCodeEntry, sourceOverlay } from './SourceOverlay';

export interface SourcePanelOptions {
  container?: HTMLElement;
  width?: string;
  height?: string;
  position?: 'left' | 'right' | 'bottom';
  autoShow?: boolean;
}

export class SourcePanel {
  private container: HTMLElement;
  private panelElement: HTMLElement | null = null;
  private headerElement: HTMLElement | null = null;
  private codeElement: HTMLElement | null = null;
  private closeButton: HTMLElement | null = null;
  private isVisible: boolean = false;
  // private currentEntry: SourceCodeEntry | null = null; // For future use
  private options: Required<SourcePanelOptions>;
  private highlightedLine: number | null = null;

  constructor(options: SourcePanelOptions = {}) {
    this.options = {
      container: options.container || document.body,
      width: options.width || '600px',
      height: options.height || '400px',
      position: options.position || 'right',
      autoShow: options.autoShow !== undefined ? options.autoShow : true
    };

    this.container = this.options.container;
    this.createPanel();
    this.attachStyles();
  }

  /**
   * Create the panel DOM structure
   */
  private createPanel(): void {
    // Main panel container
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'unixbox-source-panel';
    this.panelElement.style.display = 'none';

    // Header
    this.headerElement = document.createElement('div');
    this.headerElement.className = 'source-panel-header';

    const title = document.createElement('div');
    title.className = 'source-panel-title';
    title.textContent = 'Unix V4 Source Code';

    this.closeButton = document.createElement('button');
    this.closeButton.className = 'source-panel-close';
    this.closeButton.innerHTML = '&times;';
    this.closeButton.onclick = () => this.hide();

    this.headerElement.appendChild(title);
    this.headerElement.appendChild(this.closeButton);

    // Code container with scrolling
    const codeContainer = document.createElement('div');
    codeContainer.className = 'source-panel-code-container';

    this.codeElement = document.createElement('pre');
    this.codeElement.className = 'source-panel-code';

    codeContainer.appendChild(this.codeElement);

    // Assemble panel
    this.panelElement.appendChild(this.headerElement);
    this.panelElement.appendChild(codeContainer);

    this.container.appendChild(this.panelElement);
  }

  /**
   * Inject CSS styles for the panel
   */
  private attachStyles(): void {
    const styleId = 'unixbox-source-panel-styles';
    if (document.getElementById(styleId)) {
      return; // Already attached
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .unixbox-source-panel {
        position: fixed;
        ${this.getPositionStyles()}
        width: ${this.options.width};
        height: ${this.options.height};
        background-color: #000000;
        color: #00ff00;
        border: 2px solid #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        resize: both;
        overflow: hidden;
      }

      .source-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: #003300;
        border-bottom: 1px solid #00ff00;
        user-select: none;
        cursor: move;
      }

      .source-panel-title {
        font-weight: bold;
        color: #00ff00;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 11px;
      }

      .source-panel-close {
        background: none;
        border: 1px solid #00ff00;
        color: #00ff00;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        line-height: 20px;
        text-align: center;
        transition: all 0.2s;
      }

      .source-panel-close:hover {
        background-color: #00ff00;
        color: #000000;
      }

      .source-panel-code-container {
        flex: 1;
        overflow: auto;
        padding: 12px;
        background-color: #000000;
      }

      .source-panel-code {
        margin: 0;
        padding: 0;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre;
        overflow-x: auto;
      }

      .source-line {
        display: block;
        padding: 2px 0;
      }

      .source-line-number {
        display: inline-block;
        width: 50px;
        color: #00aa00;
        text-align: right;
        margin-right: 12px;
        user-select: none;
        border-right: 1px solid #003300;
        padding-right: 8px;
      }

      .source-line-content {
        color: #00ff00;
      }

      .source-line-comment {
        color: #00aa00;
        font-style: italic;
      }

      .source-line-label {
        color: #00ffaa;
        font-weight: bold;
      }

      .source-line-highlighted {
        background-color: #003300;
        border-left: 3px solid #00ff00;
        padding-left: 4px;
      }

      .source-panel-metadata {
        padding: 8px 12px;
        background-color: #001100;
        border-bottom: 1px solid #003300;
        font-size: 11px;
      }

      .source-panel-file {
        color: #00ffaa;
        font-weight: bold;
      }

      .source-panel-description {
        color: #00aa00;
        margin-top: 4px;
      }

      .source-panel-note {
        color: #ffaa00;
        margin-top: 4px;
        font-style: italic;
      }

      /* Scrollbar styling for terminal aesthetic */
      .source-panel-code-container::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }

      .source-panel-code-container::-webkit-scrollbar-track {
        background: #000000;
        border: 1px solid #003300;
      }

      .source-panel-code-container::-webkit-scrollbar-thumb {
        background: #00ff00;
        border: 1px solid #000000;
      }

      .source-panel-code-container::-webkit-scrollbar-thumb:hover {
        background: #00ffaa;
      }

      /* Animation for showing/hiding */
      @keyframes sourceSlideIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .unixbox-source-panel[data-visible="true"] {
        animation: sourceSlideIn 0.3s ease-out;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Get position-specific CSS styles
   */
  private getPositionStyles(): string {
    switch (this.options.position) {
      case 'left':
        return 'top: 80px; left: 20px;';
      case 'right':
        return 'top: 80px; right: 20px;';
      case 'bottom':
        return 'bottom: 20px; left: 50%; transform: translateX(-50%);';
      default:
        return 'top: 80px; right: 20px;';
    }
  }

  /**
   * Show the panel
   */
  public show(): void {
    if (this.panelElement) {
      this.panelElement.style.display = 'flex';
      this.panelElement.setAttribute('data-visible', 'true');
      this.isVisible = true;
    }
  }

  /**
   * Hide the panel
   */
  public hide(): void {
    if (this.panelElement) {
      this.panelElement.style.display = 'none';
      this.panelElement.setAttribute('data-visible', 'false');
      this.isVisible = false;
    }
  }

  /**
   * Toggle panel visibility
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update the displayed source code
   */
  public updateSource(entry: SourceCodeEntry | null, highlightLine?: number): void {
    if (!entry || !this.codeElement || !this.headerElement) {
      return;
    }

    // this.currentEntry = entry; // Store for future use
    this.highlightedLine = highlightLine || null;

    // Update header with metadata
    const metadata = document.createElement('div');
    metadata.className = 'source-panel-metadata';

    const fileInfo = document.createElement('div');
    fileInfo.className = 'source-panel-file';
    fileInfo.textContent = `File: ${entry.file} (line ${entry.startLine})`;
    metadata.appendChild(fileInfo);

    const description = document.createElement('div');
    description.className = 'source-panel-description';
    description.textContent = entry.description;
    metadata.appendChild(description);

    if (entry.note) {
      const note = document.createElement('div');
      note.className = 'source-panel-note';
      note.textContent = `Note: ${entry.note}`;
      metadata.appendChild(note);
    }

    // Remove old metadata if exists
    const oldMetadata = this.panelElement?.querySelector('.source-panel-metadata');
    if (oldMetadata) {
      oldMetadata.remove();
    }

    // Insert new metadata after header
    if (this.panelElement) {
      this.panelElement.insertBefore(metadata, this.headerElement.nextSibling);
    }

    // Format and display code
    const formattedLines = sourceOverlay.formatSourceCode(entry);
    this.codeElement.innerHTML = '';

    formattedLines.forEach(line => {
      const lineElement = document.createElement('div');
      lineElement.className = 'source-line';

      if (line.lineNumber === this.highlightedLine) {
        lineElement.classList.add('source-line-highlighted');
      }

      const lineNumber = document.createElement('span');
      lineNumber.className = 'source-line-number';
      lineNumber.textContent = String(line.lineNumber);

      const lineContent = document.createElement('span');
      lineContent.className = `source-line-content source-line-${line.type}`;
      lineContent.textContent = line.content;

      lineElement.appendChild(lineNumber);
      lineElement.appendChild(lineContent);
      this.codeElement?.appendChild(lineElement);
    });

    // Auto-show if configured
    if (this.options.autoShow && !this.isVisible) {
      this.show();
    }

    // Scroll to highlighted line
    if (this.highlightedLine !== null) {
      this.scrollToLine(this.highlightedLine);
    }
  }

  /**
   * Highlight a specific line number
   */
  public highlightLine(lineNumber: number): void {
    this.highlightedLine = lineNumber;

    if (!this.codeElement) {
      return;
    }

    // Remove previous highlights
    const highlighted = this.codeElement.querySelectorAll('.source-line-highlighted');
    highlighted.forEach(el => el.classList.remove('source-line-highlighted'));

    // Add new highlight
    const lines = this.codeElement.querySelectorAll('.source-line');
    lines.forEach(line => {
      const lineNum = line.querySelector('.source-line-number');
      if (lineNum && parseInt(lineNum.textContent || '0') === lineNumber) {
        line.classList.add('source-line-highlighted');
      }
    });

    this.scrollToLine(lineNumber);
  }

  /**
   * Scroll to a specific line number
   */
  private scrollToLine(lineNumber: number): void {
    if (!this.codeElement) {
      return;
    }

    const targetLine = Array.from(this.codeElement.querySelectorAll('.source-line')).find(line => {
      const lineNum = line.querySelector('.source-line-number');
      return lineNum && parseInt(lineNum.textContent || '0') === lineNumber;
    });

    if (targetLine) {
      targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Make the panel draggable
   */
  public enableDragging(): void {
    if (!this.headerElement || !this.panelElement) {
      return;
    }

    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;

    const dragStart = (e: MouseEvent) => {
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
      isDragging = true;
      this.headerElement!.style.cursor = 'grabbing';
    };

    const drag = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        if (this.panelElement) {
          this.panelElement.style.left = currentX + 'px';
          this.panelElement.style.top = currentY + 'px';
          this.panelElement.style.right = 'auto';
        }
      }
    };

    const dragEnd = () => {
      isDragging = false;
      this.headerElement!.style.cursor = 'move';
    };

    this.headerElement.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
  }

  /**
   * Get current visibility state
   */
  public isShown(): boolean {
    return this.isVisible;
  }

  /**
   * Destroy the panel and clean up
   */
  public destroy(): void {
    if (this.panelElement) {
      this.panelElement.remove();
      this.panelElement = null;
    }

    const styles = document.getElementById('unixbox-source-panel-styles');
    if (styles) {
      styles.remove();
    }
  }
}
