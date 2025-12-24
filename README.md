# Unix V4/V5 Resurrection Project

**Status**: Analysis Complete - HIGHLY VIABLE for Modernization

## What This Is

This repository contains Unix V5 source code from November 1974, extracted from the TUHS
(The Unix Heritage Society) archive, along with the recently recovered Unix V4 tape image
from Bell Labs (December 2024 discovery).

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
- [Unix V4 Tape Recovery](https://archive.org/) - December 2024 announcement
- [Lions' Commentary](https://en.wikipedia.org/wiki/Lions%27_Commentary_on_UNIX_6th_Edition) - Classic study of Unix V6
- [The Evolution of Unix](https://www.bell-labs.com/usr/dmr/www/hist.html) - Dennis Ritchie's history

## License

This source code is historic and is distributed under the [Caldera License](https://www.tuhs.org/Archive/Caldera-license.pdf)
which permits open source distribution of ancient Unix code
