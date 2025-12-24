/**
 * Time Machine - Era Switching System for UnixBox
 *
 * Allows users to switch between different Unix versions (V4, V5, V6)
 * by reconfiguring the disk image and rebooting the emulator.
 */

import { Terminal } from 'xterm';
import { PDP11Bridge } from '../../emulator/pdp11-bridge';
import eraConfigsData from './era-configs.json';

export interface EraConfig {
  id: string;
  name: string;
  year: number;
  diskImage: string;
  bootCommand: string;
  notes: string;
  features: string[];
  memory: string;
  banner: string[];
  compressed?: boolean;
}

export interface EraConfigs {
  eras: {
    [key: string]: EraConfig;
  };
  defaultEra: string;
}

export type EraChangeCallback = (eraId: string, eraConfig: EraConfig) => void;
export type BootProgressCallback = (stage: string, progress: number) => void;

/**
 * TimeMachine manages era switching and emulator reconfiguration
 */
export class TimeMachine {
  private eraConfigs: EraConfigs;
  private currentEraId: string;
  private pdp11: PDP11Bridge;
  private terminal: Terminal | null = null;
  private eraChangeCallbacks: EraChangeCallback[] = [];
  private bootProgressCallbacks: BootProgressCallback[] = [];

  constructor(pdp11: PDP11Bridge) {
    this.eraConfigs = eraConfigsData as EraConfigs;
    this.currentEraId = this.eraConfigs.defaultEra;
    this.pdp11 = pdp11;
  }

  /**
   * Get all available eras
   */
  getEras(): EraConfig[] {
    return Object.values(this.eraConfigs.eras);
  }

  /**
   * Get current era configuration
   */
  getCurrentEra(): EraConfig {
    return this.eraConfigs.eras[this.currentEraId];
  }

  /**
   * Get era by ID
   */
  getEra(eraId: string): EraConfig | null {
    return this.eraConfigs.eras[eraId] || null;
  }

  /**
   * Set the terminal for output during era switching
   */
  setTerminal(terminal: Terminal): void {
    this.terminal = terminal;
  }

  /**
   * Register callback for era change events
   */
  onEraChange(callback: EraChangeCallback): void {
    this.eraChangeCallbacks.push(callback);
  }

  /**
   * Register callback for boot progress updates
   */
  onBootProgress(callback: BootProgressCallback): void {
    this.bootProgressCallbacks.push(callback);
  }

  /**
   * Emit era change event to all listeners
   */
  private emitEraChange(eraId: string, eraConfig: EraConfig): void {
    this.eraChangeCallbacks.forEach(callback => callback(eraId, eraConfig));
  }

  /**
   * Emit boot progress event to all listeners
   */
  private emitBootProgress(stage: string, progress: number): void {
    this.bootProgressCallbacks.forEach(callback => callback(stage, progress));
  }

  /**
   * Switch to a different Unix era
   * This reconfigures the disk image and reboots the emulator
   */
  async switchEra(eraId: string): Promise<void> {
    const eraConfig = this.getEra(eraId);

    if (!eraConfig) {
      throw new Error(`Era not found: ${eraId}`);
    }

    if (eraId === this.currentEraId) {
      console.log(`[TimeMachine] Already in era: ${eraId}`);
      return;
    }

    console.log(`[TimeMachine] Switching era: ${this.currentEraId} -> ${eraId}`);

    // Update current era
    this.currentEraId = eraId;

    // Show era switch animation
    if (this.terminal) {
      await this.showEraSwitchAnimation(eraConfig);
    }

    // Reconfigure disk and reboot
    await this.reconfigureAndBoot(eraConfig);

    // Emit era change event
    this.emitEraChange(eraId, eraConfig);
  }

