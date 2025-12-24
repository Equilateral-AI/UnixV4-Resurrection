/**
 * TypeScript type definitions for UnixBox educational features
 *
 * This module defines interfaces and types for the educational layer that
 * provides real-time insights into Unix V4 system calls, source code mapping,
 * and historical context.
 */

/**
 * Represents a system call event intercepted from the PDP-11 emulator
 */
export interface SyscallEvent {
  /** System call number (e.g., 1 for exit, 2 for fork, 3 for read) */
  number: number;

  /** Human-readable name of the system call (e.g., "fork", "read", "write") */
  name: string;

  /** Arguments passed to the system call (register values) */
  args: number[];

  /** Program counter at the time of the syscall (instruction address) */
  pc: number;

  /** Timestamp when the syscall was intercepted (milliseconds since epoch) */
  timestamp: number;
}

/**
 * Represents a location in the Unix V4 source code
 */
export interface SourceLocation {
  /** Source file path (e.g., "usr/sys/ken/trap.c") */
  file: string;

  /** Line number in the source file */
  line: number;

  /** Function name containing this location (optional) */
  function?: string;

  /** Memory address corresponding to this source location */
  address: number;
}

/**
 * Detailed annotation for a system call, including implementation details
 * and historical context from Dennis Ritchie's commentary
 */
export interface SyscallAnnotation {
  /** System call number */
  syscallNumber: number;

  /** System call name */
  name: string;

  /** C function signature (e.g., "int fork(void)") */
  signature: string;

  /** Human-readable description of what the syscall does */
  description: string;

  /** Path to the implementation file (e.g., "/usr/sys/ken/fork.c") */
  implementation: string;

  /** Historical note from Dennis Ritchie's Unix commentary (optional) */
  historicalNote?: string;

  /** Relevant code snippet from the implementation (optional) */
  codeSnippet?: string;

  /** Related source files (e.g., header files, caller sites) */
  sourceFiles: string[];
}

/**
 * Configuration for different Unix eras (V4, V5, V6)
 */
export interface EraConfig {
  /** Era identifier */
  id: 'v4' | 'v5' | 'v6';

  /** Human-readable era name */
  name: string;

  /** Year of release */
  year: number;

  /** Path to the disk image for this era */
  diskImage: string;

  /** Historical notes about this Unix version */
  notes: string;
}

/**
 * Types of educational events that can be emitted
 */
export type EducationalEventType = 'syscall' | 'source-change' | 'era-change';

/**
 * Handler function for educational events
 */
export type EducationalEventHandler = (type: EducationalEventType, data: any) => void;
