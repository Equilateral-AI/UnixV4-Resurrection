# PDP-11 Emulator Bridge

This module provides a clean TypeScript interface to the PDP-11 emulator by Paul Nankervis.

## Architecture

The bridge connects three components:

1. **PDP-11 Emulator** (`public/vendor/pdp11/`) - Original JavaScript emulator
2. **PDP11Bridge** (`pdp11-bridge.ts`) - TypeScript wrapper and adapter
3. **xterm.js** (`src/main.ts`) - Modern terminal UI

## How It Works

### Script Loading

The bridge dynamically loads emulator scripts in dependency order:

```typescript
const scripts = [
  '/vendor/pdp11/pdp11.js',      // Core CPU emulation
  '/vendor/pdp11/iopage.js',     // I/O page and device emulation
  '/vendor/pdp11/bootcode.js',   // Boot ROM code
  '/vendor/pdp11/fpp.js',        // Floating Point Processor
  '/vendor/pdp11/vt52.js',       // VT52 terminal emulation
];
```

Scripts are loaded sequentially using Promises to ensure proper initialization order.

### Terminal I/O Bridging

The original emulator uses VT52 terminal emulation with a DOM `<textarea>` element. The bridge intercepts this:

**Output (PDP-11 → Terminal):**
- Override `vt52Put(unit, char)` to write directly to xterm.js
- Characters from the emulator are converted to strings and written to the terminal

**Input (Terminal → PDP-11):**
- Connect `terminal.onData()` to `vt52Input(unit, string)`
- User keystrokes are converted to character codes and sent to the emulator

```typescript
// Override output
window.vt52Put = (unit: number, char: number) => {
  if (this.terminal) {
    this.terminal.write(String.fromCharCode(char));
  }
};

// Connect input
terminal.onData((data: string) => {
  window.vt52Input(this.TERMINAL_UNIT, data);
});
```

### Disk Image Configuration

The emulator expects disk images at specific URLs like `rk0.dsk`, `rk1.dsk`, etc.

The bridge intercepts `XMLHttpRequest` to redirect these to configured paths:

```typescript
// Configure disk
pdp11.configureDisk({
  drive: 0,
  url: '/disk-images/unix-v5.dsk',
  mounted: true
});

// XHR proxy redirects rk0.dsk → /disk-images/unix-v5.dsk
```

## Usage

### Basic Setup

```typescript
import { pdp11 } from './emulator/pdp11-bridge';

// 1. Initialize emulator (loads scripts)
await pdp11.initialize();

// 2. Connect terminal
pdp11.connectTerminal(terminal);

// 3. Boot the system
pdp11.boot();
```

### Advanced Configuration

```typescript
// Configure multiple disk drives
pdp11.configureDisk({
  drive: 0,
  url: '/disk-images/unix-v5.dsk',
  mounted: true
});

pdp11.configureDisk({
  drive: 1,
  url: '/disk-images/data.dsk',
  mounted: true
});

// Get CPU status
const status = pdp11.getStatus();
console.log('PC:', status.programCounter.toString(8)); // Octal
console.log('SP:', status.stackPointer.toString(8));
console.log('Registers:', status.registers.map(r => r.toString(8)));
```

### Control Operations

```typescript
// Reset the CPU
pdp11.reset();

// Start execution
pdp11.run();

// Single-step (for debugging)
pdp11.step();

// Panel operations
pdp11.panel('halt');   // Halt CPU
pdp11.panel('start');  // Start CPU
pdp11.panel('reset');  // Reset CPU
```

## API Reference

### `PDP11Bridge`

#### Methods

**`async initialize(): Promise<void>`**
- Loads all emulator scripts in order
- Configures default disk (drive 0 → `/disk-images/unix-v5.dsk`)
- Must be called before any other operations

**`connectTerminal(terminal: Terminal): void`**
- Connects an xterm.js Terminal instance to the emulator
- Sets up bidirectional I/O bridging
- Overrides `vt52Put` for output, connects `onData` for input

**`boot(): void`**
- Resets CPU and loads boot ROM
- Starts the boot sequence
- Applies disk URL patches

**`getStatus(): CPUStatus`**
- Returns current CPU state for debugging
- Includes PC, SP, registers, flags, and PSW

**`reset(): void`**
- Resets the CPU to initial state
- Clears VT52 terminal state

**`run(): void`**
- Starts CPU execution

**`step(): void`**
- Executes a single instruction (for debugging)

