# Quick Integration Guide

## 5-Minute Integration

### Step 1: Import the Feature

In your `main.ts` or initialization file:

```typescript
import { initializeSourceOverlay } from './features/source-overlay/example';

// Initialize during app startup
const sourcePanel = initializeSourceOverlay();
```

That's it! The feature is now active with default keyboard shortcuts.

### Step 2 (Optional): Connect to Emulator

If you want automatic source display when syscalls execute:

```typescript
import { sourceOverlay } from './features/source-overlay';

// In your emulator initialization
emulator.on('syscall', (syscallName: string) => {
  sourceOverlay.emitSyscallEvent(syscallName);
});
```

### Step 3 (Optional): Add UI Toggle

Add a button to your UI:

```html
<button onclick="window.sourcePanel.toggle()">View Source Code</button>
```

## Manual Integration

If you want more control:

```typescript
import { SourcePanel, sourceOverlay } from './features/source-overlay';

// Create panel with custom options
const panel = new SourcePanel({
  position: 'right',
  width: '700px',
  height: '600px',
  autoShow: false
});

// Enable dragging
panel.enableDragging();

// Subscribe to syscall events
sourceOverlay.subscribeToSyscallEvents((syscallName) => {
  const source = sourceOverlay.getSourceForSyscall(syscallName);
  if (source) {
    panel.updateSource(source);
    panel.show();
  }
});

// Custom keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.key === 'F9') {
    panel.toggle();
  }
});
```

## Testing Without Emulator

Use the standalone demo:

```bash
cd src/features/source-overlay
open demo.html
```

Or in TypeScript:

```typescript
import { sourceOverlay, SourcePanel } from './features/source-overlay';

const panel = new SourcePanel();
panel.enableDragging();

// Show fork() source
const forkSource = sourceOverlay.getSourceForSyscall('fork');
panel.updateSource(forkSource);
panel.show();
```

## Browser Console Access

After initialization, these are available in the console:

```javascript
// Show any syscall
sourceOverlay.getSourceForSyscall('fork')

// List all available
sourceOverlay.getAvailableSyscalls()

// Search
sourceOverlay.searchSource('pipe')

// Toggle panel
sourcePanel.toggle()
```

## Default Keyboard Shortcuts

- **Ctrl+Shift+S**: Toggle source panel
- **Ctrl+Shift+F**: Show fork() source
- **Escape**: Hide panel

## Tips

1. **Panel Position**: Panel is draggable - grab the header
2. **Panel Size**: Panel is resizable - drag bottom-right corner
3. **Line Highlighting**: Highlight specific lines with `panel.highlightLine(215)`
4. **Search**: Use `searchSource()` to find code snippets
5. **Famous Comment**: Check out `swtch()` for kernel complexity

## Common Use Cases

### Use Case 1: Show source when user runs a command

```typescript
// When "ls" command executes
userRunsCommand('ls');
  → fork() syscall
    → sourceOverlay.emitSyscallEvent('fork')
      → Panel shows fork() source
```

### Use Case 2: Educational walkthrough

```typescript
const tutorial = ['fork', 'exec', 'wait'];
let step = 0;

nextButton.onclick = () => {
  const source = sourceOverlay.getSourceForSyscall(tutorial[step]);
  panel.updateSource(source);
  step = (step + 1) % tutorial.length;
};
```

### Use Case 3: Debugging/exploration

```typescript
// Student wants to understand pipes
const results = sourceOverlay.searchSource('pipe');
results.forEach(r => {
  console.log(`${r.file}: ${r.description}`);
});
```

## Troubleshooting

### Panel doesn't show
- Check that `panel.show()` is called
- Check z-index conflicts (panel is 10000)
- Check browser console for errors

### Source not found
- Verify syscall name matches index (case-insensitive)
- Use `getAvailableSyscalls()` to see all options

### TypeScript errors
- Make sure types are imported: `import type { SourceCodeEntry } from ...`
- Check tsconfig.json allows JSON imports

## Next Steps

1. Read README.md for full API documentation
2. Check example.ts for more usage patterns
3. Open demo.html to see it in action
4. Integrate with your emulator's syscall handler

## Questions?

Refer to:
- `README.md` - Full documentation
- `example.ts` - Code examples
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `demo.html` - Live demo
