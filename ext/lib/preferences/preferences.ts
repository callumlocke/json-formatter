import {
  defineSetting,
  PreferenceManager,
  type InferSchema,
} from '../PreferenceManager'

type ThemeOverride = 'system' | 'force_dark' | 'force_light'

// Helper to define options with strong typing for objects/enums
export const UserPreferences = {
  themeOverride: defineSetting<ThemeOverride>('system', (value) => {
    switch (value) {
      case 'system':
      case 'force_dark':
      case 'force_light':
        return true
    }
    return false
  }),
}

export type UserPreferences = InferSchema<typeof UserPreferences>

export const preferenceKeys = Object.keys(UserPreferences)

export const prefStore = new PreferenceManager(UserPreferences, 'user_prefs_v3')
