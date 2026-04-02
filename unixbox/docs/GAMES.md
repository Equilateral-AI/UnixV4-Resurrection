# Unix Games — Historical Source Code

## Overview

This directory contains the original game source code from Research Unix editions V6 and V7, preserved from the [TUHS Archive](https://www.tuhs.org/) under the [Caldera License](https://www.tuhs.org/Archive/Caldera-license.pdf) (BSD-like, free for non-commercial use).

## Games by Era

### Unix V4/V5 (1973-1974) — Binaries Only

The V4/V5 disk images contain compiled PDP-11 game executables at `/usr/games/`. No source code was preserved on these tapes — this is historically accurate, as Bell Labs shipped whatever was on the distribution tape.

| Game | Description |
|------|-------------|
| `chess` | Chess engine (16 KB) |
| `wump` | Hunt the Wumpus — one of the earliest computer games |
| `ttt` | Tic-Tac-Toe (with `ttt.k` knowledge base) |
| `bj` | Blackjack |
| `moo` | Mastermind-like number guessing |
| `cubic` | 3D cube puzzle |

To play: boot Unix V5, login as `root`, run `/usr/games/wump`.

### Unix V7 (January 1979) — Full Source

V7 was the "last true Research Unix" and the basis for all modern Unix, BSD, and Linux systems. Game source is preserved at `public/src/games/v7/`.

| File | Game | Description |
|------|------|-------------|
| `arithmetic.c` | Arithmetic | Math drill — random arithmetic problems |
| `backgammon.c` | Backgammon | Full backgammon implementation |
| `fish.c` | Go Fish | Card game — "Do you have any sevens?" |
| `fortune.c` | Fortune | Random fortune cookie quotes |
| `hangman.c` | Hangman | Classic word guessing game |
| `quiz.c` | Quiz | Trivia from knowledge files |
| `wump.c` | Wumpus | Hunt the Wumpus — the classic! |
| `chess/` | Chess | Chess engine (multi-file) |

To play: boot Unix V7 via the Time Machine era selector, login as `root`, run games from `/usr/games/`.

## Version Notes

The V4/V5 binaries and V7 sources represent **different eras** of the same lineage. Some games like `wump` span both — comparing the V5 binary behavior with the V7 source is an educational exercise in itself.

The V7 source code is remarkably readable. These games were written by Bell Labs researchers (Ken Thompson, Dennis Ritchie, and colleagues) in a pre-ANSI C dialect. Notable patterns:

- K&R function declarations (no prototypes)
- Heavy use of `getchar()`/`putchar()` for I/O
- `srand(getpid())` for randomization
- Direct terminal control without curses

## Licensing

All source code from the TUHS Archive is available under the [Caldera License](https://www.tuhs.org/Archive/Caldera-license.pdf), released January 2002. This permits free redistribution for non-commercial purposes.

## References

- [TUHS Archive](https://www.tuhs.org/) — The Unix Heritage Society
- [Lions' Commentary on Unix V6](https://en.wikipedia.org/wiki/Lions%27_Commentary_on_UNIX_6th_Edition) — John Lions (1977)
- [A Research Unix Reader](https://www.tuhs.org/Archive/Documentation/) — Dennis Ritchie
