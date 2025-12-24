#!/bin/bash
# UnixBox Vite Configuration Test Suite
# Tests all critical aspects of the Vite configuration

set -e

echo "========================================="
echo "UnixBox Vite Configuration Test Suite"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_step() {
  echo -e "${YELLOW}[TEST]${NC} $1"
}

pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((PASSED++))
}

fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((FAILED++))
}

# Test 1: TypeScript compilation
test_step "TypeScript compilation"
if npx tsc --noEmit; then
  pass "TypeScript compiles without errors"
else
  fail "TypeScript compilation failed"
fi
echo ""

# Test 2: Vite build
test_step "Vite build"
if npm run build > /tmp/vite-build.log 2>&1; then
  pass "Vite build successful"

  # Check output files
  if [ -f "dist/index.html" ]; then
    pass "dist/index.html generated"
  else
    fail "dist/index.html not found"
  fi

  if [ -d "dist/vendor/pdp11" ]; then
    pass "dist/vendor/pdp11/ copied"
  else
    fail "dist/vendor/pdp11/ not copied"
  fi

  if [ -d "dist/disk-images" ]; then
    pass "dist/disk-images/ copied"
  else
    fail "dist/disk-images/ not copied"
  fi

  if [ -f "dist/disk-images/unix-v5.dsk" ]; then
    SIZE=$(stat -f%z "dist/disk-images/unix-v5.dsk" 2>/dev/null || stat -c%s "dist/disk-images/unix-v5.dsk" 2>/dev/null)
    if [ "$SIZE" -eq 2494464 ]; then
      pass "unix-v5.dsk correct size (2494464 bytes)"
    else
      fail "unix-v5.dsk wrong size (expected 2494464, got $SIZE)"
    fi
  else
    fail "dist/disk-images/unix-v5.dsk not found"
  fi
else
  fail "Vite build failed"
  cat /tmp/vite-build.log
fi
echo ""

# Test 3: Start dev server
test_step "Starting dev server"
npm run dev > /tmp/vite-dev.log 2>&1 &
DEV_PID=$!
echo "Dev server PID: $DEV_PID"

# Wait for server to start
sleep 3

# Check if server is running
if ps -p $DEV_PID > /dev/null; then
  pass "Dev server started"

  # Extract port from log
  PORT=$(grep -o "localhost:[0-9]*" /tmp/vite-dev.log | head -1 | cut -d: -f2)
  echo "Server running on port: $PORT"

  # Test 4: HTTP requests
  echo ""
  test_step "Testing HTTP endpoints"

  # Test disk image
  if curl -s -I "http://localhost:$PORT/disk-images/unix-v5.dsk" | grep -q "200 OK"; then
    pass "Disk image accessible (200 OK)"
  else
    fail "Disk image not accessible"
  fi

  # Test Accept-Ranges header
  if curl -s -I "http://localhost:$PORT/disk-images/unix-v5.dsk" | grep -q "Accept-Ranges: bytes"; then
    pass "Accept-Ranges header present"
  else
    fail "Accept-Ranges header missing"
  fi

  # Test Range request
  RANGE_RESPONSE=$(curl -s -I -H "Range: bytes=0-1023" "http://localhost:$PORT/disk-images/unix-v5.dsk")
  if echo "$RANGE_RESPONSE" | grep -q "206 Partial Content"; then
    pass "Range requests work (206 Partial Content)"
  else
    fail "Range requests not working"
    echo "$RANGE_RESPONSE"
  fi

  if echo "$RANGE_RESPONSE" | grep -q "Content-Range: bytes 0-1023/2494464"; then
    pass "Content-Range header correct"
  else
    fail "Content-Range header incorrect"
  fi

  # Test CORS headers
  if curl -s -I "http://localhost:$PORT/disk-images/unix-v5.dsk" | grep -q "Access-Control-Allow-Origin: \*"; then
    pass "CORS headers present"
  else
    fail "CORS headers missing"
  fi

  # Test emulator scripts
  if curl -s -I "http://localhost:$PORT/vendor/pdp11/pdp11.js" | grep -q "200 OK"; then
    pass "pdp11.js accessible"
  else
    fail "pdp11.js not accessible"
  fi

  if curl -s -I "http://localhost:$PORT/vendor/pdp11/vt52.js" | grep -q "200 OK"; then
    pass "vt52.js accessible"
  else
    fail "vt52.js not accessible"
  fi

  # Test Content-Type
  if curl -s -I "http://localhost:$PORT/vendor/pdp11/pdp11.js" | grep -q "Content-Type: text/javascript"; then
    pass "JavaScript files served with correct Content-Type"
  else
    fail "JavaScript files have wrong Content-Type"
  fi

  # Cleanup
  echo ""
  test_step "Stopping dev server"
  kill $DEV_PID
  wait $DEV_PID 2>/dev/null || true
  pass "Dev server stopped"
else
  fail "Dev server failed to start"
  cat /tmp/vite-dev.log
fi

# Test 5: File structure
echo ""
test_step "Checking file structure"

if [ -f "vite.config.ts" ]; then
  pass "vite.config.ts exists"
else
  fail "vite.config.ts missing"
fi

if [ -f "src/types/pdp11.d.ts" ]; then
  pass "src/types/pdp11.d.ts exists"
else
  fail "src/types/pdp11.d.ts missing"
fi

if [ -f "public/disk-images/unix-v5.dsk" ]; then
  pass "public/disk-images/unix-v5.dsk exists"
else
  fail "public/disk-images/unix-v5.dsk missing"
fi

if [ -f "public/vendor/pdp11/pdp11.js" ]; then
  pass "public/vendor/pdp11/pdp11.js exists"
else
  fail "public/vendor/pdp11/pdp11.js missing"
fi

# Summary
echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
