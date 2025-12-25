# Time Machine Mode - Visual Reference

## UI Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ UnixBox - Unix V5 (November 1974)                                  │
│ PDP-11/40 Emulator - 16-bit Minicomputer Experience                │
│                                                                     │
│ ⏰ Time Machine:  [ 1973 V4 ]  [ 1974 V5 ● ]  [ 1975 V6 🔒 ]       │
│                                   ↑ Active                          │
└────────────────────────────────────────────────────────────────────┘
```

## Era Tabs

### Active Era (V5)
```
┌─────────────┐
│    1974     │  ← Year in green
│     V5      │  ← Version bold
│      ●      │  ← Active indicator (pulsing)
└─────────────┘
  Glowing border
  Brighter background
```

### Inactive Era (V4)
```
┌─────────────┐
│    1973     │  ← Dimmer green
│     V4      │  ← Normal weight
│             │  ← No indicator
└─────────────┘
  Subtle border
  Dark background
  Hover: brightens
```

### Disabled Era (V6)
```
┌─────────────┐
│    1975     │  ← Faded out (40% opacity)
│     V6      │  ← Grayed out
│             │  ← No indicator
└─────────────┘
  Faint border
  Cursor: not-allowed
  Tooltip: "V6 requires decompression (coming soon)"
```

## Color Palette

- **Background**: #001100 (very dark green)
- **Foreground**: #00ff00 (bright green)
- **Active Glow**: rgba(0, 255, 0, 0.6)
- **Border**: rgba(0, 255, 0, 0.3)
- **Hover**: #003300 (slightly brighter green)

## Animations

### 1. Time Travel Sequence

When clicking "V4":

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          TIME MACHINE ACTIVATED                            ║
╚════════════════════════════════════════════════════════════════════════════╝

Traveling to: Unix V4 (November 1973)

  >> Year: 2024 ....
  >> Year: 2000 ......
  >> Year: 1990 ..
  >> Year: 1985 .......
  >> Year: 1980 ...
  >> Year: 1975 .....
  >> Year: 1973 ..

✓ Arrived at 1973

╔════════════════════════════════════════════════════════════════════════════╗
║                          UNIX Fourth Edition                               ║
║                          November 1973                                     ║
║                                                                            ║
║                    First Unix written in C                                 ║
║              Recently recovered from Bell Labs tape!                       ║
╚════════════════════════════════════════════════════════════════════════════╝

[INFO] Reconfiguring hardware for this era...
[INFO] Memory: 64 KB
[INFO] Disk: /disk-images/unix-v4.dsk
```

### 2. Boot Sequence

```
[EMULATOR] Resetting PDP-11/40...
[EMULATOR] Loading boot ROM...
[EMULATOR] Mounting disk: /disk-images/unix-v4.dsk

=== Starting PDP-11/40 (Unix V4 (November 1973)) ===

[READY] System booted successfully

Features in this era:
  • C kernel
  • pipes
  • grep

First version rewritten in C. Recently recovered from Bell Labs (December 2025)!

Keyboard shortcuts:
  Ctrl+R - Reset/Reboot
  Ctrl+B - Boot Menu
  Ctrl+S - CPU Status
```

### 3. Pulsing Active Indicator

```
Time:  0ms   500ms  1000ms  1500ms
       ●      ◐      ○       ◐      (repeats)
     100%    70%    40%     70%    opacity
```

## Hover States

### Before Hover
```
┌─────────────┐
│    1973     │
│     V4      │
└─────────────┘
  border: 2px solid rgba(0, 255, 0, 0.3)
  background: rgba(0, 26, 0, 0.5)
```

### During Hover
```
┌─────────────┐
│    1973     │  ← Slightly brighter
│     V4      │
└─────────────┘
  border: 2px solid #00ff00
  background: rgba(0, 51, 0, 0.8)
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.4)
  transform: translateY(-2px)
```

## Loading State

When switching eras:

```
┌─────────────┐
│    1973     │  ← Pulsing opacity
│     V4      │
└─────────────┘
  animation: loading-pulse 1s infinite
  cursor: wait
  disabled: true
```

## Error State

If era switch fails:

```
┌───────────────────────────────────────────┐
│  Failed to switch era. Please try again.  │
└───────────────────────────────────────────┘
  Position: fixed center
  Background: rgba(255, 51, 0, 0.95)
  Border: 2px solid #ff0000
  Duration: 3 seconds (auto-dismiss)
  Animation: slide in from top
```

## Responsive Behavior

### Desktop (>1200px)
- Era tabs: 80px wide
- Full text visible
- Generous spacing

### Tablet (768px-1200px)
- Era tabs: 70px wide
- Compact spacing
- All features visible

### Mobile (<768px)
- Era tabs: 60px wide
- Minimal spacing
- Year above version
- May need horizontal scroll

## Console Output

### Successful Era Switch
```javascript
[UnixBox] Era switch initiated: v4
[TimeMachine] Switching era: v5 -> v4
[TimeMachine] Reconfiguring for era: v4
[PDP11Bridge] Configured disk drive 0: /disk-images/unix-v4.dsk
[PDP11Bridge] Resetting PDP-11...
[PDP11Bridge] Booting PDP-11...
[EraSelector] Successfully switched to era: v4
```

### Era Change Event
```javascript
timeMachine.onEraChange((eraId, eraConfig) => {
  console.log({
    id: "v4",
    name: "Unix V4 (November 1973)",
    year: 1973,
    features: ["C kernel", "pipes", "grep"],
    memory: "64 KB"
  });
});
```

## Accessibility

- **Keyboard Navigation**: Tab through era buttons
- **Enter/Space**: Activate era switch
- **Screen Readers**: Era tabs announce year and version
- **Tooltips**: Disabled V6 explains why it's unavailable
- **Focus Indicators**: Visible green outline on focused tab

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may need -webkit- prefixes for some animations)
- **Mobile**: Touch-friendly tap targets (minimum 44px)

## Performance

- **Era Switch**: ~2-3 seconds total
  - Animation: 1.5s
  - Emulator reset: 0.5s
  - Boot: 1s
- **UI Rendering**: <100ms
- **Memory**: ~5MB for Time Machine feature
- **Bundle Size**: +15KB (minified)

## CSS Classes Reference

```css
.era-selector              /* Container for entire selector */
.era-selector-label        /* "Time Machine:" label */
.time-machine-icon         /* Clock emoji ⏰ */
.era-tabs                  /* Container for tab buttons */
.era-tab                   /* Individual era button */
.era-tab.active            /* Currently selected era */
.era-tab.disabled          /* Unavailable era (V6) */
.era-tab.loading           /* During era switch */
.era-tab-year              /* Year display (1973, 1974, 1975) */
.era-tab-name              /* Version display (V4, V5, V6) */
.era-tab-indicator         /* Active indicator dot ● */
.era-selector-error        /* Error toast notification */
```

## Data Attributes

```html
<button class="era-tab active"
        data-era-id="v5"
        title="Complete source code preserved. The version we have full source for.">
```

## JavaScript API

```typescript
// Get all eras
const eras = timeMachine.getEras();
// Returns: [{ id: 'v4', name: '...', ... }, ...]

// Get current era
const current = timeMachine.getCurrentEra();
// Returns: { id: 'v5', name: 'Unix V5 (November 1974)', ... }

// Switch era
await timeMachine.switchEra('v4');

// Get specific era
const v4 = timeMachine.getEra('v4');

// Check current era ID
const id = timeMachine.getCurrentEraId();
// Returns: 'v5'
```
