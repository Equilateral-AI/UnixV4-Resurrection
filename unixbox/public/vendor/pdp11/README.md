# PDP-11 JavaScript Emulator

These files are from Paul Nankervis's PDP-11 JavaScript emulator.

## Attribution

**Author**: Paul Nankervis
**Email**: paulnank@hotmail.com
**Source Repository**: https://github.com/paulnank/pdp11-js
**Live Demo**: https://paulnank.github.io/pdp11-js/pdp11.html

## License

From the source code header:

> This code may be used freely provided the original author name is acknowledged in any modified source code

## Files Included

- **pdp11.js** (115 KB) - Core PDP-11/70 CPU emulation
  - Implements full PDP-11 instruction set
  - Memory management unit (MMU) with 22-bit addressing
  - Processor Status Word (PSW) and condition codes
  - Kernel, Supervisor, and User modes

- **iopage.js** (85 KB) - I/O page and peripheral device emulation
  - RK05 disk controller (RK11)
  - RL01/RL02 disk controller
  - RP02/RP03 disk controller
  - Console terminal (VT52)
  - Line printer
  - Paper tape reader/punch
  - Memory management registers

- **vt52.js** (14 KB) - VT52 terminal emulation
  - DEC VT52 escape sequences
  - 24 lines × 80 columns
  - Cursor positioning and control
  - Character input/output

- **bootcode.js** (16 KB) - Bootstrap ROM code
  - Custom boot loader with diagnostics
  - Support for multiple disk types
  - Front panel simulation

- **fpp.js** (57 KB) - Floating Point Processor (FP11)
  - IEEE floating point operations
  - FP11 instruction set
  - Floating point registers

## Integration

These files are loaded by `src/emulator/pdp11-bridge.ts` which provides:
- Dynamic script loading in dependency order
- Bridge between the emulator and xterm.js terminal UI
- Disk image configuration and URL mapping
- Terminal I/O redirection

## Version Information

Files obtained from commit: `12c468f9d8c80cb0bce7a579b805bf3c5bac7ace`
Date: February 9, 2026

## More Information

For detailed documentation about the PDP-11 emulator:
- GitHub repository: https://github.com/paulnank/pdp11-js
- Example boots: https://github.com/paulnank/pdp11-js/blob/master/ExampleBoots.md
- PDP-11 architecture: https://en.wikipedia.org/wiki/PDP-11

## Acknowledgments

Special thanks to Paul Nankervis for creating and maintaining this excellent JavaScript PDP-11 emulator, making it possible to run authentic 1970s Unix systems in modern web browsers.
