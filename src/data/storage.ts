import { FighterProfile } from './fighter';

const STORAGE_KEY = 'boxing_game_fighter_profile';

export function loadFighter(): FighterProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FighterProfile;
    if (!parsed || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveFighter(fighter: FighterProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fighter));
  } catch {
    // Storage unavailable (private mode / quota). Fail silently.
  }
}

export function clearFighter(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
