/**
 * PDP-11 Emulator Bridge for UnixBox
 *
 * This module provides a clean TypeScript interface to the PDP-11 emulator
 * by Paul Nankervis. It handles dynamic script loading, terminal I/O bridging,
 * and disk image configuration.
 */

import { Terminal } from 'xterm';
import { createLogger } from '../utils/logger';
import { DEFAULT_DISK_IMAGE, EMULATOR_SCRIPTS, PDP11 } from '../config';

const log = createLogger('PDP11Bridge');

// Type declarations are in src/types/pdp11.d.ts

export interface CPUStatus {
  runState: number;
  programCounter: number;
  stackPointer: number;
  registers: number[];
  flags: {
    carry: number;
    negative: number;
    zero: number;
    overflow: number;
  };
  psw: number;
}

export interface DiskConfig {
  drive: number;
  url: string;
  mounted?: boolean;
}

/**
 * PDP-11 Emulator Bridge
 *
 * Manages the PDP-11 emulator lifecycle and provides a clean TypeScript API.
 */
export class PDP11Bridge {
  private scriptsLoaded = false;
  private terminal: Terminal | null = null;
  private initialized = false;
  private diskConfigs: DiskConfig[] = [];

  // VT52 terminal unit number (emulator supports multiple terminals)
  private readonly TERMINAL_UNIT = 0;

  /**
   * Initialize the emulator by loading all required scripts in order
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      log.warn('Already initialized');
      return;
    }

    log.info('Loading emulator scripts...');

    // Define CPU_TYPE before loading iopage.js (required by emulator)
    // 70 = PDP-11/70 (22-bit addressing, unibus map)
    // 45 = PDP-11/45 (18-bit addressing)
    window.CPU_TYPE = PDP11.CPU_TYPE;

    // Scripts must be loaded in dependency order
    // IMPORTANT: vt52.js must load before iopage.js (iopage calls vt52Initialize)
    const scripts = [...EMULATOR_SCRIPTS];

    try {
      await this.loadScriptsSequentially(scripts);
      this.scriptsLoaded = true;
      log.info('All emulator scripts loaded successfully');

      // Configure default disk
      this.configureDisk({
        drive: 0,
        url: DEFAULT_DISK_IMAGE,
        mounted: true
      });

      this.initialized = true;
      log.info('Emulator initialized');
    } catch (error) {
      log.error('Failed to load emulator scripts:', error);
      throw error;
    }
  }

  /**
   * Load scripts sequentially to respect dependencies
   */
  private async loadScriptsSequentially(scripts: string[]): Promise<void> {
    for (const src of scripts) {
      await this.loadScript(src);
    }
  }

  /**
   * Load a single script and wait for it to complete
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false; // Maintain execution order

      script.onload = () => {
        log.debug(`Loaded: ${src}`);
        resolve();
      };

      script.onerror = (error) => {
        log.error(`Failed to load: ${src}`, error);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Configure a disk image for a specific drive
   */
  configureDisk(config: DiskConfig): void {
    this.diskConfigs[config.drive] = config;
    log.info(`Configured disk drive ${config.drive}: ${config.url}`);
  }

  /**
   * Connect an xterm.js Terminal to the emulator
   * This bridges I/O between the terminal and the PDP-11's VT52 emulation
   */
  connectTerminal(terminal: Terminal): void {
    if (!this.scriptsLoaded) {
      throw new Error('Emulator scripts not loaded. Call initialize() first.');
    }

    this.terminal = terminal;

    // NOTE: iopage.js already initializes VT52 unit 0 when it loads,
    // using the hidden <textarea id="0"> element in index.html.
    // We just need to override vt52Put to redirect output to xterm.js.

    // Override vt52Put to write to xterm.js instead of the hidden textarea
    const originalVt52Put = window.vt52Put;
    window.vt52Put = (unit: number, char: number) => {
      if (unit === this.TERMINAL_UNIT && this.terminal) {
        // Convert character code to string and write to terminal
        const str = String.fromCharCode(char);
        this.terminal.write(str);
      } else {
        // Fall back to original implementation for other units
        originalVt52Put(unit, char);
      }
    };

    // Connect terminal data events to vt52Input
    terminal.onData((data: string) => {
      // Send each character to the emulator
      for (let i = 0; i < data.length; i++) {
        window.vt52Input(this.TERMINAL_UNIT, data[i]);
      }
    });

    log.info('Terminal connected');
  }

