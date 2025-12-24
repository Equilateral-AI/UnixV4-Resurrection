# UnixBox Setup Notes

## Project Created: 2025-12-24

### Stack
- **Build Tool**: Vite 5.0
- **Language**: TypeScript 5.2
- **Terminal**: xterm.js 5.3 with FitAddon and WebLinksAddon
- **Server**: Dev server on http://localhost:3000

### Files Created

#### Configuration
- `package.json` - npm project with Vite + TypeScript + xterm dependencies
- `tsconfig.json` - TypeScript config targeting ES2020
- `vite.config.ts` - Vite dev server config (port 3000)
- `.gitignore` - Standard Node.js + Vite ignores

#### Application
- `index.html` - Main HTML with retro CRT styling
  - Dark background with green phosphor text
  - CRT scanline effect (CSS)
  - Radial glow effect
  - Header: "UnixBox - Unix V5 (November 1974)"

- `src/main.ts` - Terminal initialization
  - xterm.js terminal with retro green theme
  - 80x24 dimensions (authentic PDP-11 terminal size)
  - FitAddon for responsive sizing
  - WebLinksAddon for clickable URLs
  - Boot message with ASCII art box
  - Basic echo mode for testing (will be replaced by PDP-11 emulator)

### Visual Design

**Color Scheme**:
- Background: `#000` (pure black)
- Terminal bg: `#001100` (very dark green)
- Text: `#00ff00` (bright green, like old terminals)
- Glow effects with CSS text-shadow and radial-gradient

**Effects**:
- Scanlines (CSS background stripes)
- CRT glow (radial gradient overlay)
- Text glow (text-shadow)
- Header flicker animation

### Testing

Terminal responds to keyboard input with basic echo:
- Characters are echoed back
- Enter creates new line with `$ ` prompt
- Backspace removes characters

This is just for testing - real input will be handled by PDP-11 emulator.

### Next Steps

1. **Integrate PDP-11 Emulator**
   - Port pdp11.js or similar emulator
   - Connect to xterm.js via terminal.onData / terminal.write

2. **Load Unix V5 Disk Image**
   - Convert v5root.tar.gz to disk image format
   - Configure emulator to mount disk

3. **Boot Sequence**
   - Initialize PDP-11 CPU
   - Load bootloader
   - Boot Unix V5 kernel
   - Start login prompt

### Dependencies

```json
{
  "xterm": "^5.3.0",           // Terminal emulator
  "xterm-addon-fit": "^0.8.0",  // Auto-resize
  "xterm-addon-web-links": "^0.9.0", // Clickable links
  "typescript": "^5.2.2",       // TypeScript compiler
  "vite": "^5.0.0"              // Build tool
}
```

Note: xterm packages are deprecated in favor of @xterm/* scope, but current versions work fine.

### Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Terminal Window Object

The terminal instance is exposed on `window.terminal` for debugging:

```javascript
window.terminal.writeln('Hello from console!')
window.terminal.clear()
```

### Known Issues

None currently - basic terminal UI works as expected.

### References

- [xterm.js Documentation](https://xtermjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [PDP-11 Architecture](https://en.wikipedia.org/wiki/PDP-11)
- [Unix V5 on Archive.org](https://archive.org/details/unix-5th-edition)
