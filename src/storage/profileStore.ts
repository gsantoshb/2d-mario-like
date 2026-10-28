import { defaults, migrateProfile, validateProfile, type Profile } from '../progression/profile';
export const SAVE_KEY = 'mass-quest.v2';
export const LEGACY_SAVE_KEY = 'mass-quest.v1';
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function loadProfile(storage: StorageLike): { profile: Profile; notice: string } {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (raw !== null) return { profile: validateProfile(JSON.parse(raw)), notice: '' };
    const legacy = storage.getItem(LEGACY_SAVE_KEY);
    if (legacy === null) return { profile: defaults(), notice: '' };
    const profile = migrateProfile(JSON.parse(legacy));
    return { profile, notice: saveProfile(storage, profile) };
  } catch {
    return {
      profile: defaults(),
      notice:
        'Local progress could not be restored. You can still play; saves may not survive reload.',
    };
  }
}
export function saveProfile(storage: StorageLike, p: Profile): string {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(p));
    return '';
  } catch {
    return 'Progress is available this session, but could not be saved to this browser.';
  }
}
