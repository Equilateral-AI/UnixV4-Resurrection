/**
 * Example usage of the Source Overlay feature
 *
 * This demonstrates how to integrate the source overlay into UnixBox
 */

import { sourceOverlay, SourcePanel } from './index';

/**
 * Basic usage example
 */
export function basicExample() {
  // Create a source panel
  const panel = new SourcePanel({
    position: 'right',
    width: '600px',
    height: '500px',
    autoShow: true
  });

  // Enable dragging
  panel.enableDragging();

  // Get source for a syscall
  const forkSource = sourceOverlay.getSourceForSyscall('fork');
  if (forkSource) {
    panel.updateSource(forkSource);
  }

  // Show the panel
  panel.show();
}

/**
 * Integration with emulator events
 */
export function emulatorIntegrationExample() {
  const panel = new SourcePanel({
    position: 'right',
    autoShow: false
  });

  panel.enableDragging();

  // Subscribe to syscall events
  sourceOverlay.subscribeToSyscallEvents((syscallName: string) => {
    console.log(`Syscall detected: ${syscallName}`);

    const source = sourceOverlay.getSourceForSyscall(syscallName);
    if (source) {
      panel.updateSource(source);
      panel.show();
    }
  });

  // Simulate syscall events (in real usage, the emulator would emit these)
  setTimeout(() => sourceOverlay.emitSyscallEvent('fork'), 1000);
  setTimeout(() => sourceOverlay.emitSyscallEvent('exec'), 2000);
  setTimeout(() => sourceOverlay.emitSyscallEvent('read'), 3000);
}

/**
 * Interactive source browser
 */
export function sourceBrowserExample() {
  const panel = new SourcePanel({
    position: 'right',
    width: '700px',
    height: '600px'
  });

  panel.enableDragging();

  // Get all available syscalls
  const syscalls = sourceOverlay.getAvailableSyscalls();

  // Create a simple UI to browse them
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: #000;
    border: 2px solid #0f0;
    padding: 20px;
    color: #0f0;
    font-family: monospace;
    max-width: 300px;
  `;

  const title = document.createElement('h3');
  title.textContent = 'Unix V4 Source Browser';
  title.style.cssText = 'margin: 0 0 10px 0; color: #0f0;';
  container.appendChild(title);

  syscalls.forEach(name => {
    const button = document.createElement('button');
    button.textContent = name;
    button.style.cssText = `
      display: block;
      margin: 5px 0;
      padding: 5px 10px;
      background: #000;
      border: 1px solid #0f0;
      color: #0f0;
      cursor: pointer;
      width: 100%;
      text-align: left;
      font-family: monospace;
    `;

    button.onclick = () => {
      const source = sourceOverlay.getSourceForSyscall(name);
      if (source) {
        panel.updateSource(source);
        panel.show();
      }
    };

    button.onmouseenter = () => {
      button.style.background = '#003300';
    };

    button.onmouseleave = () => {
      button.style.background = '#000';
    };

    container.appendChild(button);
  });

  document.body.appendChild(container);
}

/**
 * Search example
 */
export function searchExample() {
  const panel = new SourcePanel({
    position: 'right'
  });

  panel.enableDragging();

  // Search for code related to "pipe"
  const results = sourceOverlay.searchSource('pipe');

  console.log(`Found ${results.length} results for "pipe"`);

  if (results.length > 0) {
    // Show the first result
    panel.updateSource(results[0]);
    panel.show();
  }

  return results;
}

/**
 * Show the famous comment
 */
export function showFamousComment() {
  const panel = new SourcePanel({
    position: 'right',
    width: '700px',
    height: '400px'
  });

  panel.enableDragging();

  const famousComment = sourceOverlay.getFamousComment();
  console.log('Famous Comment:', famousComment);

  // Show the swtch() function which contains the complex logic
  const swtchSource = sourceOverlay.getSourceForSyscall('swtch');
  if (swtchSource) {
    panel.updateSource(swtchSource);
    panel.show();
  }
}

/**
 * Example keyboard shortcuts
 */
export function addKeyboardShortcuts(panel: SourcePanel) {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+S: Toggle source panel
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      panel.toggle();
    }

    // Ctrl+Shift+F: Show fork() source
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      const source = sourceOverlay.getSourceForSyscall('fork');
      if (source) {
        panel.updateSource(source);
        panel.show();
      }
    }

    // Escape: Hide panel
    if (e.key === 'Escape' && panel.isShown()) {
      e.preventDefault();
      panel.hide();
    }
  });
}

/**
 * Full featured example with all integrations
 */
export function fullExample() {
  // Create the panel
  const panel = new SourcePanel({
    position: 'right',
    width: '650px',
    height: '550px',
    autoShow: false
  });

  panel.enableDragging();

  // Add keyboard shortcuts
  addKeyboardShortcuts(panel);

  // Subscribe to syscall events
  sourceOverlay.subscribeToSyscallEvents((syscallName: string) => {
    const source = sourceOverlay.getSourceForSyscall(syscallName);
    if (source) {
      panel.updateSource(source);
      panel.show();
    }
  });

  // Add info to console
  console.log('Source Overlay initialized!');
  console.log('Keyboard shortcuts:');
  console.log('  Ctrl+Shift+S: Toggle source panel');
  console.log('  Ctrl+Shift+F: Show fork() source');
  console.log('  Escape: Hide panel');
  console.log('');
  console.log('Available syscalls:', sourceOverlay.getAvailableSyscalls());
  console.log('');
  console.log('Use sourceOverlay.emitSyscallEvent("syscall_name") to trigger display');

  return panel;
}

/**
 * Initialize with default configuration
 * Call this from main.ts to enable the feature
 */
export function initializeSourceOverlay(): SourcePanel {
  return fullExample();
}

// For browser console access
if (typeof window !== 'undefined') {
  (window as any).sourceOverlay = sourceOverlay;
  (window as any).SourcePanel = SourcePanel;
  (window as any).initSourceOverlay = initializeSourceOverlay;
}
