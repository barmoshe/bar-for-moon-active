/**
 * prefs.ts — tiny, guarded localStorage for the sound preference only. Sound is OFF by default
 * (autoplay etiquette, guardrail §11); the toggle persists the user's choice. Reduced-motion is
 * NOT stored here — it comes from the embed prop / OS via the context. Everything is wrapped so a
 * privacy-mode / no-storage host never throws.
 */

const KEY = 'shipit.sound';

export function loadSoundPref(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

export function saveSoundPref(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* no-op: storage unavailable */
  }
}
