export interface ApiPreset {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

const STORAGE_KEY = 'kai_api_presets';
const ACTIVE_KEY = 'kai_active_preset';
const CURRENT_CONFIG_KEY = 'kai_current_api_config';

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function getCurrentConfig(): ApiConfig | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CURRENT_CONFIG_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentConfig(config: ApiConfig): void {
  localStorage.setItem(CURRENT_CONFIG_KEY, JSON.stringify(config));
}

export function getPresets(): ApiPreset[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePreset(preset: ApiPreset): void {
  const presets = getPresets();
  const idx = presets.findIndex((p) => p.id === preset.id);
  if (idx >= 0) {
    presets[idx] = preset;
  } else {
    presets.push(preset);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function deletePreset(id: string): void {
  const presets = getPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  if (getActivePresetId() === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function getActivePresetId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActivePresetId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActivePreset(): ApiPreset | null {
  const id = getActivePresetId();
  if (!id) return null;
  return getPresets().find((p) => p.id === id) || null;
}