**`panel(operation: string): void`**
- Sends panel operations: `'start'`, `'halt'`, `'reset'`, `'boot'`

**`configureDisk(config: DiskConfig): void`**
- Configures a disk image for a specific drive
- Must be called before `boot()`

**`isInitialized(): boolean`**
- Returns true if emulator is initialized

**`isTerminalConnected(): boolean`**
- Returns true if terminal is connected

### Types

#### `CPUStatus`

```typescript
interface CPUStatus {
  runState: number;          // 0=run, 1=reset, 2=wait, 3=halt, 4=step
  programCounter: number;    // R7 (PC)
  stackPointer: number;      // R6 (SP)
  registers: number[];       // R0-R7
  flags: {
    carry: number;
    negative: number;
    zero: number;
    overflow: number;
  };
  psw: number;              // Program Status Word
}
```

#### `DiskConfig`

```typescript
interface DiskConfig {
  drive: number;            // Drive number (0-7 for RK05)
  url: string;              // Path to disk image
  mounted?: boolean;        // Optional mount flag
}
```

## Disk Configuration

### RK05 Disk Controller

The emulator supports up to 8 RK05 drives:

```typescript
// From iopage.js
const rk05 = {
  'sectors': 12,
  'tracks': 406
}; // rk05

const geometry = [rk05, rk05, rk05, rk05, rk05, rk05, idle, idle];
```

Each RK05 disk has:
- 406 tracks (cylinders)
- 12 sectors per track
- 512 bytes per sector
- Total capacity: ~2.4 MB

### URL Mapping

The emulator expects disk images at these URLs by default:
- Drive 0: `rk0.dsk`
- Drive 1: `rk1.dsk`
- Drive 2: `rk2.dsk`
- etc.

The bridge intercepts these requests and redirects to configured paths.

## Debugging

### Console Access

The bridge exports instances to `window` for debugging:

```javascript
// Browser console
terminal;  // xterm.js Terminal instance
pdp11;     // PDP11Bridge instance

// Check CPU state
pdp11.getStatus();

// Access raw emulator
CPU;       // PDP-11 CPU state
boot();    // Boot function
run();     // Run function
```

### Status Monitoring

```typescript
// Get current CPU state
const status = pdp11.getStatus();

// Check if running (runState: 0=run, 3=halt)
if (status.runState === 0) {
  console.log('CPU is running');
}

// Display registers in octal (PDP-11 convention)
status.registers.forEach((reg, i) => {
  console.log(`R${i}: ${reg.toString(8).padStart(6, '0')}`);
});
```

## Implementation Notes

### VT52 Terminal Emulation

The original emulator implements full VT52 terminal emulation including:
- Escape sequences for cursor positioning
- Special graphics characters
- Alternate keypad mode
- Screen buffer management (24 lines × 80 columns)

The bridge preserves this functionality while redirecting I/O to xterm.js.

### Character Encoding

Special key handling:
- `\r` (0x0D) → Enter/Return
- `\x7f` (0x7F) → Backspace/Delete
- `\x1b` (0x1B) → Escape

The VT52 emulation handles these internally for cursor control and editing.

### Script Loading Order

Critical dependencies:
1. `pdp11.js` must load first (defines `CPU` global)
2. `iopage.js` requires `CPU` (registers I/O devices)
3. `bootcode.js` provides boot ROM data
4. `fpp.js` requires `CPU` (floating point coprocessor)
5. `vt52.js` is independent but used by `iopage.js` console driver

### Memory Management

The PDP-11/40 emulated configuration:
- 256 KB maximum memory (configurable)
- 18-bit physical addressing
- Memory Management Unit (MMU) with three modes:
  - Kernel mode (0)
  - Supervisor mode (1)
  - User mode (3)
- Separate instruction and data spaces

## Files

- `pdp11-bridge.ts` - Main bridge implementation
- `README.md` - This file
- `public/vendor/pdp11/pdp11.js` - CPU emulator core
- `public/vendor/pdp11/iopage.js` - I/O page and devices
- `public/vendor/pdp11/bootcode.js` - Boot ROM
- `public/vendor/pdp11/fpp.js` - Floating point processor
- `public/vendor/pdp11/vt52.js` - VT52 terminal emulation

## Credits

PDP-11 Emulator by **Paul Nankervis**
Email: paulnank@hotmail.com

TypeScript bridge and integration by **Equilateral AI (Pareidolia LLC)**
