/**
 * PDP-11 Emulator Bridge for UnixBox
 *
 * This module provides a clean TypeScript interface to the PDP-11 emulator
 * by Paul Nankervis. It handles dynamic script loading, terminal I/O bridging,
 * and disk image configuration.
 */

import { Terminal } from 'xterm';

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
      console.warn('[PDP11Bridge] Already initialized');
      return;
    }

    console.log('[PDP11Bridge] Loading emulator scripts...');

    // Define CPU_TYPE before loading iopage.js (required by emulator)
    // 70 = PDP-11/70 (22-bit addressing, unibus map)
    // 45 = PDP-11/45 (18-bit addressing)
    (window as any).CPU_TYPE = 70;

    // Scripts must be loaded in dependency order
    // IMPORTANT: vt52.js must load before iopage.js (iopage calls vt52Initialize)
    const scripts = [
      '/vendor/pdp11/pdp11.js',      // Core CPU emulation
      '/vendor/pdp11/vt52.js',       // VT52 terminal emulation (before iopage!)
      '/vendor/pdp11/iopage.js',     // I/O page and device emulation
      '/vendor/pdp11/bootcode.js',   // Boot ROM code
      '/vendor/pdp11/fpp.js',        // Floating Point Processor
    ];

    try {
      await this.loadScriptsSequentially(scripts);
      this.scriptsLoaded = true;
      console.log('[PDP11Bridge] All emulator scripts loaded successfully');

      // Configure default disk
      this.configureDisk({
        drive: 0,
        url: '/disk-images/unix-v5.dsk',
        mounted: true
      });

      this.initialized = true;
      console.log('[PDP11Bridge] Emulator initialized');
    } catch (error) {
      console.error('[PDP11Bridge] Failed to load emulator scripts:', error);
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
        console.log(`[PDP11Bridge] Loaded: ${src}`);
        resolve();
      };

      script.onerror = (error) => {
        console.error(`[PDP11Bridge] Failed to load: ${src}`, error);
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
    console.log(`[PDP11Bridge] Configured disk drive ${config.drive}: ${config.url}`);
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

    console.log('[PDP11Bridge] Terminal connected');
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
      console.warn('[PDP11Bridge] No terminal connected. Call connectTerminal() first.');
    }

    console.log('[PDP11Bridge] Booting PDP-11...');

    // Override disk URLs if configured
    if (this.diskConfigs.length > 0) {
      this.patchDiskURLs();
    }

    window.boot();
    console.log('[PDP11Bridge] Boot sequence initiated');
  }

  /**
   * Patch disk URLs to use configured paths
   */
  private patchDiskURLs(): void {
    const originalXHR = window.XMLHttpRequest;
    const originalFetch = window.fetch;
    const diskConfigs = this.diskConfigs;

    // Log current disk configuration
    console.log('[PDP11Bridge] Disk configs at patch time:', JSON.stringify(diskConfigs));

    // Intercept fetch for .zst files - return 404 quickly so it falls back to XHR
    (window as any).fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      console.log(`[PDP11Bridge] Fetch request: ${urlStr}`);

      // If this is a .zst disk image request, reject it so emulator falls back to XHR
      if (urlStr.match(/media\/rk\d+\.dsk\.zst$/)) {
        console.log(`[PDP11Bridge] Rejecting .zst request (using uncompressed): ${urlStr}`);
        return Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
      }

      return originalFetch.call(window, input, init);
    };

    console.log('[PDP11Bridge] Installing XHR and fetch interceptors');

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
        console.log(`[PDP11Bridge] XHR request: ${method} ${urlStr}`);

        // Check if this is a disk image request (media/rk0.dsk, media/rk1.dsk, etc.)
        const diskMatch = urlStr.match(/media\/rk(\d+)\.dsk$/);
        if (diskMatch) {
          const driveNum = parseInt(diskMatch[1], 10);
          const config = diskConfigs[driveNum];
          console.log(`[PDP11Bridge] Disk ${driveNum} config:`, config);

          if (config && config.url) {
            // Add cache-busting timestamp to prevent browser caching
            const cacheBuster = `?t=${Date.now()}`;
            const newUrl = config.url + cacheBuster;
            console.log(`[PDP11Bridge] Redirecting disk ${driveNum}: ${urlStr} -> ${newUrl}`);
            urlStr = newUrl;
          } else {
            console.warn(`[PDP11Bridge] No config for disk ${driveNum}, using original URL`);
          }
        }

        // Call original with proper arguments - use any to bypass strict typing
        // since we're proxying a complex method signature
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

    console.log('[PDP11Bridge] Resetting PDP-11...');
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

    console.log('[PDP11Bridge] Starting CPU execution...');
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
