# UnixBox - Quick Start Guide

## Installation

```bash
cd /Users/jamesford/Source/UnixV4-Resurrection/unixbox
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000 (or the port shown in terminal)

## Build

```bash
npm run build
```

Output: `dist/` directory

## Preview Production Build

```bash
npm run preview
```

## Verify Configuration

```bash
# TypeScript check
npx tsc --noEmit

# Build test
npm run build

# Run test suite
./test-vite-config.sh
```

## Key Files

- `vite.config.ts` - Vite configuration with CORS and Range support
- `src/types/pdp11.d.ts` - TypeScript declarations for PDP-11 emulator
- `src/emulator/pdp11-bridge.ts` - Bridge between emulator and xterm.js
- `src/main.ts` - Application entry point
- `public/vendor/pdp11/` - PDP-11 emulator scripts (loaded dynamically)
- `public/disk-images/unix-v5.dsk` - Unix V5 disk image (2.4 MB)

## Documentation

- `docs/VITE_CONFIGURATION.md` - Comprehensive configuration guide
- `docs/SETUP_COMPLETE.md` - Setup summary and verification

## Keyboard Shortcuts (in emulator)

- **Ctrl+R** - Reset and reboot
- **Ctrl+B** - Boot menu
- **Ctrl+S** - CPU status
- **Ctrl+C** - Send SIGINT

## Debugging

Open browser console and use:

```javascript
// Get CPU status
window.pdp11.getStatus()

// Access terminal
window.terminal.write('Hello\r\n')

// Check CPU state
window.CPU.runState  // 0=RUN, 1=RESET, 2=WAIT, 3=HALT, 4=STEP
window.CPU.registerVal[7]  // Program Counter (R7)
```

## Common Issues

### Port already in use
Vite will automatically try the next available port (3001, 3002, etc.)

### TypeScript errors
```bash
# Restart TypeScript server in your IDE
# Or check: npx tsc --noEmit
```

### Emulator not loading
Check browser console for:
- Script loading errors
- Network errors for disk image
- CORS issues

### Disk image not accessible
```bash
# Test in another terminal while dev server running:
curl -I http://localhost:3000/disk-images/unix-v5.dsk

# Should show:
# HTTP/1.1 200 OK
# Accept-Ranges: bytes
```

## Project Structure

```
unixbox/
├── public/                    # Static assets (served as-is)
│   ├── vendor/pdp11/         # Emulator scripts
│   └── disk-images/          # Disk images
├── src/                       # TypeScript source
│   ├── types/                # Type declarations
│   ├── emulator/             # Emulator bridge
│   └── main.ts               # Entry point
├── docs/                      # Documentation
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Success Indicators

When running `npm run dev`, you should see:
- ✅ Terminal initializes with green border
- ✅ "Loading PDP-11 emulator core..." message
- ✅ "Core loaded successfully" message
- ✅ "Terminal connected" message
- ✅ "Starting PDP-11/40" message
- ✅ Boot progress indicators
- ✅ Unix login prompt (eventually)

## Next Steps

1. Start dev server: `npm run dev`
2. Open browser to http://localhost:3000
3. Wait for emulator to boot (~5 seconds)
4. Interact with Unix V5

For detailed configuration information, see `docs/VITE_CONFIGURATION.md`
