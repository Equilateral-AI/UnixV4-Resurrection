# Vite Configuration for UnixBox

## Overview

This document explains the Vite configuration for UnixBox, which hosts the PDP-11 emulator and Unix V5 disk images.

## Key Configuration Features

### 1. Public Directory Serving

The `public/` directory is automatically served by Vite and contains:

```
public/
├── vendor/
│   └── pdp11/          # PDP-11 emulator JavaScript files
│       ├── pdp11.js    # Core CPU emulation
│       ├── iopage.js   # I/O page handlers
│       ├── bootcode.js # Boot ROM code
│       ├── fpp.js      # Floating Point Processor
│       └── vt52.js     # VT52 terminal emulation
└── disk-images/
    └── unix-v5.dsk     # Unix V5 disk image (2.4 MB)
```

**Access URLs**:
- Development: `http://localhost:3000/vendor/pdp11/pdp11.js`
- Development: `http://localhost:3000/disk-images/unix-v5.dsk`
- Production: `/vendor/pdp11/pdp11.js` (from dist/)
- Production: `/disk-images/unix-v5.dsk` (from dist/)

### 2. HTTP Range Request Support

The emulator loads disk images using HTTP Range requests (partial content). This is critical for performance:

```typescript
headers: {
  'Accept-Ranges': 'bytes',
}
```

**Why this matters**:
- The PDP-11 emulator doesn't load the entire 2.4 MB disk image at once
- It uses Range requests to fetch specific disk sectors on demand
- Without Range support, the emulator cannot load disk images

**Verification**:
```bash
# Test Range request support
curl -H "Range: bytes=0-1023" -I http://localhost:3000/disk-images/unix-v5.dsk

# Should return:
# HTTP/1.1 206 Partial Content
# Accept-Ranges: bytes
# Content-Range: bytes 0-1023/2494464
```

### 3. CORS Configuration

CORS is enabled for cross-origin requests (useful for development):

```typescript
cors: true,
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
}
```

### 4. Source Maps

Source maps are enabled in production builds for debugging:

```typescript
build: {
  sourcemap: true,
}
```

### 5. Asset Configuration

`.dsk` files are treated as assets (not processed):

```typescript
assetsInclude: ['**/*.dsk'],
```

### 6. Code Splitting

xterm.js libraries are bundled separately for optimal loading:

```typescript
rollupOptions: {
  output: {
    manualChunks: {
      'xterm': ['xterm', 'xterm-addon-fit', 'xterm-addon-web-links'],
    },
  },
}
```

## TypeScript Configuration

### Type Declarations

PDP-11 emulator types are declared in `src/types/pdp11.d.ts`:

```typescript
// Global variables exposed by emulator scripts
declare var CPU: PDP11CPU;
declare function boot(): void;
declare function vt52Initialize(...): void;
declare function vt52Put(unit: number, char: number): void;

// Extended Window interface
interface Window {
  CPU: PDP11CPU;
  boot: typeof boot;
  vt52Initialize: typeof vt52Initialize;
  // ... etc
}
```

### TypeScript Configuration

`tsconfig.json` includes the types directory:

```json
{
  "include": ["src"],
  "typeRoots": ["./node_modules/@types", "./src/types"]
}
```

## Loading Emulator Scripts

The emulator consists of non-ES-module JavaScript files that must be loaded in specific order:

### Load Order (Critical!)

1. **pdp11.js** - Core CPU emulation (defines `CPU` global)
2. **iopage.js** - I/O page handlers (depends on CPU)
3. **bootcode.js** - Boot ROM code (depends on CPU)
4. **fpp.js** - Floating Point Processor (optional, depends on CPU)
5. **vt52.js** - VT52 terminal emulation (depends on CPU)

### Loading in TypeScript

The `PDP11Bridge` class handles dynamic script loading:

```typescript
import { pdp11 } from './emulator/pdp11-bridge';

// Initialize (loads scripts in correct order)
await pdp11.initialize();

// Connect xterm.js terminal
pdp11.connectTerminal(terminal);

// Boot the emulator
pdp11.boot();
```

See `src/emulator/pdp11-bridge.ts` for implementation details.

## Development Workflow

### Start Development Server

```bash
npm run dev
```

- Server starts on `http://localhost:3000` (or next available port)
- Public files served automatically
- Hot module replacement enabled
- Source maps available

### Build for Production

