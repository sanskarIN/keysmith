import type { PasswordPreset } from "../types";
import { en } from "./en";

const PRESET_COPY = {
  balanced: {
    name: en.presetBalancedName,
    description: en.presetBalancedDescription,
  },
  maximum: {
    name: en.presetMaximumName,
    description: en.presetMaximumDescription,
  },
  legacy: {
    name: en.presetLegacyName,
    description: en.presetLegacyDescription,
  },
  alphanumeric: {
    name: en.presetAlphanumericName,
    description: en.presetAlphanumericDescription,
  },
} as const;

export interface LocalizedPresetCopy {
  name: string;
  description: string;
}

export function localizedPresetCopy(
  preset: Pick<PasswordPreset, "id" | "name" | "description">,
): LocalizedPresetCopy {
  return PRESET_COPY[preset.id as keyof typeof PRESET_COPY] ?? {
    name: preset.name,
    description: preset.description,
  };
}
