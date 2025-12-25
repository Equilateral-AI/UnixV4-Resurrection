# Unix V4/V5 Resurrection Project

**A Christmas Gift from Agentic Santa - December 2025**

Run Unix from 1974 in your browser. Experience computing history.

**Status**: Complete - Web-based PDP-11 emulator with educational features

## What This Is

This repository contains Unix V5 source code from November 1974, extracted from the TUHS
(The Unix Heritage Society) archive, along with the recently recovered Unix V4 tape image
from Bell Labs (December 2025 discovery).

## Source Code Statistics

| Type | Files | Lines of Code |
|------|-------|---------------|
| C Source | 122+ | 27,429 |
| PDP-11 Assembly | 207+ | 33,538 |
| Header Files | 13 | 418 |
| **Total** | **342+** | **61,385** |

## Code Attribution

The kernel code is split between two legendary programmers:
- **`usr/sys/ken/`** - Ken Thompson's kernel code (main.c, slp.c, sys1-3.c, etc.)
- **`usr/sys/dmr/`** - Dennis Ritchie's device drivers (tty.c, bio.c, etc.)

## What's Included

### Kernel Components
- `main.c` - System initialization, process 0 creation
- `slp.c` - Sleep/wakeup, scheduler, context switch, fork
- `fio.c` - File I/O, permissions (suser, access)
- `pipe.c` - Inter-process communication
- `sig.c` - Signal handling (SIGHUP, SIGINT, etc.)
- `trap.c` - System call and interrupt handling

### User Programs
- `sh.c` - The Thompson shell (ancestor of bash/zsh)
- `ls.c`, `cp.c`, `cat.s` - Classic utilities
- `login.c`, `init.c` - System startup
- `ps.c`, `who.c` - Process/user monitoring

### C Compiler
- `usr/c/c0*.c` - Lexer and parser
- `usr/c/c1*.c` - Code generation
- `usr/c/c2*.c` - Optimization passes

## Pre-ANSI C Syntax Notes

This code uses K&R (Kernighan & Ritchie) C syntax that predates ANSI C:

```c
// Modern C                    // 1974 Unix C
x |= y;                        x =| y;
x -= y;                        x =- y;
x >>= 3;                       x =>> 3;

// Function declarations
int foo(int x, int y) { }      foo(x, y) int x; int y; { }
```

## Viability Assessment

### Why This Is Excellent for Modernization

1. **Complete System**: Full kernel, shell, utilities, and C compiler
2. **Small Codebase**: ~27K lines of C vs millions in modern systems
3. **Clean Design**: Elegant abstractions that influenced all later Unix systems
4. **Educational Value**: See how OS concepts originated
5. **Historic Significance**: Direct ancestor of Linux, macOS, BSD, etc.

### Modernization Approach Options

**Option A: Faithful Port**
- Translate PDP-11 assembly to x86-64 or ARM64
- Convert K&R C to ANSI C
- Preserve original semantics and structure
- Run in QEMU or real hardware

**Option B: Modern Reimplementation**
- Use as architectural reference
- Implement in modern C/Rust
- Add modern features (networking, 64-bit, SMP)
- Educational "how does Unix work" project

**Option C: Browser-Based Emulator**
- JavaScript/WebAssembly PDP-11 emulator
- Interactive Unix V5 in the browser
- Educational/historical preservation

### Key Patterns Still Used Today

| 1974 Unix | Modern Linux |
|-----------|--------------|
| `sleep(chan, pri)` | `wait_event()` |
| `wakeup(chan)` | `wake_up()` |
| `swtch()` | `schedule()` |
| `newproc()` | `fork()` |
| `exec()` | `execve()` |
| `suser()` | `capable(CAP_SYS_ADMIN)` |

## Files of Special Interest

- `usr/sys/ken/slp.c:192` - The famous scheduler (contains code Dennis Ritchie called "not expected to understand")
- `usr/source/s2/sh.c` - Thompson shell, 859 lines, supports pipes, redirects, background jobs
- `usr/sys/param.h` - System parameters (50 processes max, 15 files per process)
- `usr/sys/proc.h` - Process structure, process states

## Getting Started

```bash
# The source is already extracted in this directory
ls -la usr/sys/ken/    # Kernel source
ls -la usr/source/     # User programs
ls -la usr/c/          # C compiler

# Read the kernel entry point
cat usr/sys/ken/main.c

# Read the shell
cat usr/source/s2/sh.c
```

## Historical Context

- **November 1974**: This source code snapshot
- **July 1974**: First publication of Unix (CACM paper by Ritchie & Thompson)
- **1973**: Unix rewritten in C (V4)
- **1969-1971**: Original Unix in PDP-7 assembly

## References

