/**
 * MultiTerminalManager - Manages multiple VT52 terminal instances
 *
 * Tracks which VT52 units (0-7) are in use, spawns secondary terminals,
 * and coordinates I/O between primary emulator and secondary tabs.
 */

import { TerminalSync } from './TerminalSync';

export interface TerminalInfo {
  unit: number;
  name: string;
  inUse: boolean;
  isPrimary: boolean;
  windowRef?: Window | null;
}

/**
 * MultiTerminalManager coordinates multiple terminal instances
 */
export class MultiTerminalManager {
  private terminalSync: TerminalSync;
  private terminals: Map<number, TerminalInfo> = new Map();
  private readonly maxUnits = 8; // VT52 supports units 0-7
  private readonly primaryUnit = 0;
  private vt52PutIntercepted = false;

  constructor() {
    this.terminalSync = new TerminalSync(true); // Primary tab

    // Initialize terminal registry
    for (let i = 0; i < this.maxUnits; i++) {
      this.terminals.set(i, {
        unit: i,
        name: `TTY${i}`,
        inUse: i === this.primaryUnit, // Unit 0 is always in use (primary)
        isPrimary: i === this.primaryUnit,
        windowRef: null
      });
    }

    // Register primary terminal
    this.terminalSync.register(this.primaryUnit);

    // Listen for input from secondary terminals
    this.terminalSync.onInput((unit: number, data: string) => {
      console.log(`[MultiTerminalManager] Received input from unit ${unit}: "${data}"`);
      // Send to emulator's VT52 input
      if (window.vt52Input) {
        for (let i = 0; i < data.length; i++) {
          window.vt52Input(unit, data[i]);
        }
      }
    });

    console.log('[MultiTerminalManager] Initialized');
  }

  /**
   * Intercept vt52Put to broadcast output to secondary terminals
   */
  interceptVt52Output(): void {
    if (this.vt52PutIntercepted) {
      console.warn('[MultiTerminalManager] vt52Put already intercepted');
      return;
    }

    const originalVt52Put = window.vt52Put;
    const terminalSync = this.terminalSync;
    const terminals = this.terminals;

    window.vt52Put = function(unit: number, char: number) {
      // Call original implementation
      originalVt52Put(unit, char);

      // If this is a secondary terminal, broadcast to other tabs
      const termInfo = terminals.get(unit);
      if (termInfo && !termInfo.isPrimary && termInfo.inUse) {
        const str = String.fromCharCode(char);
        terminalSync.broadcastOutput(unit, str);
      }
    };

    this.vt52PutIntercepted = true;
    console.log('[MultiTerminalManager] vt52Put intercepted for multi-terminal output');
  }

  /**
   * Find next available terminal unit
   */
  private findNextAvailableUnit(): number | null {
    for (let i = 1; i < this.maxUnits; i++) { // Start at 1 (skip primary)
      const term = this.terminals.get(i);
      if (term && !term.inUse) {
        return i;
      }
    }
    return null;
  }

  /**
   * Spawn a new terminal in a new tab
   */
  spawnTerminal(unit?: number): Window | null {
    const targetUnit = unit !== undefined ? unit : this.findNextAvailableUnit();

    if (targetUnit === null) {
      console.error('[MultiTerminalManager] No available terminal units');
      alert('Maximum number of terminals (8) reached!');
      return null;
    }

    const term = this.terminals.get(targetUnit);
    if (!term) {
      console.error(`[MultiTerminalManager] Invalid unit: ${targetUnit}`);
      return null;
    }

    if (term.inUse && !term.isPrimary) {
      console.warn(`[MultiTerminalManager] Unit ${targetUnit} already in use`);
      return term.windowRef || null;
    }

    // Mark as in use
    term.inUse = true;

    // Open secondary terminal in new tab
    const url = `/secondary-terminal.html?unit=${targetUnit}`;
    const windowRef = window.open(url, `_blank_tty${targetUnit}`);

    if (windowRef) {
      term.windowRef = windowRef;
      console.log(`[MultiTerminalManager] Spawned terminal unit ${targetUnit}`);

      // Listen for window close
      const checkClosed = setInterval(() => {
        if (windowRef.closed) {
          clearInterval(checkClosed);
          this.closeTerminal(targetUnit);
        }
      }, 1000);
    } else {
      console.error('[MultiTerminalManager] Failed to open new window (popup blocked?)');
      term.inUse = false;
      alert('Failed to open new terminal. Please allow popups for this site.');
    }

    return windowRef;
  }

  /**
   * Close a terminal and mark unit as available
   */
  closeTerminal(unit: number): void {
    const term = this.terminals.get(unit);
    if (!term) {
      console.error(`[MultiTerminalManager] Invalid unit: ${unit}`);
      return;
    }

    if (term.isPrimary) {
      console.warn('[MultiTerminalManager] Cannot close primary terminal');
      return;
    }

    console.log(`[MultiTerminalManager] Closing terminal unit ${unit}`);

    // Close window if still open
    if (term.windowRef && !term.windowRef.closed) {
      term.windowRef.close();
    }

    // Mark as available
    term.inUse = false;
    term.windowRef = null;

    // Unregister from sync
    this.terminalSync.unregister(unit);
  }

  /**
   * Get list of active terminals
   */
  getActiveTerminals(): TerminalInfo[] {
    return Array.from(this.terminals.values()).filter(t => t.inUse);
  }

  /**
   * Get count of active terminals
   */
  getActiveCount(): number {
    return this.getActiveTerminals().length;
  }

  /**
   * Get terminal info by unit
   */
  getTerminalInfo(unit: number): TerminalInfo | undefined {
    return this.terminals.get(unit);
  }

  /**
   * Check if unit is available
   */
  isUnitAvailable(unit: number): boolean {
    const term = this.terminals.get(unit);
    return term ? !term.inUse : false;
  }

  /**
   * Get terminal sync instance (for external use)
   */
  getSync(): TerminalSync {
    return this.terminalSync;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Close all secondary terminals
    this.terminals.forEach(term => {
      if (!term.isPrimary && term.inUse) {
        this.closeTerminal(term.unit);
      }
    });

    // Destroy sync
    this.terminalSync.destroy();

    console.log('[MultiTerminalManager] Destroyed');
  }
}
