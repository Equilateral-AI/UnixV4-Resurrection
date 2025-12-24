# Educational Annotations Feature

The Educational Annotations system provides real-time educational context about Unix V5 system calls as they execute in the PDP-11 emulator.

## Components

### 1. syscall-annotations.json

Curated educational content for key Unix V5 system calls:

- **exit (1)** - Process termination and zombie states
- **fork (2)** - Process creation and the fork/exec model
- **read (3)** - File I/O and "everything is a file"
- **write (4)** - Output operations and buffer management
- **open (5)** - File descriptor allocation
- **close (6)** - Resource cleanup and reference counting
- **wait (7)** - Parent-child synchronization
- **exec (11)** - Program loading and the fork/exec pattern
- **break (17)** - Heap management (brk/sbrk)
- **seek (19)** - File positioning and sparse files
- **pipe (42)** - Inter-process communication

Each annotation includes:
- **name** - Syscall name (e.g., "fork")
- **signature** - Function signature (e.g., "int fork(void)")
- **description** - What the syscall does
- **implementation** - How Ken Thompson and Dennis Ritchie implemented it in Unix V5
- **historicalNote** - Why it matters and its influence on modern systems
- **codeSnippet** - Actual C code from Unix V5 source (when available)

### 2. AnnotationEngine.ts

Monitors PDP-11 CPU execution and detects system calls:

**How it works:**
- Polls CPU state every 100ms (configurable)
- Detects TRAP instructions (104xxx octal)
- Extracts syscall number from low bits
- Looks up annotation from loaded data
- Notifies registered callbacks

**API:**
```typescript
// Get annotation for a specific syscall
const annotation = annotationEngine.getAnnotation(2); // fork

// Register callback for automatic detection
annotationEngine.onSyscallDetected((syscallNum, annotation) => {
  console.log(`Detected: ${annotation.name}`);
  annotationPanel.displayAnnotation(annotation);
});

// Start/stop monitoring
annotationEngine.startMonitoring();
annotationEngine.stopMonitoring();

// Manually trigger annotation (for testing/demos)
annotationEngine.showAnnotation(2); // Show fork annotation

// Get list of available syscalls
const available = annotationEngine.getAvailableSyscalls();
// Returns: [1, 2, 3, 4, 5, 6, 7, 11, 17, 19, 42]
```

### 3. AnnotationPanel.ts

UI component that displays annotations in a green-on-black terminal aesthetic:

**Features:**
- Fixed position panel (top-right by default)
- Green (#00ff00) on black (#001100) color scheme
- Expandable "Implementation Details" section
- Syntax-highlighted code snippets
- Special styling for historical notes
- Smooth fade-in/fade-out animations
- Scrollable content for long annotations

**API:**
```typescript
// Display an annotation
annotationPanel.displayAnnotation(annotation);

// Show/hide panel
annotationPanel.show();
annotationPanel.hide();
annotationPanel.toggle();

// Check visibility
if (annotationPanel.visible()) {
  // Panel is shown
}

// Customize position
annotationPanel.setPosition('10px', '10px'); // top, right
annotationPanel.setWidth('500px');
```

## Integration with UnixBox

The annotation system is integrated into `main.ts`:

1. **Initialization** - During emulator boot, callbacks are registered
2. **Monitoring** - Starts automatically 2 seconds after boot completes
3. **Keyboard Shortcut** - `Ctrl+A` toggles the annotation panel
4. **Debug Access** - Available as `window.annotationEngine` and `window.annotationPanel`

## Usage Examples

### Manual Testing

```javascript
// In browser console after UnixBox loads:

// Show specific syscall annotation
annotationEngine.showAnnotation(2); // fork
annotationEngine.showAnnotation(42); // pipe

// List all available annotations
annotationEngine.getSummary();
// Returns: [
//   { syscallNum: 1, name: "exit", signature: "exit(status)" },
//   { syscallNum: 2, name: "fork", signature: "int fork(void)" },
//   ...
// ]

// Toggle panel
annotationPanel.toggle();

// Check if monitoring is active
if (annotationEngine.isMonitoring()) {
  console.log('Monitoring syscalls...');
}
```

### Educational Demonstrations

To demonstrate a specific syscall:

1. Open UnixBox
2. Press `Ctrl+A` to ensure panel is visible
3. In browser console: `annotationEngine.showAnnotation(2)`
4. The fork() annotation appears with full details
5. Read the implementation details and historical context

### Automatic Detection

System calls are detected automatically:

1. Boot UnixBox
2. Log in to Unix V5
3. Run commands like `ls`, `cat`, `who`
4. Watch the annotation panel update as syscalls execute
5. Learn about Unix internals in real-time

## Implementation Notes

### Syscall Detection

Unix V5 uses TRAP instructions for system calls:
- TRAP instruction format: `104000 | syscall_number` (octal)
- Example: `104002` = fork (syscall 2)
- Example: `104052` = pipe (syscall 42 decimal = 52 octal)

The AnnotationEngine detects these by:
1. Reading the instruction at PC-2 (last executed)
2. Checking if it matches the TRAP pattern
3. Extracting the syscall number from low bits

### Why Polling?

The current implementation polls CPU state rather than hooking the emulator directly because:
- Non-invasive: doesn't modify the emulator code
- Simple: works with the existing bridge architecture
- Sufficient: 100ms polling is fast enough for educational purposes

For production, consider:
- Adding an instruction execution hook to the emulator
- Emitting events from the TRAP handler
- Reducing false positives from non-syscall TRAPs

### Performance

Minimal impact:
- JSON data loaded once at startup (~15KB)
- Polling runs every 100ms (10 times/second)
- Callbacks only fire when new syscall detected
- UI updates use CSS transitions (GPU accelerated)

## Future Enhancements

Potential additions:
- **More syscalls** - Add annotations for all 64+ Unix V5 syscalls
- **Source linking** - Link to actual Unix V5 source on GitHub
- **Interactive demos** - Step-by-step tutorials for each syscall
- **Historical timeline** - Show evolution from V5 to modern Linux
- **Assembly view** - Show actual PDP-11 assembly for syscall entry
- **Call graph** - Visualize syscall relationships and dependencies
- **Comparison mode** - Compare Unix V5 vs modern Linux implementations

## Credits

- **Unix V5 Source** - Ken Thompson, Dennis Ritchie, and Bell Labs
- **Educational Content** - Synthesized from:
  - "Lions' Commentary on UNIX 6th Edition" by John Lions
  - Unix V5/V6/V7 source code (available via Caldera license)
  - "The Unix Programming Environment" by Kernighan & Pike
  - Bell Labs technical papers and memos
- **Implementation** - UnixBox Educational Annotations System

## License

The educational content is derived from historical Unix documentation and source code, now in the public domain or available under permissive licenses. The annotation system code follows the UnixBox project license.