- [TUHS Archive](https://www.tuhs.org/) - The Unix Heritage Society
- [Unix V4 Tape Recovery](https://archive.org/) - December 2025 announcement
- [Lions' Commentary](https://en.wikipedia.org/wiki/Lions%27_Commentary_on_UNIX_6th_Edition) - Classic study of Unix V6
- [The Evolution of Unix](https://www.bell-labs.com/usr/dmr/www/hist.html) - Dennis Ritchie's history

## UnixBox: Browser-Based Experience

The `unixbox/` directory contains a complete web-based Unix experience:

```bash
cd unixbox
npm install
npm run dev
# Open http://localhost:5173
```

### Features

| Feature | Description |
|---------|-------------|
| **PDP-11 Emulator** | Full CPU emulation in JavaScript |
| **Time Machine** | Switch between Unix V4, V5, V6 eras |
| **Multi-TTY** | Up to 8 terminals via BroadcastChannel |
| **Syscall Annotations** | Real-time explanations of system calls |
| **Source Overlay** | View original 1974 C source code |
| **VT52 Terminal** | Authentic terminal emulation |

### Quick Start

1. Boot the emulator (automatic)
2. Login as `root` (no password) or `dmr`
3. Try classic commands: `ls`, `cat`, `who`, `ps`
4. Click "+ New TTY" for multi-user experience
5. Watch syscall annotations as you work

### Educational Features In Depth

**Syscall Annotations**
When Unix executes system calls, the annotation panel explains what's happening:
- `fork()` - How Unix creates new processes (the basis of all modern process management)
- `exec()` - How programs are loaded and executed
- `pipe()` - Inter-process communication that powers shell pipelines (`ls | grep`)
- `read()`/`write()` - The elegant "everything is a file" I/O model

**Source Code Overlay**
See the actual 1974 C code as it runs:
- Ken Thompson's kernel code from `usr/sys/ken/`
- Dennis Ritchie's device drivers from `usr/sys/dmr/`
- The famous comment in `slp.c`: *"You are not expected to understand this"*

**Time Machine Mode**
Experience how Unix evolved:
- **Unix V4 (1973)**: First version in C - tape converted to disk, working!
- **Unix V5 (1974)**: Fully working - the primary experience
- **Unix V6 (1975)**: Placeholder - need authentic V6 disk image from TUHS

**Multi-User Experience**
Unix was revolutionary as a multi-user system. Click "+ New TTY" to:
- Open multiple terminal sessions (TTY0-TTY7)
- Login as different users (`root`, `dmr`, `ken`)
- See how 1970s timesharing worked
- Watch processes interact across terminals

**Why This Matters**
Every modern operating system traces its lineage here:
- Linux implements the same syscall interface
- macOS is a direct Unix descendant (via BSD)
- Windows adopted Unix concepts (pipes, processes)
- The cloud runs on these 50-year-old ideas

---

## Development Progress

### V4 Tape-to-Disk Conversion (December 24, 2025)

The recovered Unix V4 tape image was in SIMH tape format, not a bootable disk. We performed the following conversion:

1. **Analyzed tape format**: 4,280 records of 512 bytes each in SIMH format
2. **Identified archive type**: Unix `tp` (tape) archive containing filesystem
3. **Located filesystem**: Found valid Unix filesystem at tape block 76
   - Superblock: `isize=80, fsize=4000, nfree=54`
4. **Created RK05 disk image**: Combined V5 boot block with V4 filesystem
   - Result: `unix-v4-new.dsk` (2.4MB)

**Status**: Disk image created, boot testing in progress.

### Era Status

| Era | Status | Kernel Size | Notes |
|-----|--------|-------------|-------|
| **V4 (1973)** | Working | 27,624 bytes | Tape converted to disk - verified via Playwright |
| **V5 (1974)** | Working | 25,802 bytes | Primary experience, fully tested |
| **V6 (1975)** | Placeholder | - | Using V5 image - need authentic V6 disk image |

**Note**: The vendor's rk0.dsk was labeled as "Unix V5" in their documentation. A true V6 disk image from TUHS or other sources is needed for authentic V6 experience.

**Verification**: Era switching tested with Playwright automation - confirmed different filesystems load (V4 has Jun 1974 dates, V5 has Nov 1974 dates).

---

## Known Issues

1. **V6 Disk Image**: Currently using V5 disk image as placeholder. Need authentic V6 disk image from TUHS for true V6 experience.

2. **Source Overlay**: Currently shows V5 source for all eras. Era-specific source mapping planned.

3. **Multi-TTY Sync**: Occasional desync between terminals. Refresh to resync.

---

## Credits

### Original Unix Authors (1969-1974)
- **Ken Thompson** - Kernel, shell, many utilities
- **Dennis Ritchie** - C language, device drivers, documentation

### PDP-11 Emulator
- **Paul Nankervis** (paulnank@hotmail.com)
- JavaScript PDP-11 emulator used with attribution

### UnixBox Web Interface
- **Equilateral AI** (Pareidolia LLC)
- Built with Claude Code - December 2025

### Historical Preservation
- **The Unix Heritage Society** (TUHS) - Archive maintenance
- **Caldera International** - Open source licensing (2002)

---

## License

This project contains multiple components with different licenses.
See [LICENSE](LICENSE) for complete details.

- **Unix Source**: Caldera License (open source for ancient Unix)
- **PDP-11 Emulator**: Free use with attribution (Paul Nankervis)
- **UnixBox Interface**: MIT License (Equilateral AI)
