/**
 * AnimFlow Playground - Demo application
 */

import { AnimFlow } from '@animflow/core';

let currentAnimflow: AnimFlow | null = null;

async function loadDiagram(diagramPath: string): Promise<void> {
  const container = document.getElementById('diagram-container');
  const infoEl = document.getElementById('diagram-info');

  if (!container) {
    console.error('Container not found');
    return;
  }

  // Destroy previous instance
  if (currentAnimflow) {
    currentAnimflow.destroy();
    currentAnimflow = null;
  }

  // Show loading state
  container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading diagram...</div>';

  try {
    // Load diagram from YAML file
    const response = await fetch(diagramPath);
    if (!response.ok) {
      throw new Error(`Failed to load diagram: ${response.statusText}`);
    }
    const source = await response.text();

    // Clear loading state before creating AnimFlow
    container.innerHTML = '';

    // Create AnimFlow instance with layout, controls, and progress indicator
    const animflow = new AnimFlow({
      container,
      source,
      format: 'yaml',
      autoRender: false,
      showControls: true,
      showProgress: true,
      enableLayout: true,
    });

    // Render the diagram
    await animflow.render();

    currentAnimflow = animflow;

    // Update info text
    const config = animflow.getConfig();
    if (infoEl && config?.metadata) {
      infoEl.textContent = config.metadata.description || config.metadata.title || 'Diagram loaded';
    }

    console.log('Diagram loaded successfully');
    console.log('Config:', config);

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

    // Log available scenarios and presets
    console.log('Available scenarios:', animflow.getScenarios());
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

function init(): void {
  const select = document.getElementById('diagram-select') as HTMLSelectElement;

  if (select) {
    // Load initial diagram
    loadDiagram(select.value);

    // Handle diagram selection change
    select.addEventListener('change', () => {
      loadDiagram(select.value);
    });
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
