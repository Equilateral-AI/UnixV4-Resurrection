import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { pdp11 } from './emulator/pdp11-bridge';
import { TimeMachine, EraSelector, initializeEraSelectorStyles } from './features/time-machine';
import { MultiTerminalManager } from './features/multi-terminal/MultiTerminalManager';
import { TerminalSpawner } from './features/multi-terminal/TerminalSpawner';
import { annotationEngine, annotationPanel } from './features/annotations';
import { sourceOverlay } from './features/source-overlay';
import { createLogger } from './utils/logger';
import { TIMEOUTS } from './config';

const log = createLogger('UnixBox');

// Initialize terminal
const terminal = new Terminal({
  cursorBlink: true,
  fontSize: 14,
  fontFamily: '"Courier New", Courier, monospace',
  theme: {
    background: '#001100',
    foreground: '#00ff00',
    cursor: '#00ff00',
    cursorAccent: '#001100',
    selectionBackground: 'rgba(0, 255, 0, 0.3)',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    yellow: '#ffff00',
    blue: '#0000ff',
    magenta: '#ff00ff',
    cyan: '#00ffff',
    white: '#ffffff',
    brightBlack: '#666666',
    brightRed: '#ff6666',
    brightGreen: '#66ff66',
    brightYellow: '#ffff66',
    brightBlue: '#6666ff',
    brightMagenta: '#ff66ff',
    brightCyan: '#66ffff',
    brightWhite: '#ffffff',
  },
  cols: 80,
  rows: 24,
  allowProposedApi: true,
});

// Add fit addon to handle terminal resizing
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

// Add web links addon
const webLinksAddon = new WebLinksAddon();
terminal.loadAddon(webLinksAddon);

// Initialize Time Machine
const timeMachine = new TimeMachine(pdp11);
timeMachine.setTerminal(terminal);

// Initialize era selector styles
initializeEraSelectorStyles();

// Initialize Multi-Terminal System
const multiTerminalManager = new MultiTerminalManager();
const terminalSpawner = new TerminalSpawner(multiTerminalManager);

// Mount terminal to DOM
const terminalElement = document.getElementById('terminal');
if (terminalElement) {
  terminal.open(terminalElement);
  fitAddon.fit();
}

// Initialize Era Selector (after DOM is ready)
document.addEventListener('DOMContentLoaded', () => {
  try {
    const eraSelector = new EraSelector({
      containerId: 'era-selector-container',
      timeMachine: timeMachine,
      onEraSwitch: (eraId) => {
        log.info(`Era switch initiated: ${eraId}`);
      }
    });
    log.info('Era selector initialized');
    // Export for debugging
    window.eraSelector = eraSelector;
  } catch (error) {
    log.error('Failed to initialize era selector:', error);
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  fitAddon.fit();
});

// Get era from URL parameter (for Time Machine switching)
function getEraFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('era') || 'v5'; // Default to V5
}

