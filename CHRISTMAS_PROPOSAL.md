# Unix Resurrection: A Christmas Proposal

**Date**: December 24, 2024
**From**: Agentic Santa's Research Elves

---

## Executive Summary

After analyzing Unix V4/V5 source code, Xv6, Firecracker, and four major unikernels, we propose a **dual-track project** that combines historical preservation with cutting-edge infrastructure innovation.

---

## Track 1: UnixBox (Hobby/Educational)

**Goal**: Run authentic 1974 Unix V5 in any modern browser

### What It Is
A "DOSBox for Unix" - PDP-11 emulator compiled to WebAssembly, running the actual Unix V5 binaries we extracted.

### Architecture
```
┌─────────────────────────────────────────────────┐
│              Modern Browser                      │
├─────────────────────────────────────────────────┤
│         Terminal UI (xterm.js)                   │
│    - Authentic look (green phosphor mode!)       │
│    - File drag-and-drop upload/download          │
├─────────────────────────────────────────────────┤
│         PDP-11 Emulator (WASM)                   │
│    - Based on existing pdp11.js                  │
│    - RK05 disk, TTY, LP emulation               │
├─────────────────────────────────────────────────┤
│         Unix V5 (Actual 1974 Binaries)           │
│    - Ken Thompson's kernel                       │
│    - Thompson shell                              │
│    - ed, cc, as, the works                       │
└─────────────────────────────────────────────────┘
```

### Unique Features
1. **Source Code Overlay**: See the actual C code as you execute commands
2. **Time Machine Mode**: Step through history (V4 tape → V5 → V6)
3. **Educational Annotations**: "You just ran `fork()` - here's how Ken implemented it in 1974"
4. **Multi-user**: Connect multiple browser tabs as different TTYs

### Prior Art
- **pdp11.js** by Paul Nankervis - already runs Unix V5/V6
- **v6.cuzuco.com** - Unix V6 in browser (we can do better UI)
- **copy.sh/v86** - x86 emulator in browser

### Effort Estimate
- Wrap existing pdp11.js in modern UI: 2-4 weeks
- Add educational overlays: 2-4 weeks
- Polish and ship: 2 weeks

**This is achievable as a hobby project.**

---

## Track 2: MicroUnix (Serious Infrastructure)

**Goal**: A "better Firecracker" by building up from minimal rather than trimming down

### The Insight

| Approach | Base Size | Philosophy |
|----------|-----------|------------|
| **Firecracker** | 40M LOC Linux guest | Trim the fat |
| **MicroUnix** | 9K LOC Xv6 base | Add only essentials |
| **Unikernels** | <10K LOC | Single-purpose |

### What We Learned

**Firecracker (Current Champion)**
- 50K LOC Rust VMM
- 125ms boot, 5MB overhead
- Uses KVM + minimized Linux guest
- Supports only 5 virtio devices (intentionally)

**Xv6 (Potential Base)**
- 9K LOC - complete Unix implementation
- RISC-V and x86 support
- Missing: networking, virtio drivers, security hardening
- Perfect for understanding what's truly essential

**Unikernels (Performance Comparison)**
| Unikernel | Boot Time | Min Memory | Binary Compat |
|-----------|-----------|------------|---------------|
| MirageOS | 1-2 ms | Few MB | OCaml only |
| OSv | 3-5 ms | 11 MB | Linux binaries |
| Nanos | 12-60 ms | Few MB | ELF binaries |
| IncludeOS | 10-300 ms | Few MB | C++ only |