```bash
npm run build
```

- TypeScript compilation (`tsc`)
- Vite bundling with optimizations
- Output to `dist/` directory
- Public files copied to `dist/`
- Source maps generated

### Preview Production Build

```bash
npm run preview
```

- Serves the `dist/` directory
- Uses same CORS/Range headers as dev server
- Runs on `http://localhost:3000`

## Testing Configuration

### Test Disk Image Access

```bash
# Start dev server
npm run dev

# In another terminal:
# Test basic access
curl -I http://localhost:3000/disk-images/unix-v5.dsk

# Test Range requests
curl -H "Range: bytes=0-1023" -I http://localhost:3000/disk-images/unix-v5.dsk

# Test emulator scripts
curl -I http://localhost:3000/vendor/pdp11/pdp11.js
```

### Expected Responses

**Disk image (full request)**:
```
HTTP/1.1 200 OK
Accept-Ranges: bytes
Content-Length: 2494464
Content-Type: application/octet-stream
```

**Disk image (range request)**:
```
HTTP/1.1 206 Partial Content
Accept-Ranges: bytes
Content-Range: bytes 0-1023/2494464
Content-Length: 1024
```

**JavaScript files**:
```
HTTP/1.1 200 OK
Content-Type: text/javascript
Content-Length: 117806
```

## Common Issues

### Issue: Disk image not loading

**Symptom**: Emulator shows "failed to load disk image"

**Causes**:
1. Missing `Accept-Ranges` header
2. CORS blocking request
3. Wrong file path

**Solutions**:
1. Verify vite.config.ts has `Accept-Ranges: bytes`
2. Check browser console for CORS errors
3. Ensure disk image is in `public/disk-images/`

### Issue: TypeScript errors about global functions

**Symptom**: `Property 'boot' does not exist on type 'Window'`

**Solution**:
1. Check `src/types/pdp11.d.ts` exists
2. Verify `tsconfig.json` includes `typeRoots`
3. Restart TypeScript server in IDE

### Issue: Scripts loading out of order

**Symptom**: `CPU is not defined` errors in console

**Solution**:
- Use `PDP11Bridge.initialize()` which loads scripts sequentially
- Never load scripts manually with `<script>` tags in HTML
- Scripts must be loaded via `loadScriptsSequentially()` method

## Architecture Decisions

### Why not ES modules?

The PDP-11 emulator by Paul Nankervis is a legacy codebase (2014-2020) written as plain JavaScript files with global variables. Converting to ES modules would require:
- Extensive refactoring (10,000+ lines)
- Risk of introducing bugs
- Loss of compatibility with original emulator

**Our solution**: Load scripts dynamically in TypeScript, provide type declarations

### Why dynamic script loading?

- Maintains load order guarantees
- Works with Vite's dev server and production builds
- Allows TypeScript integration via bridge pattern
- No modification of original emulator code required

### Why XHR patching for disk images?

The emulator hardcodes disk filenames like `rk0.dsk`, but we want to serve from `/disk-images/unix-v5.dsk`. The XHR proxy intercepts requests and redirects to our configured paths:

```typescript
// rk0.dsk → /disk-images/unix-v5.dsk
window.XMLHttpRequest = /* patched version */
```

This is a bit hacky but avoids modifying emulator internals.

## Performance Considerations

### Bundle Sizes

After build:
- `index.html`: ~11.8 KB
- `xterm` chunk: ~286 KB (gzipped: ~71 KB)
- `main` chunk: ~12 KB (gzipped: ~4 KB)
- Total JS: ~298 KB (gzipped: ~75 KB)

### Loading Strategy

1. HTML loads first (~12 KB)
2. Main bundle loads and initializes terminal (~12 KB)
3. Emulator scripts load sequentially (~270 KB total)
4. Disk image loads on-demand via Range requests (~2.4 MB)

**Total initial load**: ~24 KB + emulator scripts
**On-demand load**: Disk sectors as needed

### Optimization Opportunities

- Enable gzip compression on server (if not using Vite dev server)
- Use CDN for xterm.js libraries
- Cache emulator scripts aggressively (they never change)
- Implement disk image caching (IndexedDB)

## References

- [Vite Documentation](https://vitejs.dev/)
- [PDP-11 Emulator](https://github.com/paulnank/pdp11)
- [xterm.js](https://xtermjs.org/)
- [HTTP Range Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)
