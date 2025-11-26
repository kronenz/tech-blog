/**
 * Preset Store - manages scenario presets and their variable configurations
 */

import type { PresetConfig, PresetVariables } from '../types';

/**
 * Preset Store for managing scenario variable presets
 */
export class PresetStore {
  private presets: Map<string, PresetConfig> = new Map();
  private defaultPresetId: string | null = null;

  /**
   * Load presets from config
   */
  loadPresets(presets: PresetConfig[]): void {
    this.presets.clear();
    this.defaultPresetId = null;

    for (const preset of presets) {
      this.presets.set(preset.id, preset);
      if (preset.default) {
        this.defaultPresetId = preset.id;
      }
    }
  }

  /**
   * Get a preset by ID
   */
  getPreset(id: string): PresetConfig | undefined {
    return this.presets.get(id);
  }

  /**
   * Get resolved variables for a preset (including inherited variables)
   */
  getVariables(presetId: string): PresetVariables {
    const preset = this.presets.get(presetId);
    if (!preset) {
      return {};
    }

    // Handle inheritance
    let variables: PresetVariables = {};

    if (preset.extends) {
      const parentVariables = this.getVariables(preset.extends);
      variables = { ...parentVariables };
    }

    // Merge with own variables (own takes precedence)
    if (preset.variables) {
      variables = { ...variables, ...preset.variables };
    }

    return variables;
  }

  /**
   * Get list of all presets
   */
  listPresets(): PresetConfig[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get preset info for UI display
   */
  getPresetsInfo(): Array<{ id: string; name: string; description?: string; isDefault: boolean }> {
    return this.listPresets().map((preset) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      isDefault: preset.default ?? false,
    }));
  }

  /**
   * Get the default preset ID
   */
  getDefaultPresetId(): string | null {
    return this.defaultPresetId;
  }

  /**
   * Check if a preset exists
   */
  has(id: string): boolean {
    return this.presets.has(id);
  }

  /**
   * Get the number of presets
   */
  size(): number {
    return this.presets.size;
  }

  /**
   * Clear all presets
   */
  clear(): void {
    this.presets.clear();
    this.defaultPresetId = null;
  }
}
