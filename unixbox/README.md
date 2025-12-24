# UnixBox - Unix V5 in Your Browser

Run authentic 1974 Unix in any modern browser.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser to see the terminal UI.

## Current Status

**Terminal UI**: Complete - Retro CRT-style terminal with green phosphor aesthetics
**PDP-11 Emulator**: Not yet integrated (next step)
**Unix V5 Boot**: Pending emulator integration

## Architecture

```
unixbox/
  src/
    emulator/     # PDP-11 WASM emulator
    terminal/     # xterm.js terminal UI
    overlays/     # Educational source code overlays
  public/
    disks/        # Unix V5 disk images
    docs/         # Lions commentary, etc.
```

## Prior Art

- [pdp11.js](https://skn.noip.me/pdp11/pdp11.html) - Paul Nankervis's emulator
- [v6.cuzuco.com](https://v6.cuzuco.com/) - Unix V6 online

## Roadmap

1. [ ] Wrap pdp11.js with modern terminal UI
2. [ ] Boot Unix V5 from extracted disk image
3. [ ] Add source code overlay feature
4. [ ] Educational annotations
5. [ ] Multi-TTY support (multiple tabs = multiple users)