  /**
   * Boot the PDP-11 emulator
   * This resets the CPU and loads the boot ROM
   */
  boot(): void {
    if (!this.scriptsLoaded) {
      throw new Error('Emulator scripts not loaded. Call initialize() first.');
    }

    if (!this.terminal) {
      log.warn('No terminal connected. Call connectTerminal() first.');
    }

    log.info('Booting PDP-11...');

    // Override disk URLs if configured
    if (this.diskConfigs.length > 0) {
      this.patchDiskURLs();
    }

    window.boot();
    log.info('Boot sequence initiated');
  }

  /**
   * Patch disk URLs to use configured paths
   */
  private patchDiskURLs(): void {
    const originalXHR = window.XMLHttpRequest;
    const originalFetch = window.fetch;
    const diskConfigs = this.diskConfigs;

    // Intercept fetch for .zst files - return 404 quickly so it falls back to XHR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- monkey-patching fetch for disk image interception
    (window as any).fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      // If this is a .zst disk image request, reject it so emulator falls back to XHR
      if (urlStr.match(/media\/rk\d+\.dsk\.zst$/)) {
        return Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
      }

      return originalFetch.call(window, input, init);
    };

    // Intercept XHR to redirect disk requests to configured URLs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- monkey-patching XHR for disk image interception
    (window as any).XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalOpen = xhr.open;

      xhr.open = function(
        this: XMLHttpRequest,
        method: string,
        url: string | URL,
        async?: boolean,
        username?: string | null,
        password?: string | null
      ): void {
        let urlStr = typeof url === 'string' ? url : url.toString();

        // Check if this is a disk image request (media/rk0.dsk, media/rk1.dsk, etc.)
        const diskMatch = urlStr.match(/media\/rk(\d+)\.dsk$/);
        if (diskMatch) {
          const driveNum = parseInt(diskMatch[1], 10);
          const config = diskConfigs[driveNum];

          if (config && config.url) {
            // Add cache-busting timestamp to prevent browser caching
            urlStr = config.url + `?t=${Date.now()}`;
          }
        }

        (originalOpen as any).apply(this, [method, urlStr, async, username, password]);
      };

      return xhr;
    };
  }

  /**
   * Get current CPU status for debugging
   */
  getStatus(): CPUStatus {
    if (!this.scriptsLoaded || !window.CPU) {
      throw new Error('Emulator not initialized');
    }

    const cpu = window.CPU;

    return {
      runState: cpu.runState,
      programCounter: cpu.registerVal[7], // R7 is the PC
      stackPointer: cpu.registerVal[6],   // R6 is the SP
      registers: Array.from(cpu.registerVal),
      flags: {
        carry: cpu.flagC,
        negative: cpu.flagNZ & 0x8000 ? 1 : 0,
        zero: cpu.flagNZ === 0 ? 1 : 0,
        overflow: cpu.flagV,
      },
      psw: cpu.PSW,
    };
  }

  /**
   * Reset the emulator
   */
  reset(): void {
    if (!this.scriptsLoaded) {
      throw new Error('Emulator scripts not loaded. Call initialize() first.');
    }

    log.info('Resetting PDP-11...');
    window.reset();

    if (window.vt52Reset) {
      window.vt52Reset(this.TERMINAL_UNIT);
    }
  }

  /**
   * Run the emulator (start CPU execution)
   */
  run(): void {
    if (!this.scriptsLoaded) {
      throw new Error('Emulator scripts not loaded. Call initialize() first.');
    }

    log.debug('Starting CPU execution...');
    if (window.run) {
      window.run();
    }
  }

  /**
   * Single-step the CPU (for debugging)
   */
  step(): void {
    if (!this.scriptsLoaded) {
      throw new Error('Emulator scripts not loaded. Call initialize() first.');
    }

    window.step();
  }

  /**
   * Send a panel operation to the emulator
   * Operations: 'start', 'halt', 'reset', 'boot', 'deposit', 'examine'
   */
  panel(operation: string): void {
    if (!this.scriptsLoaded) {
      throw new Error('Emulator scripts not loaded. Call initialize() first.');
    }

    if (window.panel) {
      window.panel(operation);
    }
  }

  /**
   * Check if emulator is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if terminal is connected
   */
  isTerminalConnected(): boolean {
    return this.terminal !== null;
  }
}

/**
 * Create and export a singleton instance
 */
export const pdp11 = new PDP11Bridge();
