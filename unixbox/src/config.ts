/**
 * UnixBox Configuration
 *
 * Centralized config for disk images, timeouts, and terminal settings.
 * Keeps magic numbers out of the source files.
 */

/** Disk image paths for each Unix era */
export const DISK_IMAGES = {
  v4: '/disk-images/unix-v4-new.dsk',
  v5: '/disk-images/unix-v5.dsk',
  v6: '/disk-images/unix-v6.dsk',
} as const;

/** Default disk image (V5 is the primary experience) */
export const DEFAULT_DISK_IMAGE = DISK_IMAGES.v5;

/** Default Unix era */
export const DEFAULT_ERA = 'v5';

/** Timeouts (milliseconds) */
export const TIMEOUTS = {
  /** Delay before starting syscall monitoring after boot */
  SYSCALL_MONITOR_DELAY: 2000,
  /** Syscall polling interval */
  SYSCALL_POLL_INTERVAL: 100,
  /** Delay before rebooting after Ctrl+R */
  REBOOT_DELAY: 500,
  /** Era switch visual feedback delay */
  ERA_SWITCH_DELAY: 800,
  /** Error toast display duration */
  ERROR_TOAST_DURATION: 3000,
  /** Button flash feedback duration */
  BUTTON_FLASH_DURATION: 200,
  /** Count flash feedback duration */
  COUNT_FLASH_DURATION: 300,
  /** Panel fade-out duration */
  PANEL_FADE_DURATION: 300,
  /** Notification display duration */
  NOTIFICATION_DURATION: 2000,
} as const;

/** Terminal defaults */
export const TERMINAL = {
  COLS: 80,
  ROWS: 24,
  FONT_SIZE: 14,
  FONT_FAMILY: '"Courier New", Courier, monospace',
} as const;

/** PDP-11 emulator settings */
export const PDP11 = {
  /** CPU type: 70 = PDP-11/70 (22-bit), 45 = PDP-11/45 (18-bit) */
  CPU_TYPE: 70,
  /** Maximum VT52 terminal units */
  MAX_TERMINAL_UNITS: 8,
  /** Primary terminal unit */
  PRIMARY_UNIT: 0,
} as const;

/** Emulator vendor script paths (load order matters) */
export const EMULATOR_SCRIPTS = [
  '/vendor/pdp11/pdp11.js',
  '/vendor/pdp11/vt52.js',
  '/vendor/pdp11/iopage.js',
  '/vendor/pdp11/bootcode.js',
  '/vendor/pdp11/fpp.js',
] as const;