// Initialize and boot the PDP-11 emulator
async function bootEmulator() {
  try {
    // Determine which era to boot
    const eraId = getEraFromUrl();
    const eraConfig = timeMachine.getEra(eraId);

    if (!eraConfig) {
      log.error(`Unknown era: ${eraId}, falling back to v5`);
    }

    const diskImage = eraConfig?.diskImage || '/disk-images/unix-v5.dsk';
    const eraName = eraConfig?.name || 'Unix V5 (November 1974)';

    // Update TimeMachine's internal state to match URL
    if (eraConfig && eraId !== 'v5') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessing private field for URL-based era sync
      (timeMachine as any).currentEraId = eraId;
    }

    terminal.writeln('\x1b[33m[EMULATOR] Initializing PDP-11/40 processor...\x1b[0m');

    // Initialize emulator (loads scripts)
    await pdp11.initialize();
    terminal.writeln('\x1b[32m[EMULATOR] Core loaded successfully\x1b[0m');

    // Configure disk for selected era (must be done after initialize, before boot)
    if (eraConfig && eraId !== 'v5') {
      pdp11.configureDisk({
        drive: 0,
        url: diskImage,
        mounted: true
      });
      terminal.writeln(`\x1b[36m[TIME MACHINE] Era selected: ${eraName}\x1b[0m`);
    }

    // Connect terminal I/O
    terminal.writeln('\x1b[33m[EMULATOR] Connecting terminal...\x1b[0m');
    pdp11.connectTerminal(terminal);
    terminal.writeln('\x1b[32m[EMULATOR] Terminal connected\x1b[0m');

    // Enable multi-terminal support
    terminal.writeln('\x1b[33m[MULTI-TTY] Enabling multi-terminal support...\x1b[0m');
    multiTerminalManager.interceptVt52Output();
    terminalSpawner.injectUI();
    terminal.writeln('\x1b[32m[MULTI-TTY] Multi-terminal system ready (TTY0-TTY7)\x1b[0m');

    // Initialize Educational Annotations
    terminal.writeln('\x1b[33m[EDUCATIONAL] Initializing syscall annotations...\x1b[0m');
    annotationEngine.onSyscallDetected((syscallNum, annotation) => {
      log.debug(`System call detected: ${syscallNum} (${annotation.name})`);
      annotationPanel.displayAnnotation(annotation);
      // Also show source code if available
      sourceOverlay.emitSyscallEvent(annotation.name);
    });
    terminal.writeln('\x1b[32m[EDUCATIONAL] Annotations ready - system calls will be explained\x1b[0m');

    // Initialize Source Overlay
    terminal.writeln('\x1b[33m[EDUCATIONAL] Loading Unix V4 source code index...\x1b[0m');
    terminal.writeln(`\x1b[32m[EDUCATIONAL] Source code overlay ready - ${sourceOverlay.getAvailableSyscalls().length} syscalls indexed\x1b[0m`);

    // Boot the system
    terminal.writeln('\x1b[33m[EMULATOR] Loading boot ROM...\x1b[0m');
    terminal.writeln(`\x1b[33m[EMULATOR] Mounting RK05 disk 0: ${diskImage}\x1b[0m`);
    terminal.writeln('');
    terminal.writeln(`\x1b[1;32m=== Starting PDP-11/40 (${eraName}) ===\x1b[0m`);
    terminal.writeln('');

    // Boot the emulator
    pdp11.boot();

    // Hide loading overlay
    if (window.unixBoxControls?.hideLoading) {
      window.unixBoxControls.hideLoading();
    }

    // Log status
    const status = pdp11.getStatus();
    log.info('PDP-11 Status:', status);

    // Start monitoring for syscalls after a short delay (let boot complete)
    setTimeout(() => {
      annotationEngine.startMonitoring();
      log.info('Syscall monitoring started');

      // Show a demo annotation to demonstrate the feature
      annotationEngine.showAnnotation(1); // fork() - a classic syscall
    }, TIMEOUTS.SYSCALL_MONITOR_DELAY);

    // Add annotation toggle button to status bar
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
      const annotationBtn = document.createElement('button');
      annotationBtn.id = 'annotation-toggle-btn';
      annotationBtn.innerHTML = '📚 Annotations';
      annotationBtn.title = 'Toggle syscall annotations panel (Ctrl+A)';
      annotationBtn.style.cssText = `
        background: #001a00;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 0.3rem 0.6rem;
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        cursor: pointer;
        border-radius: 4px;
        margin-left: 1rem;
      `;
      annotationBtn.onclick = () => {
        annotationPanel.toggle();
      };
      statusBar.appendChild(annotationBtn);
    }

    // Show success
    terminal.writeln('\x1b[1;32m[READY] System booted successfully\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[90mKeyboard shortcuts:\x1b[0m');
    terminal.writeln('\x1b[90m  Ctrl+R - Reset/Reboot\x1b[0m');
    terminal.writeln('\x1b[90m  Ctrl+B - Boot Menu\x1b[0m');
    terminal.writeln('\x1b[90m  Ctrl+S - CPU Status\x1b[0m');
    terminal.writeln('\x1b[90m  Ctrl+A - Toggle Annotations Panel\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[90mMulti-terminal:\x1b[0m');
    terminal.writeln('\x1b[90m  Click "+ New TTY" in status bar to open additional terminals\x1b[0m');
    terminal.writeln('\x1b[90m  Each terminal is independent - perfect for multi-user Unix!\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[90mEducational Mode:\x1b[0m');
    terminal.writeln('\x1b[90m  System calls are automatically detected and annotated\x1b[0m');
    terminal.writeln('\x1b[90m  Click "Annotations" button or press Ctrl+A to toggle panel\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[1;33m═══════════════════════════════════════════════════════════════\x1b[0m');
    terminal.writeln('\x1b[1;33m  HOW TO BOOT UNIX V5 (1974)\x1b[0m');
    terminal.writeln('\x1b[1;33m═══════════════════════════════════════════════════════════════\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[1;36m  Step 1: PDP-11 Boot Loader\x1b[0m');
    terminal.writeln('\x1b[32m          Boot>  \x1b[1;37mboot rk0\x1b[0m\x1b[90m     (load from RK05 disk)\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[1;36m  Step 2: Unix Boot Loader\x1b[0m');
    terminal.writeln('\x1b[32m          @  \x1b[1;37munix\x1b[0m\x1b[90m              (load the kernel)\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[1;36m  Step 3: Login\x1b[0m');
    terminal.writeln('\x1b[32m          login:  \x1b[1;37mroot\x1b[0m\x1b[90m          (no password needed)\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[90m  Users: root, ken, dmr  |  Commands: ls, cat, who, ps, ed\x1b[0m');
    terminal.writeln('\x1b[90m  Games: /usr/games/chess, wump, bj, ttt, moo\x1b[0m');
    terminal.writeln('');
    terminal.writeln('\x1b[1;33m═══════════════════════════════════════════════════════════════\x1b[0m');
    terminal.writeln('');

  } catch (error) {
    terminal.writeln('\x1b[31m[ERROR] Failed to initialize emulator:\x1b[0m');
    terminal.writeln(`\x1b[31m${error}\x1b[0m`);
    log.error('Emulator initialization failed:', error);
  }
}

