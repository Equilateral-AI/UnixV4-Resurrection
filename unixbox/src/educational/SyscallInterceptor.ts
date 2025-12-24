/**
 * SyscallInterceptor - Hook trap() to detect and emit Unix V4 system calls
 *
 * This module wraps the PDP-11 emulator's trap() function to intercept
 * system call vectors (0o60 / octal 060) and extract syscall information
 * from CPU registers.
 *
 * Unix V4 System Call Convention:
 * - Syscalls use TRAP instruction with vector 0o60 (octal 060, decimal 48)
 * - Syscall number is in R0 (CPU.registerVal[0])
 * - Arguments are in R1-R5 (CPU.registerVal[1-5])
 * - Return address is stored on the stack
 *
 * Usage:
 *   import { syscallInterceptor } from './SyscallInterceptor';
 *   syscallInterceptor.install();
 */

import { educationalEngine } from './EducationalEngine';
import type { SyscallEvent } from '../types/educational';

/**
 * Unix V4 system call names indexed by syscall number
 *
 * Source: Lions' Commentary on UNIX 6th Edition (similar to V4)
 * and Unix V4 source code
 */
const SYSCALL_NAMES: Record<number, string> = {
  0: 'indir',     // Indirect system call
  1: 'exit',      // Terminate process
  2: 'fork',      // Create new process
  3: 'read',      // Read from file descriptor
  4: 'write',     // Write to file descriptor
  5: 'open',      // Open file
  6: 'close',     // Close file descriptor
  7: 'wait',      // Wait for child process
  8: 'creat',     // Create file
  9: 'link',      // Create hard link
  10: 'unlink',   // Remove file
  11: 'exec',     // Execute program
  12: 'chdir',    // Change directory
  13: 'time',     // Get time
  14: 'mknod',    // Make device node
  15: 'chmod',    // Change file mode
  16: 'chown',    // Change file owner
  17: 'break',    // Set program break (sbrk)
  18: 'stat',     // Get file status
  19: 'seek',     // Seek in file
  20: 'getpid',   // Get process ID
  21: 'mount',    // Mount filesystem
  22: 'umount',   // Unmount filesystem
  23: 'setuid',   // Set user ID
  24: 'getuid',   // Get user ID
  25: 'stime',    // Set time
  26: 'ptrace',   // Process trace
  27: 'alarm',    // Set alarm clock
  28: 'fstat',    // Get file status (by fd)
  29: 'pause',    // Wait for signal
  30: 'utime',    // Set file times
  31: 'stty',     // Set terminal mode
  32: 'gtty',     // Get terminal mode
  33: 'access',   // Check file accessibility
  34: 'nice',     // Change process priority
  35: 'ftime',    // Get time (BSD)
  36: 'sync',     // Flush filesystem buffers
  37: 'kill',     // Send signal to process
  38: 'switch',   // Context switch (internal)
  39: 'setpgrp',  // Set process group
  40: 'tell',     // Get current file position
  41: 'dup',      // Duplicate file descriptor
  42: 'pipe',     // Create pipe
  43: 'times',    // Get process times
  44: 'prof',     // Profiling (internal)
  45: 'unused45', // Unused syscall slot
  46: 'setgid',   // Set group ID
  47: 'getgid',   // Get group ID
  48: 'signal',   // Signal handling
  49: 'unused49', // Unused syscall slot
  50: 'unused50', // Unused syscall slot
};

/**
 * SyscallInterceptor - Hooks the PDP-11 trap() function to detect syscalls
 */
export class SyscallInterceptor {
  private originalTrap: ((vector: number, errorMask: number) => number) | null = null;
  private installed = false;
  private syscallCount = 0;

  /**
   * System call trap vector (octal 060, decimal 48)
   */
  private readonly SYSCALL_VECTOR = 0o60;

