# Educational Features Integration Guide

This guide shows how to integrate the newly created educational infrastructure into UnixBox.

## Files Created

1. **`src/types/educational.d.ts`** (104 lines)
   - Type definitions for syscall events, source locations, annotations, and era configs
   - Exported types: `SyscallEvent`, `SourceLocation`, `SyscallAnnotation`, `EraConfig`

2. **`src/educational/EducationalEngine.ts`** (169 lines)
   - Singleton event bus using EventEmitter pattern
   - Methods: `on()`, `off()`, `emit()`, `clearHandlers()`
   - Supports event types: `'syscall'`, `'source-change'`, `'era-change'`

3. **`src/educational/SyscallInterceptor.ts`** (260 lines)
   - Hooks `window.trap()` to intercept syscall vector (0o60)
   - Includes complete Unix V4 syscall mapping (0-50)
   - Extracts syscall number from R0 and arguments from R1-R5
   - Emits events via EducationalEngine

4. **`src/types/pdp11.d.ts`** (updated)
   - Added `trap()` function declaration
   - Added `trap` to Window interface

## Integration Steps

### Step 1: Install the Syscall Interceptor

Add to `src/main.ts` after emulator initialization:

```typescript
import { syscallInterceptor } from './educational/SyscallInterceptor';
import { educationalEngine } from './educational/EducationalEngine';

// After pdp11.initialize() completes:
async function initializeUnixBox() {
  await pdp11.initialize();
  
  // Install syscall interceptor BEFORE boot
  syscallInterceptor.install();
  
  // Register event handlers
  educationalEngine.on('syscall', (event) => {
    console.log(`[Syscall] ${event.name}(${event.number})`, event);
    // Update UI here
  });
  
  // Boot the emulator
  pdp11.boot();
}
```

### Step 2: Listen for Syscall Events

```typescript
import { educationalEngine } from './educational/EducationalEngine';
import type { SyscallEvent } from './types/educational';

// Register a handler for syscall events
educationalEngine.on('syscall', (event: SyscallEvent) => {
  const { name, number, args, pc, timestamp } = event;
  
  console.log(`Syscall: ${name}(${number})`);
  console.log(`  PC: ${pc.toString(8)} (octal)`);
  console.log(`  Args: [${args.map(a => a.toString(8)).join(', ')}]`);
  console.log(`  Time: ${new Date(timestamp).toISOString()}`);
  
  // Update UI panel with syscall details
  updateSyscallPanel(event);
});
```

### Step 3: Display Syscall Information in UI

Create a syscall display panel:

```typescript
function updateSyscallPanel(event: SyscallEvent) {
  const panel = document.getElementById('syscall-panel');
  if (!panel) return;
  
  const entry = document.createElement('div');
  entry.className = 'syscall-entry';
  entry.innerHTML = `
    <span class="syscall-name">${event.name}</span>
    <span class="syscall-number">#${event.number}</span>
    <span class="syscall-pc">PC: ${event.pc.toString(8)}</span>
  `;
  
  panel.prepend(entry);
  
  // Keep only last 50 entries
  while (panel.children.length > 50) {
    panel.removeChild(panel.lastChild!);
  }
}
```

## Architecture

```
┌─────────────────────────────────────────┐
│          PDP-11 Emulator                │
│  (window.trap, window.CPU)              │
└───────────┬─────────────────────────────┘
            │
            │ Intercepts trap(0o60)
            │
┌───────────▼─────────────────────────────┐
│    SyscallInterceptor                   │
│  - Wraps window.trap()                  │
│  - Extracts syscall # from R0           │
│  - Extracts args from R1-R5             │
└───────────┬─────────────────────────────┘
            │
            │ emit('syscall', event)
            │
┌───────────▼─────────────────────────────┐
│    EducationalEngine                    │
│  - Central event bus                    │
│  - Dispatches to all handlers           │
└───────────┬─────────────────────────────┘
            │
            │ on('syscall', handler)
            │
┌───────────▼─────────────────────────────┐
│    UI Components                        │
│  - Syscall panel                        │
│  - Source viewer                        │
│  - Historical annotations               │
└─────────────────────────────────────────┘
```

## Unix V4 Syscall Reference

The interceptor includes mappings for all Unix V4 syscalls:

- **Process Control**: fork(2), exit(1), exec(11), wait(7)
- **File I/O**: open(5), close(6), read(3), write(4), creat(8)
- **File System**: link(9), unlink(10), chdir(12), mknod(14)
- **Permissions**: chmod(15), chown(16), access(33)
- **Status**: stat(18), fstat(28), time(13)
- **IPC**: pipe(42), signal(48), kill(37)
- **Process Info**: getpid(20), getuid(24), setuid(23)

## Testing

To verify the interceptor is working:

```typescript
// In browser console after boot:
console.log('Syscall count:', syscallInterceptor.getSyscallCount());
console.log('Installed:', syscallInterceptor.isInstalled());
console.log('Handlers:', educationalEngine.getHandlerCount('syscall'));
```

## Next Steps

1. **Source Mapping**: Implement PC → source file/line mapping
2. **Syscall Annotations**: Create detailed annotations with historical notes
3. **Era Switching**: Add support for V4/V5/V6 disk image switching
4. **Visual Timeline**: Show syscall flow in real-time
5. **Code Browser**: Link syscalls to Unix V4 source code

## Build Verification

All files compile successfully with TypeScript:
```bash
npm run build
# ✓ built in 529ms
```
