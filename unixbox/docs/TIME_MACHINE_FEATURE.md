# Time Machine Mode Feature

## Overview

The Time Machine Mode allows users to switch between different Unix versions (V4, V5, V6) in UnixBox, providing an interactive way to explore the evolution of Unix from 1973 to 1975.

## Implementation Summary

### Files Created

1. **`src/features/time-machine/era-configs.json`**
   - Configuration for all available Unix eras
   - Includes V4 (1973), V5 (1974), V6 (1975)
   - Contains boot commands, memory specs, features, and visual banners

2. **`src/features/time-machine/TimeMachine.ts`**
   - Core era switching logic
   - Manages emulator reconfiguration and rebooting
   - Provides event-based callbacks for era changes
   - Beautiful time-travel animation during era switching

3. **`src/features/time-machine/EraSelector.ts`**
   - UI component for era selection tabs
   - Green-on-black retro terminal theme
   - Animated visual feedback during switching
   - Disabled state for compressed V6 image (requires decompression)

4. **`src/features/time-machine/index.ts`**
   - Export module for clean imports

### Files Modified

1. **`index.html`**
   - Added `<div id="era-selector-container"></div>` in header
   - This is where the era selector tabs are rendered

2. **`src/main.ts`**
   - Imported Time Machine components
   - Initialized TimeMachine and EraSelector
   - Replaced hardcoded boot sequence with TimeMachine.bootCurrentEra()
   - Removed unused boot progress functions

### Disk Images

1. **Unix V4** - `/Users/jamesford/Source/UnixV4-Resurrection/unixbox/public/disk-images/unix-v4.dsk`
   - Copied from v4_tape.tap (2.5 MB)
   - First Unix rewritten in C
   - Recently recovered from Bell Labs (December 2024)

2. **Unix V5** - `/Users/jamesford/Source/UnixV4-Resurrection/unixbox/public/disk-images/unix-v5.dsk`
   - Already available (2.4 MB)
   - Complete source code preserved
   - Current default era

3. **Unix V6** - `/Users/jamesford/Source/UnixV4-Resurrection/unixbox/public/vendor/pdp11/media/rk0.dsk.zst`
   - Compressed format (.zst)
   - Lions' Commentary era
   - Most documented early Unix
   - **Currently disabled** in UI (requires decompression via fzstd library)

## Features

### Era Selector UI

- **Location**: Header of UnixBox interface
- **Visual Design**:
  - Clock icon (⏰) with pulse animation
  - Three era tabs: V4 (1973), V5 (1974), V6 (1975)
  - Active tab highlighted with green glow
  - Disabled state for V6 (compressed)
  - Hover effects and smooth transitions

### Era Switching Animation

When switching eras, users see:
1. Time travel countdown from 2024 → target year
2. Era banner display
3. Hardware reconfiguration messages
4. Boot sequence with era-specific details
5. Feature list for that era

### Era-Specific Information

Each era includes:
- **Year**: Historical timestamp
- **Disk Image**: Path to boot disk
- **Boot Command**: How to boot (e.g., "boot rk0")
- **Notes**: Historical context
- **Features**: Key innovations in that version
- **Memory**: RAM configuration for that era
- **Banner**: ASCII art banner displayed on boot

## Usage

### For Users

1. Open UnixBox: http://localhost:3004/
2. Look for the Time Machine selector in the header
3. Click on an era tab (V4 or V5)
4. Watch the time travel animation
5. System reboots with the selected Unix version

### For Developers

```typescript
import { TimeMachine, EraSelector } from './features/time-machine';

// Initialize Time Machine
const timeMachine = new TimeMachine(pdp11);
timeMachine.setTerminal(terminal);

// Create Era Selector UI
const eraSelector = new EraSelector({
  containerId: 'era-selector-container',
  timeMachine: timeMachine,
  onEraSwitch: (eraId) => {
    console.log(`Switched to: ${eraId}`);
  }
});

// Programmatically switch eras
await timeMachine.switchEra('v4');

// Get current era
const currentEra = timeMachine.getCurrentEra();
console.log(currentEra.name); // "Unix V4 (November 1973)"
```

## Technical Details

### Era Switching Process

1. **Validation**: Check if target era exists
2. **Animation**: Display time-travel countdown
3. **Reset**: Reset PDP-11 emulator
4. **Reconfigure**: Update disk image for new era
5. **Boot**: Start emulator with new configuration
6. **Display**: Show era-specific welcome message and features

### Event System

TimeMachine emits events via callbacks:

```typescript
// Listen for era changes
timeMachine.onEraChange((eraId, eraConfig) => {
  console.log(`Changed to ${eraConfig.name}`);
});

// Listen for boot progress
timeMachine.onBootProgress((stage, progress) => {
  console.log(`${stage}: ${progress}%`);
});
```

### Styling

All styles are injected dynamically via `initializeEraSelectorStyles()`:

- Green-on-black retro terminal theme
- CRT-style animations (pulse, blink, glow)
- Responsive design
- Smooth transitions and hover effects

## Future Enhancements

### V6 Decompression

Unix V6 is currently disabled because it's in compressed format (.zst). To enable it:

1. Decompress rk0.dsk.zst using fzstd library (already loaded in index.html)
2. Save to `/disk-images/unix-v6.dsk`
3. Update era-configs.json to remove `"compressed": true`
4. V6 tab will automatically become enabled

### Additional Eras

To add more eras (V7, BSD, etc.):

1. Add disk image to `/public/disk-images/`
2. Add era configuration to `era-configs.json`
3. Era selector will automatically render new tab

### Persistence

Could add localStorage to remember user's preferred era:

```typescript
// Save preference
localStorage.setItem('unixbox-era', eraId);

// Load on startup
const savedEra = localStorage.getItem('unixbox-era') || 'v5';
await timeMachine.switchEra(savedEra);
```

## Testing

### Dev Server

```bash
cd /Users/jamesford/Source/UnixV4-Resurrection/unixbox
npm run dev
# Open http://localhost:3004/
```

### Production Build

```bash
npm run build
# Note: There's a pre-existing TypeScript error in SourcePanel.ts
# This is unrelated to Time Machine feature
```

### Manual Testing Checklist

- [ ] Era selector visible in header
- [ ] V4 and V5 tabs clickable
- [ ] V6 tab disabled with tooltip
- [ ] Clicking V4 shows time travel animation
- [ ] System reboots with V4 disk image
- [ ] Clicking V5 switches back
- [ ] Active era highlighted correctly
- [ ] Console logs show correct era switching
- [ ] No JavaScript errors in console

## Known Issues

1. **V6 Disabled**: Requires decompression of .zst file
2. **SourcePanel.ts Error**: Pre-existing TypeScript error unrelated to Time Machine
3. **Linter Interference**: File modifications sometimes trigger automatic reformatting

## Resources

- **V4 Source**: /Users/jamesford/Source/UnixV4-Resurrection/v4_tape.tap
- **V5 Source**: Already in disk-images/
- **V6 Source**: vendor/pdp11/media/rk0.dsk.zst (compressed)
- **Era Configs**: src/features/time-machine/era-configs.json
- **Documentation**: Lions' Commentary on Unix V6 (historical reference)

## Credits

- **PDP-11 Emulator**: Paul Nankervis
- **Unix Versions**: Bell Labs / AT&T
- **V4 Recovery**: Bell Labs tape archive (December 2024)
- **Implementation**: Built for UnixBox educational platform
