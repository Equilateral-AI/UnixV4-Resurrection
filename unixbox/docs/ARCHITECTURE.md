# UnixBox Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Window                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   index.html + CSS                        │  │
│  │  - Retro CRT styling (scanlines, glow effects)            │  │
│  │  - Green phosphor theme (#00ff00 on #001100)              │  │
│  │  - Responsive layout                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      main.ts                              │  │
│  │  - xterm.js Terminal initialization                       │  │
│  │  - Keyboard shortcuts (Ctrl+R, Ctrl+B, Ctrl+S)            │  │
│  │  - Boot sequence animation                                │  │
│  │  - Visual effects and status displays                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              pdp11-bridge.ts (TypeScript)                 │  │
│  │  - Dynamic script loader                                  │  │
│  │  - Terminal I/O bridging                                  │  │
│  │  - CPU status monitoring                                  │  │
│  │  - Disk configuration                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          PDP-11 Emulator (JavaScript Modules)             │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  pdp11.js   │  │ iopage.js│  │  fpp.js  │            │  │
│  │  │  CPU Core   │  │ I/O Page │  │   FPU    │            │  │
│  │  └─────────────┘  └──────────┘  └──────────┘            │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌──────────┐                           │  │
│  │  │  vt52.js    │  │bootcode.js│                          │  │
│  │  │  Terminal   │  │ Boot ROM │                           │  │
│  │  └─────────────┘  └──────────┘                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Virtual Hardware                         │  │
│  │  - Memory (256 KB)                                        │  │
│  │  - RK05 Disk Drive (unix-v5.dsk)                          │  │
│  │  - Console Terminal (VT52)                                │  │
│  │  - Floating Point Unit                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Terminal Output (PDP-11 → User)

```
┌──────────────┐
│  PDP-11 CPU  │
│  (pdp11.js)  │
└──────┬───────┘
       │ Character output
       ▼
┌──────────────┐
│   I/O Page   │  Device write to console address
│  (iopage.js) │  (177566 - transmit buffer)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   vt52Put()  │  Original: writes to <textarea>
│              │  Overridden: writes to xterm.js
└──────┬───────┘
       │
       ▼
┌──────────────┐
│terminal.write│  xterm.js writes to terminal
│   (xterm.js) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Screen Update│  Visible to user
│   (Canvas)   │
└──────────────┘
```

### Terminal Input (User → PDP-11)

```
┌──────────────┐
│ User Keyboard│
└──────┬───────┘
       │ Key press
       ▼
┌──────────────┐
│terminal.onData│ xterm.js keyboard handler
│   (xterm.js) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│vt52Input()   │  Convert to character codes
│              │  Handle special keys
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   I/O Page   │  Device read from console address
│  (iopage.js) │  (177560 - receiver buffer)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PDP-11 CPU  │  Instruction fetch and execute
│  (pdp11.js)  │
└──────────────┘
```

## Component Responsibilities

### main.ts (Application Entry Point)

**Purpose**: Orchestrate the entire application lifecycle

**Responsibilities**:
- Initialize xterm.js with retro theme
- Load and initialize PDP-11 emulator via bridge
- Handle keyboard shortcuts (Ctrl+R, Ctrl+B, Ctrl+S)
- Show boot animation and progress
- Display CPU status and menus
- Manage window resize events

**Key Functions**:
- `bootEmulator()` - Initialize and start the emulator
- `bootWithProgress()` - Animated boot sequence
- `showBootProgress()` - Progress indicator
- `attachCustomKeyEventHandler()` - Keyboard shortcuts

### pdp11-bridge.ts (Emulator Bridge)

**Purpose**: Provide a clean TypeScript interface to the JavaScript emulator

**Responsibilities**:
- Dynamically load emulator scripts in correct order
- Bridge terminal I/O between xterm.js and VT52 emulation
- Expose CPU status and control methods
- Configure disk images and devices
- Handle emulator lifecycle (init, boot, reset, run, step)

**Key Methods**:
- `initialize()` - Load scripts asynchronously
- `connectTerminal(terminal)` - Bridge I/O
- `boot()` - Start boot sequence
- `reset()` - CPU reset
- `getStatus()` - CPU state snapshot
- `run()`, `step()`, `panel()` - CPU control

**Key Patterns**:
- Override `window.vt52Put()` to redirect output
- Connect `terminal.onData()` to `window.vt52Input()`
- Proxy `XMLHttpRequest` to redirect disk image URLs

### PDP-11 Emulator (JavaScript)

**Purpose**: Accurate emulation of PDP-11/40 hardware

**Components**:

1. **pdp11.js** - CPU Core
   - Instruction decode and execution
   - Register management (R0-R7, PSW)
   - Memory management unit (MMU)
   - Trap and interrupt handling
   - Condition codes (N, Z, V, C)

2. **iopage.js** - I/O Page
   - Device registration
   - Memory-mapped I/O (addresses 160000-177777)
   - Console terminal (DL11)
   - Disk controller (RK11)
   - Interrupt priority management

3. **fpp.js** - Floating Point Processor
   - FP instruction execution
   - FP registers (AC0-AC5)
   - FP arithmetic and transcendentals

4. **vt52.js** - VT52 Terminal
   - Escape sequence handling
   - Cursor positioning
   - Screen buffer management
   - Keyboard event processing

5. **bootcode.js** - Bootstrap ROM
   - Boot loader at address 173000
   - Disk boot sequence
   - Initial PC and SP setup

## Boot Sequence

### Phase 1: HTML Load
1. Browser loads index.html
2. CSS applies retro CRT styling
3. Vite loads bundled main.js

### Phase 2: Terminal Initialization
1. `main.ts` creates xterm.js Terminal
2. Configure retro green theme
3. Load FitAddon and WebLinksAddon
4. Mount terminal to DOM element
5. Show boot banner

### Phase 3: Emulator Initialization
1. Call `pdp11.initialize()`
2. Load scripts sequentially:
   - pdp11.js (CPU core)
   - iopage.js (I/O system)
   - bootcode.js (boot ROM)
   - fpp.js (FPU)
   - vt52.js (terminal)
3. Show progress for each script (250ms delay)

### Phase 4: Terminal Connection
1. Call `pdp11.connectTerminal(terminal)`
2. Initialize VT52 terminal unit 0
3. Override `vt52Put()` for output
4. Connect `terminal.onData()` for input

### Phase 5: Boot
1. Call `pdp11.boot()`
2. Load boot code into memory at 173000
3. Set PC and SP to boot address
4. Set CPU run state to RUN
5. Start processor execution loop

### Phase 6: Ready
1. Display "System booted successfully"
2. Show keyboard shortcuts
3. Wait for Unix kernel to print login prompt
4. Ready for user interaction

## Memory Map

```
Octal Address Range  | Description
---------------------|------------------------------------------
000000 - 157777      | User memory (up to 28K words)
160000 - 177777      | I/O page (4K words)
  177560             | Console receiver status
  177562             | Console receiver buffer
  177564             | Console transmit status
  177566             | Console transmit buffer
  177400 - 177417    | RK11 disk controller
200000 - 757777      | Extended memory (if present)
760000 - 777777      | I/O page (22-bit bus)
```

## State Diagram

```
┌─────────┐
│  IDLE   │
└────┬────┘
     │ initialize()
     ▼
┌─────────┐
│LOADING  │ Load scripts
└────┬────┘
     │ all scripts loaded
     ▼
┌─────────┐
│ READY   │
└────┬────┘
     │ boot()
     ▼
┌─────────┐
│RUNNING  │ ◄─────────┐
└────┬────┘           │
     │                │
     ├──error────► ERROR
     │                │
     ├──reset────► RESET ──┘
     │
     └──halt─────► HALT
```

## File Structure

```
unixbox/
├── public/
│   ├── vendor/
│   │   └── pdp11/
│   │       ├── pdp11.js      (CPU emulator)
│   │       ├── iopage.js     (I/O system)
│   │       ├── fpp.js        (FPU)
│   │       ├── vt52.js       (Terminal)
│   │       └── bootcode.js   (Boot ROM)
│   └── disk-images/
│       └── unix-v5.dsk       (Unix V5 disk image)
├── src/
│   ├── main.ts               (Entry point)
│   └── emulator/
│       └── pdp11-bridge.ts   (Emulator bridge)
├── docs/
│   ├── SETUP_NOTES.md
│   ├── PDP11_INTEGRATION.md
│   └── ARCHITECTURE.md       (This file)
├── index.html                (Main HTML)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Performance Considerations

### Bottlenecks
1. **JavaScript Execution**: Emulator runs in interpreted JavaScript
2. **Terminal Rendering**: xterm.js canvas updates
3. **Script Loading**: 5 scripts loaded sequentially on boot

### Optimizations
1. **Lazy Script Loading**: Scripts only loaded on first boot
2. **Script Caching**: Browser caches emulator scripts
3. **Terminal Throttling**: xterm.js batches updates
4. **Efficient I/O**: Direct character writes, no buffering

### Future Optimizations
1. **WebAssembly Port**: Compile emulator to WASM
2. **Worker Threads**: Run emulator in background thread
3. **Bundling**: Bundle emulator scripts with Vite
4. **Ahead-of-Time Compilation**: Pre-compile frequently used code

## Browser Compatibility

**Tested**:
- Chrome 120+ ✓
- Firefox 120+ ✓
- Safari 17+ ✓
- Edge 120+ ✓

**Requirements**:
- ES2020 support
- Canvas API
- Web Workers (for future optimization)
- Local Storage (for settings)
- Fetch API / XMLHttpRequest

**Not Supported**:
- IE 11 and earlier
- Old mobile browsers
- Text-only browsers

## Security Considerations

1. **Script Loading**: All scripts loaded from same origin
2. **No Remote Code**: Emulator runs entirely in browser
3. **Disk Images**: Local files only (no external URLs)
4. **No Persistence**: No cookies or external storage
5. **Sandboxing**: Runs in browser sandbox

## Development Workflow

### Build
```bash
npm run build
```
Outputs to `dist/` directory.

### Development Server
```bash
npm run dev
```
Runs Vite dev server on http://localhost:3000 with hot reload.

### Preview Production
```bash
npm run preview
```
Preview the production build locally.

## Debugging

### Console Access
```javascript
// Terminal instance
window.terminal

// Emulator bridge
window.pdp11

// Raw CPU state
window.CPU

// I/O page
window.iopage

// VT52 terminal
window.VT52
```

### Useful Commands
```javascript
// Get CPU status
window.pdp11.getStatus()

// Examine memory (octal address)
window.CPU.memory[0o1000 >> 1]

// Set breakpoint (in emulator)
window.log.debugPC = 0o1234

// Single step
window.pdp11.step()
```

## Credits

- **CPU Emulator**: Paul Nankervis (pdp11.js v4.0)
- **Terminal**: xterm.js team
- **Build System**: Vite
- **Integration**: Equilateral AI
- **Unix V5**: Ken Thompson & Dennis Ritchie, Bell Labs (1974)