  /**
   * Install the syscall interceptor by wrapping window.trap
   *
   * This must be called after the PDP-11 emulator scripts are loaded
   * and before boot() is invoked.
   */
  install(): void {
    if (this.installed) {
      console.warn('[SyscallInterceptor] Already installed');
      return;
    }

    if (typeof window.trap !== 'function') {
      console.error('[SyscallInterceptor] window.trap not found. Emulator not loaded?');
      throw new Error('window.trap not available. Load emulator scripts first.');
    }

    // Save the original trap function
    this.originalTrap = window.trap;

    // Wrap trap() to intercept syscalls
    window.trap = (vector: number, errorMask: number): number => {
      // Check if this is a syscall trap (vector 060)
      if (vector === this.SYSCALL_VECTOR) {
        this.handleSyscall();
      }

      // Call the original trap function
      return this.originalTrap!(vector, errorMask);
    };

    this.installed = true;
    console.log('[SyscallInterceptor] Installed successfully');
  }

  /**
   * Handle a detected system call
   *
   * Extracts syscall information from CPU registers and emits an event
   */
  private handleSyscall(): void {
    if (!window.CPU) {
      console.error('[SyscallInterceptor] window.CPU not available');
      return;
    }

    const cpu = window.CPU;

    // Extract syscall number from R0
    const syscallNumber = cpu.registerVal[0] & 0xFFFF;

    // Extract arguments from R1-R5
    const args = [
      cpu.registerVal[1] & 0xFFFF,
      cpu.registerVal[2] & 0xFFFF,
      cpu.registerVal[3] & 0xFFFF,
      cpu.registerVal[4] & 0xFFFF,
      cpu.registerVal[5] & 0xFFFF,
    ];

    // Get program counter (R7)
    const pc = cpu.registerVal[7] & 0xFFFF;

    // Look up syscall name
    const name = SYSCALL_NAMES[syscallNumber] || `unknown_${syscallNumber}`;

    // Create syscall event
    const event: SyscallEvent = {
      number: syscallNumber,
      name,
      args,
      pc,
      timestamp: Date.now(),
    };

    // Track syscall count
    this.syscallCount++;

    // Emit event via EducationalEngine
    educationalEngine.emit('syscall', event);

    // Optional: Log to console for debugging
    if (this.shouldLog(syscallNumber)) {
      console.log(
        `[SyscallInterceptor] #${this.syscallCount} ${name}(${syscallNumber}) ` +
        `args=[${args.map(a => a.toString(8)).join(', ')}] pc=${pc.toString(8)}`
      );
    }
  }

  /**
   * Determine if a syscall should be logged to console
   *
   * @param syscallNumber - System call number
   * @returns True if this syscall should be logged
   */
  private shouldLog(syscallNumber: number): boolean {
    // Log interesting syscalls, but not read/write (too noisy)
    const noisySyscalls = [3, 4]; // read, write
    return !noisySyscalls.includes(syscallNumber);
  }

  /**
   * Uninstall the syscall interceptor
   *
   * Restores the original trap() function
   */
  uninstall(): void {
    if (!this.installed) {
      console.warn('[SyscallInterceptor] Not installed');
      return;
    }

    if (this.originalTrap) {
      window.trap = this.originalTrap;
      this.originalTrap = null;
    }

    this.installed = false;
    console.log('[SyscallInterceptor] Uninstalled');
  }

  /**
   * Check if the interceptor is installed
   */
  isInstalled(): boolean {
    return this.installed;
  }

  /**
   * Get the total number of syscalls intercepted
   */
  getSyscallCount(): number {
    return this.syscallCount;
  }

  /**
   * Reset the syscall counter
   */
  resetCount(): void {
    this.syscallCount = 0;
  }

  /**
   * Get the syscall name for a given number
   *
   * @param syscallNumber - System call number
   * @returns Syscall name or "unknown_N"
   */
  static getSyscallName(syscallNumber: number): string {
    return SYSCALL_NAMES[syscallNumber] || `unknown_${syscallNumber}`;
  }

  /**
   * Get all known syscall mappings
   */
  static getSyscallMappings(): Record<number, string> {
    return { ...SYSCALL_NAMES };
  }
}

/**
 * Singleton instance of SyscallInterceptor
 * Export this to ensure consistent state across the application
 */
export const syscallInterceptor = new SyscallInterceptor();
