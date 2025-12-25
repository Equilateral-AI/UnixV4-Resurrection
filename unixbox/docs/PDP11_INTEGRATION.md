# PDP-11 Emulator Integration

**Date**: 2025-12-24
**Status**: Complete

## Overview

The UnixBox main.ts has been successfully integrated with the PDP-11 emulator. The integration provides a complete vintage computer boot experience with modern terminal emulation.

## Files Modified/Created

### Created
- `/src/emulator/pdp11-bridge.ts` - TypeScript bridge module connecting xterm.js to the PDP-11 JavaScript emulator

### Modified
- `/src/main.ts` - Enhanced with emulator initialization, boot sequence, and keyboard shortcuts

## Features Implemented

### 1. PDP-11 Bridge Module (`pdp11-bridge.ts`)

A clean TypeScript interface to Paul Nankervis's PDP-11 JavaScript emulator:

**Capabilities**:
- Dynamic script loading (pdp11.js, iopage.js, fpp.js, vt52.js, bootcode.js)
- Terminal I/O bridging between xterm.js and VT52 emulation
- CPU status monitoring
- Disk configuration
- Reset/boot/run/step operations

**Key Methods**:
- `initialize()` - Load emulator scripts dynamically
- `connectTerminal(terminal)` - Bridge xterm.js to emulator I/O
- `boot()` - Start the PDP-11 boot sequence
- `reset()` - Reset the CPU and memory
- `getStatus()` - Get current CPU state (PC, SP, PSW, registers, flags)

**Terminal Integration**:
- Overrides `window.vt52Put()` to redirect output to xterm.js
- Connects `terminal.onData()` to `window.vt52Input()` for keyboard input
- Intercepts XMLHttpRequest to redirect disk image URLs

### 2. Enhanced main.ts

#### Boot Sequence with Progress Animation

Shows a vintage-style boot sequence with 7 animated stages:
1. Initializing PDP-11/40 CPU
2. Loading microcode ROM
3. Testing memory (256 KB)
4. Initializing I/O page
5. Loading bootstrap code
6. Mounting RK05 disk drive
7. Starting processor

Each stage displays with animated dots (250ms per stage).

#### Keyboard Shortcuts

**Ctrl+R - Reset/Reboot**
- Resets the CPU
- Clears terminal
- Shows reset banner
- Reboots with progress animation

**Ctrl+B - Boot Menu**
- Shows available keyboard shortcuts
- Displays current CPU state
- Shows program counter (octal)

**Ctrl+S - CPU Status**
- Full CPU register dump
- Program counter (PC) - R7
- Stack pointer (SP) - R6
- Processor status word (PSW)
- Flags: N (Negative), Z (Zero), V (Overflow), C (Carry)
- General registers R0-R5 (all in octal)

#### Boot Banner

Retro ASCII art banner with:
- "UNIX Fifth Edition"
- "November 1974"
- "PDP-11/40 - 16-bit Minicomputer"

All styled with green ANSI colors matching the CRT theme.

#### Visual Effects

- Color-coded status messages:
  - Green: Success/ready
  - Yellow: In progress/warning
  - Red: Error
  - Cyan: Info
  - Gray: Dimmed/help text

- Box-drawing characters for menus and status displays
- Animated loading progress with dots
- Retro phosphor green theme (#00ff00 on #001100)

## Technical Details

### Script Loading Order

The emulator requires scripts in this dependency order:
1. `pdp11.js` - Core CPU emulation
2. `iopage.js` - I/O page and device emulation
3. `bootcode.js` - Bootstrap ROM code
4. `fpp.js` - Floating Point Processor
5. `vt52.js` - VT52 terminal emulation

Scripts are loaded asynchronously but sequentially to maintain dependencies.

### Terminal I/O Bridging

**Output Path**:
```
PDP-11 Emulator → vt52Put() → [overridden] → xterm.write()
```

**Input Path**:
```
User Keyboard → xterm.onData() → vt52Input() → PDP-11 Emulator
```

### CPU Status Structure

```typescript
interface CPUStatus {
  runState: number;           // 0=RUN, 1=RESET, 2=WAIT, 3=HALT, 4=STEP
  programCounter: number;     // R7 (octal)
  stackPointer: number;       // R6 (octal)
  registers: number[];        // R0-R7
  flags: {
    carry: number;
    negative: number;
    zero: number;
    overflow: number;
  };
  psw: number;               // Processor Status Word
}
```

## Usage

### Starting the Emulator

The emulator boots automatically on page load with animated progress.

### Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| Ctrl+R | Reset and reboot the system |
| Ctrl+B | Show boot menu |
| Ctrl+S | Display CPU status |
| Ctrl+C | Send SIGINT (passes through to Unix) |

### Debugging

The following are exposed on `window` for console debugging:
- `window.terminal` - xterm.js Terminal instance
- `window.pdp11` - PDP11Bridge instance
- `window.CPU` - Raw PDP-11 CPU state (after scripts load)

Console commands:
```javascript
// Get CPU status
window.pdp11.getStatus()

// Reset the emulator
window.pdp11.reset()

// Boot the emulator
window.pdp11.boot()

// Single-step (for debugging)
window.pdp11.step()

// Write to terminal
window.terminal.writeln('Hello from console!')
```

## Future Enhancements

### Short Term
1. Disk image loading progress indicator
2. File upload/download (drag and drop)
3. Clipboard integration
4. Memory inspector (Ctrl+M)

### Medium Term
1. Source code overlay (show C code for running programs)
2. Breakpoint support
3. Memory watch windows
4. Network/serial port emulation

### Long Term
1. Multi-terminal support (connect multiple xterm instances)
2. Time-machine mode (V4 → V5 → V6 progression)
3. Educational annotations
4. WebAssembly port for better performance

## Testing

### Manual Test Checklist
- [ ] Page loads and shows boot animation
- [ ] Boot completes without errors
- [ ] Terminal accepts keyboard input
- [ ] Ctrl+R resets and reboots
- [ ] Ctrl+B shows boot menu
- [ ] Ctrl+S displays CPU status
- [ ] Window resize works (terminal fits)
- [ ] Console debugging works

### Known Issues

1. **Disk Image Loading**: Current implementation expects disk at `/disk-images/unix-v5.dsk` but file doesn't exist yet
2. **VT52 Integration**: Full VT52 escape sequence handling not fully tested
3. **Input Echo**: May need tuning for proper terminal echo behavior
4. **Performance**: JavaScript emulator may be slow for complex workloads

## References

- [PDP-11 Emulator by Paul Nankervis](http://skn.noip.me/pdp11/pdp11.html)
- [xterm.js Documentation](https://xtermjs.org/)
- [PDP-11 Architecture](https://en.wikipedia.org/wiki/PDP-11)
- [Unix V5 Documentation](http://cm.bell-labs.com/cm/cs/who/dmr/1stEdman.html)

## Credits

- **PDP-11 Emulator**: Paul Nankervis (pdp11.js)
- **Terminal**: xterm.js team
- **Integration**: Equilateral AI / UnixBox project
- **Unix V5**: Ken Thompson & Dennis Ritchie, Bell Labs (1974)
