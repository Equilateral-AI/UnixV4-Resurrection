/**
 * TerminalSync - Cross-tab communication for multi-terminal support
 *
 * Uses BroadcastChannel API to coordinate terminal I/O between tabs.
 * Primary tab (TTY0) runs the emulator and relays output to secondary tabs.
 * Secondary tabs send input back to primary via the channel.
 */

export type MessageType = 'register' | 'unregister' | 'output' | 'input' | 'ping' | 'pong';

export interface TerminalMessage {
  type: MessageType;
  unit: number;
  data?: string | number[];
  timestamp: number;
  tabId: string;
}

export type OutputCallback = (unit: number, data: string) => void;
export type InputCallback = (unit: number, data: string) => void;

/**
 * TerminalSync manages cross-tab communication for multi-terminal support
 */
export class TerminalSync {
  private channel: BroadcastChannel;
  private readonly channelName = 'unixbox-terminal-sync';
  private outputCallbacks: Set<OutputCallback> = new Set();
  private inputCallbacks: Set<InputCallback> = new Set();
  private registeredUnits: Set<number> = new Set();
  private readonly tabId: string;
  private isPrimary: boolean;

  constructor(isPrimary: boolean = true) {
    this.isPrimary = isPrimary;
    this.tabId = this.generateTabId();
    this.channel = new BroadcastChannel(this.channelName);

    this.channel.addEventListener('message', this.handleMessage.bind(this));

    console.log(`[TerminalSync] Initialized ${isPrimary ? 'PRIMARY' : 'SECONDARY'} tab (${this.tabId})`);
  }

  /**
   * Generate a unique tab ID
   */
  private generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle incoming messages from other tabs
   */
  private handleMessage(event: MessageEvent<TerminalMessage>): void {
    const msg = event.data;

    // Ignore messages from self
    if (msg.tabId === this.tabId) {
      return;
    }

    switch (msg.type) {
      case 'register':
        console.log(`[TerminalSync] Unit ${msg.unit} registered in tab ${msg.tabId}`);
        this.registeredUnits.add(msg.unit);

        // If we're primary, acknowledge with a pong
        if (this.isPrimary) {
          this.sendMessage({
            type: 'pong',
            unit: msg.unit,
            tabId: this.tabId,
            timestamp: Date.now()
          });
        }
        break;

      case 'unregister':
        console.log(`[TerminalSync] Unit ${msg.unit} unregistered from tab ${msg.tabId}`);
        this.registeredUnits.delete(msg.unit);
        break;

      case 'output':
        // Secondary tabs receive output from primary
        if (!this.isPrimary && typeof msg.data === 'string') {
          this.outputCallbacks.forEach(cb => cb(msg.unit, msg.data as string));
        }
        break;

      case 'input':
        // Primary receives input from secondary tabs
        if (this.isPrimary && typeof msg.data === 'string') {
          this.inputCallbacks.forEach(cb => cb(msg.unit, msg.data as string));
        }
        break;

      case 'ping':
        // Respond to ping with pong
        this.sendMessage({
          type: 'pong',
          unit: msg.unit,
          tabId: this.tabId,
          timestamp: Date.now()
        });
        break;

      case 'pong':
        // Just log pongs for now
        console.log(`[TerminalSync] Pong from ${msg.tabId} for unit ${msg.unit}`);
        break;
    }
  }

  /**
   * Send a message to all other tabs
   */
  private sendMessage(msg: TerminalMessage): void {
    this.channel.postMessage(msg);
  }

  /**
   * Register a terminal unit
   */
  register(unit: number): void {
    console.log(`[TerminalSync] Registering unit ${unit}`);
    this.registeredUnits.add(unit);

    this.sendMessage({
      type: 'register',
      unit,
      tabId: this.tabId,
      timestamp: Date.now()
    });
  }

  /**
   * Unregister a terminal unit
   */
  unregister(unit: number): void {
    console.log(`[TerminalSync] Unregistering unit ${unit}`);
    this.registeredUnits.delete(unit);

    this.sendMessage({
      type: 'unregister',
      unit,
      tabId: this.tabId,
      timestamp: Date.now()
    });
  }

  /**
   * Send input from a secondary terminal to the primary
   */
  sendInput(unit: number, data: string): void {
    this.sendMessage({
      type: 'input',
      unit,
      data,
      tabId: this.tabId,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast output from primary to secondary terminals
   */
  broadcastOutput(unit: number, data: string): void {
    if (!this.isPrimary) {
      console.warn('[TerminalSync] Only primary tab can broadcast output');
      return;
    }

    this.sendMessage({
      type: 'output',
      unit,
      data,
      tabId: this.tabId,
      timestamp: Date.now()
    });
  }

  /**
   * Register callback for output events (secondary tabs)
   */
  onOutput(callback: OutputCallback): void {
    this.outputCallbacks.add(callback);
  }

  /**
   * Register callback for input events (primary tab)
   */
  onInput(callback: InputCallback): void {
    this.inputCallbacks.add(callback);
  }

  /**
   * Get list of registered units across all tabs
   */
  getActiveTerminals(): number[] {
    return Array.from(this.registeredUnits).sort();
  }

  /**
   * Check if a unit is registered
   */
  isUnitRegistered(unit: number): boolean {
    return this.registeredUnits.has(unit);
  }

  /**
   * Ping all tabs to refresh unit registry
   */
  ping(): void {
    this.sendMessage({
      type: 'ping',
      unit: -1, // Broadcast ping
      tabId: this.tabId,
      timestamp: Date.now()
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Unregister all our units
    this.registeredUnits.forEach(unit => this.unregister(unit));

    // Close channel
    this.channel.close();

    console.log('[TerminalSync] Destroyed');
  }
}
