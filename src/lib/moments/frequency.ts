import { MomentCategory, MomentFrequencyState, MomentPriority, MomentTemplate } from "./types";

const STORAGE_KEY = "exown_moments_freq_state";
const MAX_PROMOTIONAL_PER_DAY = 3;
const DEFAULT_MIN_GAP_HOURS = 2;
const EXTENDED_MIN_GAP_HOURS = 6;
const REPEAT_TEMPLATE_COOLDOWN_DAYS = 7;

function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getFrequencyState(): MomentFrequencyState {
  if (typeof window === "undefined") {
    return {
      lastShownAt: 0,
      todayCount: 0,
      lastDateStr: getTodayDateStr(),
      recentTemplateIds: [],
      dismissStreak: 0,
      cooldownUntil: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        lastShownAt: 0,
        todayCount: 0,
        lastDateStr: getTodayDateStr(),
        recentTemplateIds: [],
        dismissStreak: 0,
        cooldownUntil: 0,
      };
    }

    const state: MomentFrequencyState = JSON.parse(raw);
    const today = getTodayDateStr();

    // Reset daily count if date has rolled over
    if (state.lastDateStr !== today) {
      state.todayCount = 0;
      state.lastDateStr = today;
    }

    // Purge template IDs older than 7 days
    const sevenDaysAgo = Date.now() - REPEAT_TEMPLATE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    state.recentTemplateIds = (state.recentTemplateIds || []).filter(
      (item) => item.timestamp > sevenDaysAgo
    );

    return state;
  } catch {
    return {
      lastShownAt: 0,
      todayCount: 0,
      lastDateStr: getTodayDateStr(),
      recentTemplateIds: [],
      dismissStreak: 0,
      cooldownUntil: 0,
    };
  }
}

export function saveFrequencyState(state: MomentFrequencyState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore localstorage errors
  }
}

/**
 * Checks whether a moment is allowed to be displayed right now based on frequency rules.
 */
export function canShowMoment(
  _category: MomentCategory,
  priority: MomentPriority,
  isTransactional = false
): boolean {
  // Transactional and urgent moments bypass all promotional caps
  if (isTransactional || priority === "urgent") {
    return true;
  }

  const state = getFrequencyState();
  const now = Date.now();

  // Custom cooldown check
  if (state.cooldownUntil && now < state.cooldownUntil) {
    return false;
  }

  // Check daily limit
  if (state.todayCount >= MAX_PROMOTIONAL_PER_DAY) {
    return false;
  }

  // Calculate required gap: if user frequently dismisses, increase gap
  const gapHours = state.dismissStreak >= 3 ? EXTENDED_MIN_GAP_HOURS : DEFAULT_MIN_GAP_HOURS;
  const minGapMs = gapHours * 60 * 60 * 1000;

  if (now - state.lastShownAt < minGapMs) {
    return false;
  }

  return true;
}

/**
 * Selects a smart template from a list of candidates, rotating away from recently shown ones.
 */
export function selectRotatedTemplate(candidates: MomentTemplate[]): MomentTemplate | null {
  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const state = getFrequencyState();
  const recentMap = new Set(state.recentTemplateIds.map((r) => r.templateId));

  // Find candidates that haven't been shown in the last 7 days
  const unseen = candidates.filter((c) => !recentMap.has(c.id));

  const pool = unseen.length > 0 ? unseen : candidates;
  // Pick randomly from the pool to avoid predictable patterns
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

/**
 * Record that a moment was shown.
 */
export function recordMomentShown(templateId: string, isTransactional = false): void {
  const state = getFrequencyState();
  const now = Date.now();

  state.lastShownAt = now;
  if (!isTransactional) {
    state.todayCount += 1;
  }

  // Track template id with timestamp
  state.recentTemplateIds.push({ templateId, timestamp: now });
  saveFrequencyState(state);
}

/**
 * Record that a moment was clicked / engaged with.
 */
export function recordMomentClicked(_templateId: string): void {
  const state = getFrequencyState();
  // Successful engagement resets the dismiss streak!
  state.dismissStreak = 0;
  saveFrequencyState(state);
}

/**
 * Record that a moment was dismissed manually without action.
 */
export function recordMomentDismissed(_templateId: string): void {
  const state = getFrequencyState();
  state.dismissStreak = (state.dismissStreak || 0) + 1;

  // If user dismissed 4+ in a row, grant a 12-hour peace-and-quiet cooldown
  if (state.dismissStreak >= 4) {
    state.cooldownUntil = Date.now() + 12 * 60 * 60 * 1000;
  }

  saveFrequencyState(state);
}
