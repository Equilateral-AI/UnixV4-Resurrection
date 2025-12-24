/**
 * SourceOverlay.ts
 * Manages the source code overlay for UnixBox educational features
 *
 * Subscribes to EducationalEngine events and provides source code
 * context for system calls and kernel operations.
 */

import sourceIndex from './source-index.json';

export interface SourceCodeEntry {
  file: string;
  description: string;
  startLine: number;
  code: string;
  note?: string;
  context?: string;
}

export interface SourceIndexData {
  syscalls: Record<string, SourceCodeEntry>;
  special: Record<string, any>;
  shell: Record<string, SourceCodeEntry>;
  metadata: {
    copyright: string;
    version: string;
    note: string;
  };
}

export class SourceOverlay {
  private sourceData: SourceIndexData;
  private currentSource: SourceCodeEntry | null = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.sourceData = sourceIndex as SourceIndexData;
  }

  /**
   * Subscribe to educational engine syscall events
   * This would integrate with the EducationalEngine once it's available
   */
  public subscribeToSyscallEvents(callback: (syscallName: string) => void): void {
    // When EducationalEngine is implemented, this will hook into its event system
    // For now, we provide the API structure
    const handlers = this.eventHandlers.get('syscall') || new Set();
    handlers.add(callback);
    this.eventHandlers.set('syscall', handlers);
  }

  /**
   * Emit a syscall event (called by emulator or educational engine)
   */
  public emitSyscallEvent(syscallName: string): void {
    const handlers = this.eventHandlers.get('syscall');
    if (handlers) {
      handlers.forEach(handler => handler(syscallName));
    }

    // Update current source
    this.updateCurrentSource(syscallName);
  }

  /**
   * Look up source code for a syscall
   */
  public getSourceForSyscall(syscallName: string): SourceCodeEntry | null {
    // Normalize syscall name (remove any prefixes like 'sys_')
    const normalizedName = syscallName.replace(/^sys_/, '').toLowerCase();

    // Check syscalls
    if (this.sourceData.syscalls[normalizedName]) {
      return this.sourceData.syscalls[normalizedName];
    }

    // Check special entries
    if (this.sourceData.special[normalizedName]) {
      return this.sourceData.special[normalizedName];
    }

    // Check shell commands
    if (this.sourceData.shell[normalizedName]) {
      return this.sourceData.shell[normalizedName];
    }

    return null;
  }

  /**
   * Get the currently displayed source code
   */
  public getCurrentSource(): SourceCodeEntry | null {
    return this.currentSource;
  }

  /**
   * Update the current source being displayed
   */
  private updateCurrentSource(syscallName: string): void {
    this.currentSource = this.getSourceForSyscall(syscallName);
  }

  /**
   * Get all available syscalls
   */
  public getAvailableSyscalls(): string[] {
    return [
      ...Object.keys(this.sourceData.syscalls),
      ...Object.keys(this.sourceData.shell)
    ];
  }

  /**
   * Search for source code by keyword
   */
  public searchSource(keyword: string): SourceCodeEntry[] {
    const results: SourceCodeEntry[] = [];
    const lowerKeyword = keyword.toLowerCase();

    // Search syscalls
    Object.entries(this.sourceData.syscalls).forEach(([name, entry]) => {
      if (
        name.includes(lowerKeyword) ||
        entry.description.toLowerCase().includes(lowerKeyword) ||
        entry.code.toLowerCase().includes(lowerKeyword)
      ) {
        results.push(entry);
      }
    });

    // Search shell commands
    Object.entries(this.sourceData.shell).forEach(([name, entry]) => {
      if (
        name.includes(lowerKeyword) ||
        entry.description.toLowerCase().includes(lowerKeyword) ||
        entry.code.toLowerCase().includes(lowerKeyword)
      ) {
        results.push(entry);
      }
    });

    return results;
  }

  /**
   * Get the famous comment (educational easter egg)
   */
  public getFamousComment(): any {
    return this.sourceData.special.famous_comment;
  }

  /**
   * Get metadata about the source code
   */
  public getMetadata(): any {
    return this.sourceData.metadata;
  }

  /**
   * Format source code with syntax highlighting hints
   * Returns an array of lines with metadata for rendering
   */
  public formatSourceCode(entry: SourceCodeEntry): Array<{
    lineNumber: number;
    content: string;
    type: 'comment' | 'code' | 'label';
  }> {
    const lines = entry.code.split('\n');
    const formatted = lines.map((line, index) => {
      let type: 'comment' | 'code' | 'label' = 'code';

      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('/*') || trimmedLine.startsWith('*') || trimmedLine.startsWith('*/')) {
        type = 'comment';
      } else if (trimmedLine.endsWith(':') && !trimmedLine.includes('=')) {
        type = 'label';
      }

      return {
        lineNumber: entry.startLine + index,
        content: line.replace(/^\t/, '    '), // Convert tabs to spaces for display
        type
      };
    });

    return formatted;
  }

  /**
   * Unsubscribe from events
   */
  public unsubscribe(eventType: string, callback: (data: any) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  /**
   * Clear all event handlers
   */
  public clearAllHandlers(): void {
    this.eventHandlers.clear();
  }
}

// Export singleton instance
export const sourceOverlay = new SourceOverlay();
