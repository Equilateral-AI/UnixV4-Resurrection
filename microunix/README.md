# MicroUnix - Minimal MicroVM Kernel

A "better Firecracker" built up from Unix principles, not trimmed down from Linux.

## Vision

| Metric | Firecracker | MicroUnix Target |
|--------|-------------|------------------|
| Kernel LOC | 40M (Linux) | <10K |
| Boot time | 125ms | <10ms |
| Memory | 5MB | <1MB |
| Attack surface | Reduced | Minimal |

## Architecture

```
microunix/
  vmm/              # Rust VMM (rust-vmm based)
    src/
      api/          # RESTful VM lifecycle API
      devices/      # virtio device emulation
      security/     # jailer, seccomp
  kernel/           # MicroUnix kernel (C or Rust)
    src/
      boot/         # Early boot, KVM setup
      mem/          # Page tables, allocation
      proc/         # Single-process execution
      virtio/       # virtio-mmio drivers
      syscall/      # Minimal syscall interface
```

## Research Questions

1. Can Xv6 boot under Firecracker's VMM?
2. What's the minimal syscall set for Lambda workloads?
3. WASM vs native binary target?

## Phase 1: Research Spike

```bash
# Boot Xv6 under QEMU
cd kernel && make qemu

# Measure boot time
./scripts/measure-boot.sh

# Compare with Firecracker baseline
./scripts/compare-firecracker.sh
```

## References

- [Xv6 RISC-V](https://github.com/mit-pdos/xv6-riscv)
- [Firecracker](https://github.com/firecracker-microvm/firecracker)
- [rust-vmm](https://github.com/rust-vmm)
- [OSv Unikernel](https://github.com/cloudius-systems/osv)