### MicroUnix Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Host (Linux/KVM)                      │
├─────────────────────────────────────────────────────────┤
│                  MicroUnix VMM (Rust)                    │
│         Based on rust-vmm crates (like Firecracker)      │
│         - RESTful API for VM lifecycle                   │
│         - virtio device emulation                        │
│         - Security: jailer, seccomp                      │
├─────────────────────────────────────────────────────────┤
│                  MicroUnix Kernel                        │
│    ┌───────────┬───────────┬───────────┬───────────┐   │
│    │  Process  │  Memory   │  virtio   │  Syscall  │   │
│    │  (~500L)  │  (~800L)  │  (~2000L) │  (~500L)  │   │
│    └───────────┴───────────┴───────────┴───────────┘   │
│                   Target: <10K LOC                       │
├─────────────────────────────────────────────────────────┤
│              Equilateral Lambda Function                 │
│         (Single binary, fast start, fast exit)          │
└─────────────────────────────────────────────────────────┘
```

### What MicroUnix Needs (vs Xv6)

| Component | Xv6 Has | Need to Add |
|-----------|---------|-------------|
| Process management | ✅ | Simplify (single process) |
| Memory management | ✅ | Page tables for KVM |
| File system | ✅ | tmpfs only (simplify) |
| Scheduler | ✅ | Remove (single process) |
| Network stack | ❌ | virtio-net + minimal TCP/IP |
| virtio drivers | ❌ | net, block, vsock |
| System calls | ✅ | Subset for Lambda |
| Security | ❌ | Memory isolation, bounds |

### Why This Could Beat Firecracker

1. **Kernel Size**: 10K LOC vs Linux's 40M = auditable, verifiable
2. **Boot Time**: Target <10ms (vs Firecracker's 125ms)
3. **Memory**: Target <1MB (vs Firecracker's 5MB)
4. **Attack Surface**: Radically smaller
5. **Purpose-Built**: Optimized for Lambda, not general computing

### Critical Success Factors

**Must Have**:
- Linux binary compatibility (static ELF) OR
- Language-specific runtime (Go, Rust, WASM)
- virtio-mmio drivers (Firecracker's transport)
- Basic POSIX syscalls for Lambda use cases

**Differentiators**:
- Sub-10ms cold start
- Sub-1MB memory footprint
- Formal verification potential (small enough to prove)

### Research Questions

1. Can we run Go/Rust static binaries without full Linux compatibility?
2. What's the minimal syscall set for Lambda workloads?
3. Can we use Xv6's process model as-is or need unikernel approach?
4. Is WASM runtime a better target than native binaries?

---

## Recommended Path Forward

### Phase 1: UnixBox (Q1 2025)
- **Effort**: Hobby pace, evenings/weekends
- **Goal**: Ship browser-based Unix V5 experience
- **Outcome**: Educational tool, historical preservation, fun

### Phase 2: MicroUnix Research (Q1-Q2 2025)
- **Effort**: Research spike, 2-4 weeks focused
- **Goal**: Prove or disprove viability
- **Tasks**:
  1. Boot Xv6 under Firecracker's VMM
  2. Measure actual boot time
  3. Add minimal virtio-net
  4. Run simple HTTP handler
- **Outcome**: Go/no-go decision on full implementation

### Phase 3: MicroUnix Production (Q3-Q4 2025, if Phase 2 succeeds)
- **Effort**: Significant engineering investment
- **Goal**: Production-ready alternative to Firecracker
- **Outcome**: Equilateral's serverless infrastructure

---

## Competitive Landscape

| Solution | Status | Our Advantage |
|----------|--------|---------------|
| Firecracker | Production | Smaller kernel, faster boot |
| OSv | Maintained | Simpler, smaller |
| Nanos | Commercial | Open source, auditable |
| MirageOS | Academic | Polyglot support |
| WASM runtimes | Emerging | Full isolation |

---

## The Big Picture

Unix V4/V5 isn't just historical curiosity - it's a **design document** for minimal computing. In 1974, Thompson and Ritchie built a complete operating system in 9,000 lines because they had to. Modern systems are 4,000x larger because they can be.

**The question**: What if we applied 1974's constraints to 2025's hardware?

The answer might be infrastructure that's:
- Faster (nothing to load)
- Cheaper (smaller memory)
- Safer (auditable codebase)
- Simpler (comprehensible by one person)

That's the Christmas gift we're unwrapping.

---

## Appendix: Research Sources

### Firecracker
- 50K LOC Rust VMM
- 125ms boot, 5MB overhead, 150 VMs/second creation
- virtio-mmio transport (not PCI)
- Supports OSv unikernel guests

### Xv6
- 9K LOC complete Unix
- RISC-V actively maintained
- Monolithic kernel design
- Missing networking (biggest gap)

### Unikernels
- MirageOS: 1-2ms boot, OCaml only
- OSv: 3-5ms boot, Linux binary compat
- Nanos: Commercial, production-ready
- IncludeOS: C++ focused, telecom deployments

---

*Merry Christmas! 🎄*
