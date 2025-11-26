/**
 * AnimFlow Playground - Demo application
 */

import { AnimFlow } from '@animflow/core';

async function main(): Promise<void> {
  const container = document.getElementById('diagram-container');
  if (!container) {
    console.error('Container not found');
    return;
  }

  // Show loading state
  container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading diagram...</div>';

  try {
    // Load diagram from YAML file first
    const response = await fetch('/diagrams/caching-flow.animflow.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load diagram: ${response.statusText}`);
    }
    const source = await response.text();

    // Clear loading state before creating AnimFlow
    container.innerHTML = '';

    // Create AnimFlow instance with layout and controls
    const animflow = new AnimFlow({
      container,
      source,
      format: 'yaml',
      autoRender: false,
      showControls: true,
      enableLayout: true,
      defaultScenario: 'cache-simulation',
    });

    // Render the diagram
    await animflow.render();

    console.log('Diagram loaded successfully');
    console.log('Config:', animflow.getConfig());

    // Listen for events
    animflow.on('render', () => {
      console.log('Diagram rendered');
    });

    animflow.on('error', ({ error }: { error: Error }) => {
      console.error('AnimFlow error:', error);
    });

    animflow.on('scenario:start', ({ scenarioId }: { scenarioId: string }) => {
      console.log(`Scenario started: ${scenarioId}`);
    });

    animflow.on('scenario:end', ({ scenarioId }: { scenarioId: string }) => {
      console.log(`Scenario ended: ${scenarioId}`);
    });

    animflow.on('state:change', ({ state }: { state: string }) => {
      console.log(`State changed: ${state}`);
    });

    animflow.on('preset:change', ({ presetId }: { presetId: string }) => {
      console.log(`Preset changed: ${presetId}`);
    });

    // Log available presets
    console.log('Available presets:', animflow.getPresets());

    // Make instance available for debugging
    (window as unknown as { animflow: AnimFlow }).animflow = animflow;

  } catch (error) {
    console.error('Failed to load diagram:', error);
    container.innerHTML = `<div class="error">
      <strong>Error loading diagram:</strong><br>
      ${error instanceof Error ? error.message : 'Unknown error'}
    </div>`;
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
