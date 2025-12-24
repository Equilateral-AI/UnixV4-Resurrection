# Source Code Overlay Feature

Educational feature for UnixBox that displays real Unix V4 source code alongside the running emulator.

## Overview

This feature provides an interactive overlay panel that shows the actual 1973 Unix Version 4 source code for system calls and kernel operations as they execute in the emulator. Perfect for students learning operating systems and Unix history.

## Features

- **Real Unix V4 Source**: Authentic source code from Bell Labs (1973)
- **Interactive Display**: Shows source for syscalls as they execute
- **Terminal Aesthetic**: Green-on-black theme matching UnixBox
- **Draggable Panel**: Position the source panel wherever you want
- **Line Highlighting**: Highlights specific lines of interest
- **Syntax Hints**: Comments, labels, and code are visually distinguished
- **Search**: Find source code by keyword
- **Educational Notes**: Special annotations for complex code sections

## Architecture

```
source-overlay/
├── source-index.json    - Pre-indexed source code database
├── SourceOverlay.ts     - Core manager class
├── SourcePanel.ts       - UI component (vanilla JS)
├── index.ts             - Public API exports
├── example.ts           - Usage examples
└── README.md            - This file
```

## Source Files Indexed

The following Unix V4 kernel files are indexed:

- **slp.c**: Process scheduling (`sleep`, `wakeup`, `swtch`)
- **sys1.c**: System calls part 1 (`fork`, `exec`, `wait`, `exit`)
- **sys2.c**: System calls part 2 (`read`, `write`, `open`, `close`, `creat`)
- **trap.c**: Trap and syscall dispatch
- **pipe.c**: Pipe implementation
- **sig.c**: Signal handling
- **sh.c**: Shell source code

## Usage

### Basic Usage

```typescript
import { sourceOverlay, SourcePanel } from './features/source-overlay';

// Create a source panel
const panel = new SourcePanel({
  position: 'right',
  width: '600px',
  height: '500px',
  autoShow: true
});

// Enable dragging
panel.enableDragging();

// Show source for a syscall
const forkSource = sourceOverlay.getSourceForSyscall('fork');
if (forkSource) {
  panel.updateSource(forkSource);
  panel.show();
}
```

### Integration with Emulator

```typescript
// Subscribe to syscall events from EducationalEngine
sourceOverlay.subscribeToSyscallEvents((syscallName: string) => {
  const source = sourceOverlay.getSourceForSyscall(syscallName);
  if (source) {
    panel.updateSource(source);
    panel.show();
  }
});

// When a syscall occurs in the emulator, emit the event
sourceOverlay.emitSyscallEvent('fork');
```

### Keyboard Shortcuts Example

```typescript
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+S: Toggle source panel
  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    panel.toggle();
  }
});
```

### Quick Start

The easiest way to get started:

```typescript
import { initializeSourceOverlay } from './features/source-overlay/example';

// Initialize with defaults and keyboard shortcuts
const panel = initializeSourceOverlay();
```

This sets up:
- Source panel on the right side
- Keyboard shortcuts (Ctrl+Shift+S, Ctrl+Shift+F, Escape)
- Syscall event subscriptions
- Browser console access

## API Reference

### SourceOverlay

Main manager class for source code lookups and events.

```typescript
class SourceOverlay {
  // Get source code for a syscall
  getSourceForSyscall(syscallName: string): SourceCodeEntry | null;

  // Get currently displayed source
  getCurrentSource(): SourceCodeEntry | null;

  // Subscribe to syscall events
  subscribeToSyscallEvents(callback: (syscallName: string) => void): void;

  // Emit a syscall event
  emitSyscallEvent(syscallName: string): void;

  // Get all available syscalls
  getAvailableSyscalls(): string[];

  // Search source code
  searchSource(keyword: string): SourceCodeEntry[];

  // Format source code for display
  formatSourceCode(entry: SourceCodeEntry): Array<{
    lineNumber: number;
    content: string;
    type: 'comment' | 'code' | 'label';
  }>;
}
```

### SourcePanel

UI component for displaying source code.

```typescript
class SourcePanel {
  constructor(options?: SourcePanelOptions);

  // Show/hide the panel
  show(): void;
  hide(): void;
  toggle(): void;

  // Update displayed source
  updateSource(entry: SourceCodeEntry | null, highlightLine?: number): void;

  // Highlight a specific line
  highlightLine(lineNumber: number): void;

  // Make panel draggable
  enableDragging(): void;

  // Check visibility
  isShown(): boolean;

  // Clean up
  destroy(): void;
}

interface SourcePanelOptions {
  container?: HTMLElement;    // Default: document.body
  width?: string;             // Default: '600px'
  height?: string;            // Default: '400px'
  position?: 'left' | 'right' | 'bottom'; // Default: 'right'
  autoShow?: boolean;         // Default: true
}
```

### SourceCodeEntry

Data structure for source code entries.

```typescript
interface SourceCodeEntry {
  file: string;           // Source file name
  description: string;    // Human-readable description
  startLine: number;      // Starting line number
  code: string;           // Source code text
  note?: string;          // Optional educational note
  context?: string;       // Optional context
}
```

## Available Syscalls

You can view source for these syscalls:

