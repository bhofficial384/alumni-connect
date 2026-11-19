import { DEFAULT_CONFIG } from './defaultData';

const CONFIG_KEY = 'saurabh_anju_love_story_config_v5';
const PROGRESS_KEY = 'saurabh_anju_love_story_progress_v2';

export const INITIAL_PROGRESS = {
  hasOpenedGift: false,
  viewedTimeline: [],
  unlockedReasons: [],
  openedEnvelopes: [],
  candlesBlown: false,
  revealedStars: [],
  finalSecretUnlocked: false,
  easterEggFound: false,
  userWish: '',
};

export function getStoredConfig() {
  try {
    // Clear out legacy cache versions
    try {
      localStorage.removeItem('saurabh_anju_love_story_config_v1');
      localStorage.removeItem('saurabh_anju_love_story_config_v2');
      localStorage.removeItem('saurabh_anju_love_story_config_v3');
      localStorage.removeItem('saurabh_anju_love_story_config_v4');
    } catch (_) {}

    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);

    // If cached config has old paths, fewer than 13 polaroids, or unsplash, upgrade to latest DEFAULT_CONFIG photos
    const needsPhotoUpgrade =
      !parsed.polaroids ||
      parsed.polaroids.length < DEFAULT_CONFIG.polaroids.length ||
      parsed.timeline?.some((t) => !t.image || t.image.includes('unsplash') || t.image.startsWith('/photos/')) ||
      parsed.polaroids?.some((p) => !p.image || p.image.includes('unsplash') || p.image.startsWith('/photos/'));

    if (needsPhotoUpgrade) {
      const upgraded = {
        ...DEFAULT_CONFIG,
        ...parsed,
        timeline: DEFAULT_CONFIG.timeline,
        polaroids: DEFAULT_CONFIG.polaroids,
      };
      saveStoredConfig(upgraded);
      return upgraded;
    }

    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (e) {
    console.error('Failed reading stored config:', e);
    return DEFAULT_CONFIG;
  }
}

export function saveStoredConfig(newConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  } catch (e) {
    console.error('Failed saving config:', e);
  }
}

export function getStoredProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return { ...INITIAL_PROGRESS };
    }
    const parsed = JSON.parse(raw);
    return { ...INITIAL_PROGRESS, ...parsed };
  } catch (e) {
    return { ...INITIAL_PROGRESS };
  }
}

export function saveStoredProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed saving progress:', e);
  }
}

export function resetStoredProgressOnly() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(INITIAL_PROGRESS));
    // Clear legacy keys too
    localStorage.removeItem('birthday_universe_progress_v1');
    localStorage.removeItem('saurabh_anju_love_story_progress_v1');
  } catch (e) {
    console.error('Failed resetting progress:', e);
  }
  return { ...INITIAL_PROGRESS };
}

export function resetStoredData() {
  try {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem('birthday_universe_progress_v1');
    localStorage.removeItem('saurabh_anju_love_story_progress_v1');
  } catch (e) {
    console.error('Failed resetting data:', e);
  }
  window.location.reload();
}