// Keyboard shortcuts handler
terminal.attachCustomKeyEventHandler((event: KeyboardEvent) => {
  // Ctrl+R - Reset/Reboot
  if (event.ctrlKey && event.key === 'r') {
    event.preventDefault();
    terminal.writeln('');
    terminal.writeln('\x1b[1;33m╔════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[1;33m║     SYSTEM RESET - Ctrl+R Detected         ║\x1b[0m');
    terminal.writeln('\x1b[1;33m╚════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');

    pdp11.reset();
    terminal.clear();

    // Reboot with progress
    setTimeout(() => bootWithProgress(), TIMEOUTS.REBOOT_DELAY);
    return false;
  }

  // Ctrl+B - Show boot menu
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault();
    terminal.writeln('');
    terminal.writeln('\x1b[1;36m╔════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[1;36m║           PDP-11/40 Boot Menu              ║\x1b[0m');
    terminal.writeln('\x1b[1;36m╠════════════════════════════════════════════╣\x1b[0m');
    terminal.writeln('\x1b[1;36m║                                            ║\x1b[0m');
    terminal.writeln('\x1b[1;36m║  Ctrl+R - Reset and Reboot System          ║\x1b[0m');
    terminal.writeln('\x1b[1;36m║  Ctrl+B - Show this Boot Menu              ║\x1b[0m');
    terminal.writeln('\x1b[1;36m║  Ctrl+S - Show CPU Status                  ║\x1b[0m');
    terminal.writeln('\x1b[1;36m║  Ctrl+C - Send SIGINT (interrupt)          ║\x1b[0m');
    terminal.writeln('\x1b[1;36m║                                            ║\x1b[0m');

    // Show current status
    try {
      const status = pdp11.getStatus();
      const stateNames = ['RUN', 'RESET', 'WAIT', 'HALT', 'STEP'];
      const stateName = stateNames[status.runState] || 'UNKNOWN';

      terminal.writeln('\x1b[1;36m║  Current State: ' + stateName.padEnd(24) + '║\x1b[0m');
      terminal.writeln('\x1b[1;36m║  PC: ' + status.programCounter.toString(8).padStart(6, '0') + ' (octal)' + '                 ║\x1b[0m');
    } catch (e) {
      terminal.writeln('\x1b[1;36m║  Status: Emulator not initialized         ║\x1b[0m');
    }

    terminal.writeln('\x1b[1;36m║                                            ║\x1b[0m');
    terminal.writeln('\x1b[1;36m╚════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    return false;
  }

  // Ctrl+S - Show CPU status
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    terminal.writeln('');
    terminal.writeln('\x1b[1;33m╔════════════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[1;33m║         PDP-11/40 CPU Status               ║\x1b[0m');
    terminal.writeln('\x1b[1;33m╠════════════════════════════════════════════╣\x1b[0m');

    try {
      const status = pdp11.getStatus();
      const stateNames = ['RUN', 'RESET', 'WAIT', 'HALT', 'STEP'];
      const stateName = stateNames[status.runState] || 'UNKNOWN';

      terminal.writeln(`\x1b[33m║  State:  ${stateName.padEnd(32)}║\x1b[0m`);
      terminal.writeln(`\x1b[33m║  PC:     ${status.programCounter.toString(8).padStart(6, '0')} (octal)${' '.repeat(20)}║\x1b[0m`);
      terminal.writeln(`\x1b[33m║  SP:     ${status.stackPointer.toString(8).padStart(6, '0')} (octal)${' '.repeat(20)}║\x1b[0m`);
      terminal.writeln(`\x1b[33m║  PSW:    ${status.psw.toString(8).padStart(6, '0')} (octal)${' '.repeat(20)}║\x1b[0m`);
      terminal.writeln('\x1b[33m║                                            ║\x1b[0m');
      terminal.writeln('\x1b[33m║  Flags:                                    ║\x1b[0m');
      terminal.writeln(`\x1b[33m║    N (Negative):  ${status.flags.negative ? '1' : '0'}${' '.repeat(22)}║\x1b[0m`);
      terminal.writeln(`\x1b[33m║    Z (Zero):      ${status.flags.zero ? '1' : '0'}${' '.repeat(22)}║\x1b[0m`);
      terminal.writeln(`\x1b[33m║    V (Overflow):  ${status.flags.overflow ? '1' : '0'}${' '.repeat(22)}║\x1b[0m`);
      terminal.writeln(`\x1b[33m║    C (Carry):     ${status.flags.carry ? '1' : '0'}${' '.repeat(22)}║\x1b[0m`);
      terminal.writeln('\x1b[33m║                                            ║\x1b[0m');
      terminal.writeln('\x1b[33m║  Registers (octal):                        ║\x1b[0m');
      for (let i = 0; i < 6; i++) {
        const regVal = status.registers[i].toString(8).padStart(6, '0');
        terminal.writeln(`\x1b[33m║    R${i}: ${regVal}${' '.repeat(29)}║\x1b[0m`);
      }
    } catch (e) {
      terminal.writeln('\x1b[33m║  Error: Emulator not initialized           ║\x1b[0m');
    }

    terminal.writeln('\x1b[1;33m╚════════════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');
    return false;
  }

  // Ctrl+A - Toggle annotation panel
  if (event.ctrlKey && event.key === 'a') {
    event.preventDefault();
    annotationPanel.toggle();
    log.debug(`Annotation panel ${annotationPanel.visible() ? 'shown' : 'hidden'}`);
    return false;
  }

  return true;
});

// Boot with animated progress display
async function bootWithProgress() {
  // Use TimeMachine for boot animation
  await timeMachine.bootCurrentEra(terminal);

  // Actually boot the emulator
  await bootEmulator();
}

// Start the boot sequence with visual effects
bootWithProgress();

// Export instances for debugging (accessible from browser console)
window.terminal = terminal;
window.pdp11 = pdp11;
window.multiTerminalManager = multiTerminalManager;
window.terminalSpawner = terminalSpawner;
window.annotationEngine = annotationEngine;
window.annotationPanel = annotationPanel;
window.sourceOverlay = sourceOverlay;

log.info('Initialized - starting PDP-11 emulator');
log.info('');
log.info('Keyboard shortcuts:');
log.info('  Ctrl+R - Reset and reboot');
log.info('  Ctrl+B - Boot menu');
log.info('  Ctrl+S - CPU status');
log.info('  Ctrl+A - Toggle annotations panel');
log.info('');
log.info('Educational Features:');
log.info('  Syscall annotations available for:', annotationEngine.getAvailableSyscalls().join(', '));
log.info('  Use annotationEngine.showAnnotation(N) to manually trigger');
