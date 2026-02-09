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
**PDP-11 Emulator**: Integrated - Paul Nankervis's pdp11.js with TypeScript bridge
**Unix V5/V6 Boot**: Working - Boot from disk images with full Unix environment

## Architecture

```
unixbox/
  src/
    emulator/           # PDP-11 emulator bridge (TypeScript)
    features/           # Educational overlays, annotations, time-machine
  public/
    vendor/pdp11/       # Paul Nankervis's PDP-11 JavaScript emulator
    disk-images/        # Unix V4/V5/V6 disk images
```

## Prior Art

- [pdp11.js](https://skn.noip.me/pdp11/pdp11.html) - Paul Nankervis's emulator
- [v6.cuzuco.com](https://v6.cuzuco.com/) - Unix V6 online

## Roadmap

1. [x] Wrap pdp11.js with modern terminal UI
2. [x] Boot Unix V5/V6 from disk images
3. [x] Add source code overlay feature
4. [x] Educational annotations
5. [x] Multi-TTY support (multiple tabs = multiple users)
6. [ ] Polish UI/UX and add more interactive features
7. [ ] Comprehensive documentation and tutorials
