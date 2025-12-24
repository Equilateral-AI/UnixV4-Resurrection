/**
 * AnnotationEngine - Educational syscall annotation system
 *
 * Monitors PDP-11 execution and detects system calls to provide
 * educational context about Unix V5 internals.
 */

import annotationsData from './syscall-annotations.json';

export interface SyscallAnnotation {
  name: string;
  signature: string;
  description: string;
  implementation: string;
  historicalNote: string;
  codeSnippet?: string;
}

export type SyscallDetectionCallback = (syscallNum: number, annotation: SyscallAnnotation) => void;

/**
 * AnnotationEngine monitors the PDP-11 CPU for system call instructions
 * and provides educational annotations.
 */
export class AnnotationEngine {
  private annotations: Map<number, SyscallAnnotation>;
  private callbacks: Set<SyscallDetectionCallback>;
  private monitoring: boolean = false;
  private monitorInterval: number | null = null;
  private lastPC: number = 0;
  private lastSyscall: number | null = null;

  // PDP-11 system call trap vector and instruction patterns
  // private readonly SYSCALL_TRAP = 0o104; // TRAP instruction (sys opcode) - unused
  private readonly TRAP_MASK = 0o177400; // Mask for TRAP instruction
  private readonly TRAP_BASE = 0o104000; // Base TRAP instruction

  constructor() {
    this.annotations = new Map();
    this.callbacks = new Set();
    this.loadAnnotations();
  }

  /**
   * Load syscall annotations from JSON data
   */
  private loadAnnotations(): void {
    const syscalls = annotationsData.syscalls as Record<string, SyscallAnnotation>;

    for (const [numStr, annotation] of Object.entries(syscalls)) {
      const num = parseInt(numStr, 10);
      this.annotations.set(num, annotation);
    }

    console.log(`[AnnotationEngine] Loaded ${this.annotations.size} syscall annotations`);
  }

  /**
   * Get annotation for a specific syscall number
   */
  getAnnotation(syscallNumber: number): SyscallAnnotation | null {
    return this.annotations.get(syscallNumber) || null;
  }

  /**
   * Get all available syscall numbers
   */
  getAvailableSyscalls(): number[] {
    return Array.from(this.annotations.keys()).sort((a, b) => a - b);
  }

  /**
   * Register a callback to be notified when syscalls are detected
   */
  onSyscallDetected(callback: SyscallDetectionCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * Unregister a syscall detection callback
   */
  offSyscallDetected(callback: SyscallDetectionCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Start monitoring CPU for syscalls
   *
   * This polls the CPU state to detect TRAP instructions which indicate syscalls.
   * The syscall number is encoded in the low bits of the TRAP instruction.
   */
  startMonitoring(): void {
    if (this.monitoring) {
      console.warn('[AnnotationEngine] Already monitoring');
      return;
    }

    // Verify CPU is available
    if (typeof window === 'undefined' || !(window as any).CPU) {
      console.error('[AnnotationEngine] CPU not available, cannot start monitoring');
      return;
    }

    this.monitoring = true;
    console.log('[AnnotationEngine] Started monitoring for syscalls');

    // Poll CPU state every 100ms to detect syscalls
    // In a real implementation, we'd hook the emulator's instruction execution
    this.monitorInterval = window.setInterval(() => {
      this.checkForSyscall();
    }, 100) as unknown as number;
  }

  /**
   * Stop monitoring CPU for syscalls
   */
  stopMonitoring(): void {
    if (!this.monitoring) {
      return;
    }

    if (this.monitorInterval !== null) {
      window.clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    this.monitoring = false;
    console.log('[AnnotationEngine] Stopped monitoring for syscalls');
  }

  /**
   * Check CPU state for syscall execution
   *
   * PDP-11 syscalls are invoked via TRAP instructions. The TRAP instruction
   * format is: 104000 | syscall_number
   *
   * We detect syscalls by:
   * 1. Reading the instruction at PC-2 (last executed instruction)
   * 2. Checking if it's a TRAP instruction
   * 3. Extracting the syscall number from the low bits
   */
  private checkForSyscall(): void {
    try {
      const cpu = (window as any).CPU;
      if (!cpu || !cpu.memory) {
        return;
      }

      // Get current PC (R7)
      const currentPC = cpu.registerVal[7];

      // PC changed means an instruction was executed
      if (currentPC !== this.lastPC) {
        // Look at the previous instruction (PC - 2, since PDP-11 instructions are words)
        const prevInstrAddr = (this.lastPC) >> 1; // Convert byte address to word address

        if (prevInstrAddr >= 0 && prevInstrAddr < cpu.memory.length) {
          const instruction = cpu.memory[prevInstrAddr];

          // Check if this is a TRAP instruction (104000 | syscall#)
          if ((instruction & this.TRAP_MASK) === this.TRAP_BASE) {
            const syscallNum = instruction & 0o377; // Low 8 bits

            // Avoid duplicate notifications for the same syscall
            if (syscallNum !== this.lastSyscall) {
              this.lastSyscall = syscallNum;
              this.notifySyscallDetected(syscallNum);
            }
          } else {
            this.lastSyscall = null;
          }
        }

        this.lastPC = currentPC;
      }
    } catch (error) {
      console.error('[AnnotationEngine] Error checking for syscall:', error);
    }
  }

  /**
   * Notify all callbacks about a detected syscall
   */
  private notifySyscallDetected(syscallNum: number): void {
    const annotation = this.getAnnotation(syscallNum);

    if (annotation) {
      console.log(`[AnnotationEngine] Detected syscall ${syscallNum}: ${annotation.name}`);

      for (const callback of this.callbacks) {
        try {
          callback(syscallNum, annotation);
        } catch (error) {
          console.error('[AnnotationEngine] Error in syscall callback:', error);
        }
      }
    } else {
      // Syscall detected but no annotation available
      console.log(`[AnnotationEngine] Detected syscall ${syscallNum} (no annotation available)`);
    }
  }

  /**
   * Manually trigger annotation display for a specific syscall
   * Useful for educational demonstrations or testing
   */
  showAnnotation(syscallNumber: number): void {
    const annotation = this.getAnnotation(syscallNumber);

    if (annotation) {
      this.notifySyscallDetected(syscallNumber);
    } else {
      console.warn(`[AnnotationEngine] No annotation available for syscall ${syscallNumber}`);
    }
  }

  /**
   * Get a summary of all available annotations
   */
  getSummary(): { syscallNum: number; name: string; signature: string }[] {
    return Array.from(this.annotations.entries())
      .map(([num, ann]) => ({
        syscallNum: num,
        name: ann.name,
        signature: ann.signature
      }))
      .sort((a, b) => a.syscallNum - b.syscallNum);
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.monitoring;
  }
}

/**
 * Create and export a singleton instance
 */
export const annotationEngine = new AnnotationEngine();
