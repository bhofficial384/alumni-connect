import { DEFAULT_CONFIG } from './defaultData';

const CONFIG_KEY = 'saurabh_anju_love_story_config_v10';
const PROGRESS_KEY = 'saurabh_anju_love_story_progress_v3';

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
      for (let i = 1; i <= 9; i++) {
        localStorage.removeItem(`saurabh_anju_love_story_config_v${i}`);
      }
    } catch (_) {}

    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);

    // Smart merge: Preserve any saved/uploaded photo (data:) while keeping fresh default assets
    const mergedTimeline = DEFAULT_CONFIG.timeline.map((defItem, idx) => {
      const savedItem = parsed.timeline?.[idx] || parsed.timeline?.find((t) => t.id === defItem.id);
      if (savedItem && savedItem.image && savedItem.image.startsWith('data:')) {
        return { ...defItem, ...savedItem };
      }
      return defItem;
    });

    const mergedPolaroids = DEFAULT_CONFIG.polaroids.map((defPol, idx) => {
      const savedPol = parsed.polaroids?.[idx] || parsed.polaroids?.find((p) => p.id === defPol.id);
      if (savedPol && savedPol.image && savedPol.image.startsWith('data:')) {
        return { ...defPol, ...savedPol };
      }
      return defPol;
    });

    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      timeline: mergedTimeline,
      polaroids: mergedPolaroids,
    };
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