**Process Management:**
- `fork` - Create a new process
- `exec` - Execute a program
- `exit` - Terminate process
- `wait` - Wait for child process
- `swtch` - Context switch

**File I/O:**
- `read` - Read from file descriptor
- `write` - Write to file descriptor
- `open` - Open a file
- `close` - Close a file descriptor
- `creat` - Create a file

**IPC:**
- `pipe` - Create pipe

**Process Synchronization:**
- `sleep` - Put process to sleep
- `wakeup` - Wake up sleeping processes

**Signals:**
- `signal` - Signal handling

**Shell:**
- `main` - Shell main loop
- `execute` - Command execution

## Educational Features

### The Famous Comment

The `swtch()` function contains complex context-switching logic that confused even the original Unix developers. In later versions (Unix V6), they added the famous comment:

> "You are not expected to understand this"

Access it with:

```typescript
const famousComment = sourceOverlay.getFamousComment();
```

### Historical Context

All source code is from Unix Version 4 (1973), copyright Bell Telephone Laboratories. This was one of the earliest portable Unix versions, written primarily by Ken Thompson and Dennis Ritchie.

## Styling

The panel uses a classic terminal aesthetic:

- **Background**: Pure black (#000000)
- **Text**: Bright green (#00ff00)
- **Comments**: Dimmed green (#00aa00)
- **Labels**: Cyan-green (#00ffaa)
- **Highlights**: Dark green background (#003300)
- **Border**: Green with glow effect
- **Font**: Courier New monospace

## Integration Points

### With EducationalEngine

The Source Overlay is designed to integrate with the EducationalEngine:

```typescript
// In EducationalEngine
educationalEngine.on('syscall', (syscallName) => {
  sourceOverlay.emitSyscallEvent(syscallName);
});
```

### With PDP-11 Emulator

Connect to the emulator's syscall trap:

```typescript
// When emulator executes a trap instruction
emulator.on('trap', (trapNumber) => {
  if (trapNumber === 0) { // Syscall trap
    const syscallNumber = emulator.getRegister('R0');
    const syscallName = mapSyscallNumberToName(syscallNumber);
    sourceOverlay.emitSyscallEvent(syscallName);
  }
});
```

### Browser Console Access

When loaded in a browser, these are available globally:

```javascript
// Global access
window.sourceOverlay
window.SourcePanel
window.initSourceOverlay()
```

Try in the console:

```javascript
// See all syscalls
sourceOverlay.getAvailableSyscalls()

// Search for "fork"
sourceOverlay.searchSource('fork')

// Show fork source
const fork = sourceOverlay.getSourceForSyscall('fork')
console.log(fork.code)
```

## Example Workflows

### 1. Student Learning Workflow

```typescript
// Initialize overlay
const panel = initializeSourceOverlay();

// Student runs a command in the emulator (e.g., "ls")
// The emulator detects fork() syscall
sourceOverlay.emitSyscallEvent('fork');
// Panel shows fork() source automatically

// Student can browse related syscalls
const execSource = sourceOverlay.getSourceForSyscall('exec');
panel.updateSource(execSource);
```

### 2. Interactive Tutorial

```typescript
// Create tutorial steps
const tutorial = [
  { syscall: 'fork', note: 'First, the shell forks a new process...' },
  { syscall: 'exec', note: 'Then it executes the program...' },
  { syscall: 'wait', note: 'Finally, it waits for completion...' }
];

let step = 0;
const panel = new SourcePanel();
panel.enableDragging();

function showStep() {
  const source = sourceOverlay.getSourceForSyscall(tutorial[step].syscall);
  if (source) {
    panel.updateSource(source);
    console.log(tutorial[step].note);
  }
}

// Advance with spacebar
document.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    step = (step + 1) % tutorial.length;
    showStep();
  }
});

showStep();
```

### 3. Code Exploration

```typescript
// Search for all pipe-related code
const results = sourceOverlay.searchSource('pipe');

// Create a results browser
results.forEach((result, index) => {
  console.log(`${index + 1}. ${result.file}: ${result.description}`);
});

// View specific result
const panel = new SourcePanel();
panel.updateSource(results[0]);
```

## Accessibility

- Keyboard navigable (Tab, Enter, Escape)
- High contrast green-on-black (WCAG AAA for terminal emulation)
- Resizable panel (user can adjust size)
- Draggable positioning (accommodates different screen layouts)

## Performance

- Source code is pre-indexed (no runtime parsing)
- JSON data structure (~30KB compressed)
- Lazy loading of panel UI
- Efficient DOM updates (only modified lines)

## Future Enhancements

Potential additions:

- [ ] Cross-references between functions
- [ ] Call graph visualization
- [ ] Assembly code overlay (show PDP-11 assembly)
- [ ] Annotated source with explanations
- [ ] Side-by-side comparison (V4 vs modern Unix)
- [ ] Execution flow tracing
- [ ] Memory layout visualization

## License

The Unix V4 source code is historical material from Bell Labs (1973). The overlay implementation is part of UnixBox.

## Credits

- Unix V4 source: Ken Thompson, Dennis Ritchie, Bell Labs
- Source Overlay feature: Part of UnixBox educational project
- Inspired by Lions' Commentary on UNIX (1977)
