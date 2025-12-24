/**
 * EducationalEngine - Central event bus for UnixBox educational features
 *
 * This class provides a lightweight EventEmitter pattern to coordinate
 * syscall interception, source mapping, and UI updates across the educational
 * feature set.
 *
 * Usage:
 *   import { educationalEngine } from './EducationalEngine';
 *
 *   educationalEngine.on('syscall', (event) => {
 *     console.log('Syscall intercepted:', event.name);
 *   });
 */

import type { EducationalEventType } from '../types/educational';

/**
 * Event handler function type
 */
type EventHandler = (data: any) => void;

/**
 * EducationalEngine - Singleton event bus for coordinating educational features
 */
export class EducationalEngine {
  private handlers: Map<EducationalEventType, Set<EventHandler>>;

  constructor() {
    this.handlers = new Map();
    this.initializeEventTypes();
  }

  /**
   * Initialize event type maps
   */
  private initializeEventTypes(): void {
    const eventTypes: EducationalEventType[] = ['syscall', 'source-change', 'era-change'];
    for (const type of eventTypes) {
      this.handlers.set(type, new Set());
    }
  }

  /**
   * Register an event handler
   *
   * @param type - Event type to listen for
   * @param handler - Handler function to invoke when event is emitted
   */
  on(type: EducationalEventType, handler: EventHandler): void {
    const handlerSet = this.handlers.get(type);
    if (!handlerSet) {
      console.warn(`[EducationalEngine] Unknown event type: ${type}`);
      return;
    }

    handlerSet.add(handler);
    console.log(`[EducationalEngine] Registered handler for '${type}' (total: ${handlerSet.size})`);
  }

  /**
   * Unregister an event handler
   *
   * @param type - Event type to stop listening for
   * @param handler - Handler function to remove
   */
  off(type: EducationalEventType, handler: EventHandler): void {
    const handlerSet = this.handlers.get(type);
    if (!handlerSet) {
      console.warn(`[EducationalEngine] Unknown event type: ${type}`);
      return;
    }

    const removed = handlerSet.delete(handler);
    if (removed) {
      console.log(`[EducationalEngine] Unregistered handler for '${type}' (remaining: ${handlerSet.size})`);
    } else {
      console.warn(`[EducationalEngine] Handler not found for '${type}'`);
    }
  }

  /**
   * Emit an event to all registered handlers
   *
   * @param type - Event type to emit
   * @param data - Event data to pass to handlers
   */
  emit(type: EducationalEventType, data: any): void {
    const handlerSet = this.handlers.get(type);
    if (!handlerSet) {
      console.warn(`[EducationalEngine] Unknown event type: ${type}`);
      return;
    }

    if (handlerSet.size === 0) {
      // Uncomment for debugging: console.log(`[EducationalEngine] No handlers for '${type}'`);
      return;
    }

    // Invoke all handlers (asynchronously to prevent blocking)
    for (const handler of handlerSet) {
      try {
        // Use setTimeout to prevent handler errors from blocking other handlers
        setTimeout(() => {
          try {
            handler(data);
          } catch (error) {
            console.error(`[EducationalEngine] Handler error for '${type}':`, error);
          }
        }, 0);
      } catch (error) {
        console.error(`[EducationalEngine] Failed to schedule handler for '${type}':`, error);
      }
    }
  }

  /**
   * Remove all handlers for a specific event type
   *
   * @param type - Event type to clear handlers for
   */
  clearHandlers(type: EducationalEventType): void {
    const handlerSet = this.handlers.get(type);
    if (!handlerSet) {
      console.warn(`[EducationalEngine] Unknown event type: ${type}`);
      return;
    }

    handlerSet.clear();
    console.log(`[EducationalEngine] Cleared all handlers for '${type}'`);
  }

  /**
   * Remove all handlers for all event types
   */
  clearAllHandlers(): void {
    for (const handlerSet of this.handlers.values()) {
      handlerSet.clear();
    }
    console.log('[EducationalEngine] Cleared all handlers');
  }

  /**
   * Get the number of handlers registered for an event type
   *
   * @param type - Event type to check
   * @returns Number of registered handlers
   */
  getHandlerCount(type: EducationalEventType): number {
    const handlerSet = this.handlers.get(type);
    return handlerSet ? handlerSet.size : 0;
  }

  /**
   * Check if any handlers are registered for an event type
   *
   * @param type - Event type to check
   * @returns True if at least one handler is registered
   */
  hasHandlers(type: EducationalEventType): boolean {
    return this.getHandlerCount(type) > 0;
  }
}

/**
 * Singleton instance of EducationalEngine
 * Export this to ensure all modules share the same event bus
 */
export const educationalEngine = new EducationalEngine();
