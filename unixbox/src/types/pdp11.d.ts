/**
 * TypeScript declarations for PDP-11 emulator (pdp11.js)
 *
 * The PDP-11 emulator consists of global JavaScript files that expose
 * functions and variables on the window object. These are not ES modules.
 *
 * Load order is critical:
 * 1. pdp11.js (core CPU emulator)
 * 2. iopage.js (I/O page handlers)
 * 3. bootcode.js (boot loader code)
 * 4. vt52.js (terminal emulation)
 * 5. fpp.js (floating point processor - optional)
 */

// CPU State Constants
declare const STATE_RUN: 0;
declare const STATE_RESET: 1;
declare const STATE_WAIT: 2;
declare const STATE_HALT: 3;
declare const STATE_STEP: 4;

// Memory Management Constants
declare const IOBASE_VIRT: number;
declare const IOBASE_18BIT: number;
declare const IOBASE_UNIBUS: number;
declare const IOBASE_22BIT: number;
declare const MAX_MEMORY: number;

/**
 * CPU Object - Main emulator state
 *
 * This represents the complete state of a PDP-11/40 or PDP-11/70 CPU
 * including registers, memory management unit, and physical memory.
 */
interface PDP11CPU {
  // Core registers
  registerVal: Uint16Array;      // R0-R7 (current register set)
  registerAlt: Uint16Array;      // R0-R5 (alternate register set)
  stackPointer: Uint16Array;     // R6 for each mode (kernel, super, illegal, user)

  // Program Status Word and flags
  PSW: number;                   // Program Status Word (without condition codes)
  flagC: number;                 // Carry flag
  flagNZ: number;                // Negative/Zero flag combined
  flagV: number;                 // Overflow flag

  // Memory Management Unit
  MMR0: number;                  // MMU control register 0
  MMR1: number;                  // MMU control register 1
  MMR2: number;                  // MMU control register 2
  MMR3: number;                  // MMU control register 3
  mmuPAR: Uint16Array;           // Page Address Registers (64 entries)
  mmuPDR: Uint16Array;           // Page Descriptor Registers (64 entries)
  mmuEnable: number;             // MMU enable mask
  mmuMode: number;               // Current MMU mode (0=kernel, 1=super, 3=user)
  mmuLastPage: number;           // Last used MMU page
  mmuPageMask: number;           // MMR3 I/D page mask

  // Physical memory
  memory: Uint16Array;           // Main memory array (words)

  // CPU state
  runState: 0 | 1 | 2 | 3 | 4;   // Current CPU state
  interruptRequested: number;    // Interrupt pending flag
  trapMask: number;              // Pending trap mask
  trapPSW: number;               // PSW when trap invoked

  // Console/Debug
  displayAddress: number;        // Address display
  displayBusReg: number;         // Bus register display
  displayDataPaths: number;      // Data path display
  displayMicroAdrs: number;      // Micro address display
  displayPhysical: number;       // Physical address display
  displayRegister: number;       // Console display lights register
  statusLights: number;          // Console status lights
  switchRegister: number;        // Console switch register

  // Stack limit and other
  stackLimit: number;            // Stack overflow limit
  PIR: number;                   // Programmable interrupt register
  CPU_Error: number;             // Error flag
  modifyAddress: number;         // Physical address for modify operations
  modifyRegister: number;        // Register address for modify operations
  unibusMap: Uint32Array;        // Unibus mapping registers (32 entries)
}

declare var CPU: PDP11CPU;

/**
 * Boot the PDP-11 emulator
 *
 * Initializes the CPU, resets the system, and begins execution.
 * The boot process typically loads a bootstrap loader from a disk image.
 */
declare function boot(): void;

/**
 * Reset the PDP-11 emulator to initial state
 */
declare function reset(): void;

/**
 * Run the CPU (start execution)
 */
declare function run(): void;

/**
 * Step the CPU one instruction
 */
declare function step(): void;

/**
 * Send a panel operation to the emulator
 * Operations: 'start', 'halt', 'reset', 'boot', 'deposit', 'examine'
 */
declare function panel(operation: string): void;

/**
 * Trap handler - invoked when a trap/interrupt occurs
 *
 * Traps read a new PC and PSW from a vector in kernel data space,
 * push the old PSW and PC onto the new mode stack, and continue execution.
 *
 * @param vector - Trap vector address (e.g., 0o60 for syscalls, 0o4 for odd address)
 * @param errorMask - CPU error mask to set
 * @returns -1 to signal that a trap has occurred
 */
declare function trap(vector: number, errorMask: number): number;

/**
 * Initialize VT52 terminal emulation
 *
 * @param unit - Terminal unit number (usually 0)
 * @param element - HTML element or element ID to attach terminal to
 * @param readRoutine - Callback function for terminal input
 */
declare function vt52Initialize(
  unit: number,
  element: HTMLElement | string,
  readRoutine: (unit: number, char: number) => void
): void;

/**
 * Reset VT52 terminal to initial state
 *
 * @param unit - Terminal unit number
 */
declare function vt52Reset(unit: number): void;

/**
 * Output a character to the VT52 terminal
 *
 * @param unit - Terminal unit number
 * @param char - Character code to output (0-255)
 */
declare function vt52Put(unit: number, char: number): void;

/**
 * Send input string to the VT52 terminal
 *
 * @param unit - Terminal unit number
 * @param str - String to input
 */
declare function vt52Input(unit: number, str: string): void;

/**
 * Load a disk image from URL
 *
 * @param unit - Disk unit number
 * @param url - URL to disk image file (.dsk)
 * @param callback - Callback on completion
 */
declare function loadDiskImage(
  unit: number,
  url: string,
  callback?: (success: boolean) => void
): void;

/**
 * Load a tape image from URL
 *
 * @param unit - Tape unit number
 * @param url - URL to tape image file
 * @param callback - Callback on completion
 */
declare function loadTapeImage(
  unit: number,
  url: string,
  callback?: (success: boolean) => void
): void;

/**
 * Extended Window interface with PDP-11 globals
 */
interface Window {
  CPU: PDP11CPU;
  boot: typeof boot;
  reset: typeof reset;
  run: typeof run;
  step: typeof step;
  panel: typeof panel;
  trap: typeof trap;
  vt52Initialize: typeof vt52Initialize;
  vt52Reset: typeof vt52Reset;
  vt52Put: typeof vt52Put;
  vt52Input: typeof vt52Input;
  loadDiskImage: typeof loadDiskImage;
  loadTapeImage: typeof loadTapeImage;
}