  /**
   * Show visual feedback during era switching
   */
  private async showEraSwitchAnimation(eraConfig: EraConfig): Promise<void> {
    if (!this.terminal) return;

    const terminal = this.terminal;

    // Clear screen
    terminal.clear();

    // Show time travel animation
    terminal.writeln('');
    terminal.writeln('\x1b[1;36m╔════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[1;36m║                          TIME MACHINE ACTIVATED                            ║\x1b[0m');
    terminal.writeln('\x1b[1;36m╚════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    terminal.writeln(`\x1b[33mTraveling to: \x1b[1;33m${eraConfig.name}\x1b[0m`);
    terminal.writeln('');

    // Animated time travel effect
    const years = [2024, 2000, 1990, 1985, 1980, 1975, eraConfig.year];
    for (const year of years) {
      terminal.write(`\r\x1b[K\x1b[90m  >> Year: ${year} ${'.'.repeat(Math.random() * 10 | 0)}\x1b[0m`);
      await this.sleep(150);
    }

    terminal.writeln('');
    terminal.writeln('');
    terminal.writeln(`\x1b[1;32m✓ Arrived at ${eraConfig.year}\x1b[0m`);
    terminal.writeln('');

    // Show era banner
    eraConfig.banner.forEach(line => {
      terminal.writeln(`\x1b[1;32m${line}\x1b[0m`);
    });

    terminal.writeln('');
    terminal.writeln('\x1b[36m[INFO] Reconfiguring hardware for this era...\x1b[0m');
    terminal.writeln(`\x1b[36m[INFO] Memory: ${eraConfig.memory}\x1b[0m`);
    terminal.writeln(`\x1b[36m[INFO] Disk: ${eraConfig.diskImage}\x1b[0m`);
    terminal.writeln('');

    await this.sleep(1000);
  }

  /**
   * Reconfigure emulator and boot with new disk image
   */
  private async reconfigureAndBoot(eraConfig: EraConfig): Promise<void> {
    console.log(`[TimeMachine] Reconfiguring for era: ${eraConfig.id}`);

    // Reset the emulator
    this.pdp11.reset();

    // Configure new disk image
    this.pdp11.configureDisk({
      drive: 0,
      url: eraConfig.diskImage,
      mounted: true
    });

    if (this.terminal) {
      this.terminal.writeln('\x1b[33m[EMULATOR] Resetting PDP-11/40...\x1b[0m');
      await this.sleep(500);

      this.terminal.writeln('\x1b[33m[EMULATOR] Loading boot ROM...\x1b[0m');
      await this.sleep(500);

      this.terminal.writeln(`\x1b[33m[EMULATOR] Mounting disk: ${eraConfig.diskImage}\x1b[0m`);
      await this.sleep(500);

      this.terminal.writeln('');
      this.terminal.writeln(`\x1b[1;32m=== Starting PDP-11/40 (${eraConfig.name}) ===\x1b[0m`);
      this.terminal.writeln('');
    }

    // Boot the emulator
    this.pdp11.boot();

    if (this.terminal) {
      this.terminal.writeln('\x1b[1;32m[READY] System booted successfully\x1b[0m');
      this.terminal.writeln('');
      this.terminal.writeln('\x1b[1;33mFeatures in this era:\x1b[0m');
      eraConfig.features.forEach(feature => {
        this.terminal!.writeln(`\x1b[90m  • ${feature}\x1b[0m`);
      });
      this.terminal.writeln('');
      this.terminal.writeln(`\x1b[90m${eraConfig.notes}\x1b[0m`);
      this.terminal.writeln('');
      this.terminal.writeln('\x1b[90mKeyboard shortcuts:\x1b[0m');
      this.terminal.writeln('\x1b[90m  Ctrl+R - Reset/Reboot\x1b[0m');
      this.terminal.writeln('\x1b[90m  Ctrl+B - Boot Menu\x1b[0m');
      this.terminal.writeln('\x1b[90m  Ctrl+S - CPU Status\x1b[0m');
      this.terminal.writeln('');
    }
  }

  /**
   * Boot the current era with progress animation
   */
  async bootCurrentEra(terminal: Terminal): Promise<void> {
    this.setTerminal(terminal);
    const eraConfig = this.getCurrentEra();

    // Clear and show banner
    terminal.clear();

    eraConfig.banner.forEach(line => {
      terminal.writeln(`\x1b[1;32m${line}\x1b[0m`);
    });

    terminal.writeln('');
    terminal.writeln('\x1b[33mInitializing UnixBox emulator...\x1b[0m');
    terminal.writeln('');
    terminal.writeln(`Memory: ${eraConfig.memory}`);
    terminal.writeln('Processor: PDP-11/40 @ 1.0 MHz');
    terminal.writeln('');
    terminal.writeln('\x1b[36m[INFO] Terminal initialized (80x24)\x1b[0m');
    terminal.writeln('');

    // Boot stages
    const bootStages = [
      'Initializing PDP-11/40 CPU',
      'Loading microcode ROM',
      `Testing memory (${eraConfig.memory})`,
      'Initializing I/O page',
      'Loading bootstrap code',
      'Mounting RK05 disk drive',
      'Starting processor',
    ];

    // Animate boot stages
    for (let i = 0; i < bootStages.length; i++) {
      const stage = bootStages[i];
      const progress = (i + 1) / bootStages.length * 100;

      this.emitBootProgress(stage, progress);

      const dots = '.'.repeat((i % 3) + 1) + ' '.repeat(3 - ((i % 3) + 1));
      terminal.write(`\r\x1b[K\x1b[90m[${(i + 1).toString()}/${bootStages.length}] ${stage}${dots}\x1b[0m`);

      await this.sleep(250);
    }

    terminal.writeln('');
    terminal.writeln('');
  }

  /**
   * Utility function for async sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the current era ID
   */
  getCurrentEraId(): string {
    return this.currentEraId;
  }
}
