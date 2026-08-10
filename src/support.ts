// The one place the app asks for anything. It gets three moments in the life of
// a browser and no more: the schedule below is the whole mechanism, and it lives
// here rather than in the page so `npm test` can hold it to it.

/**
 * Filing runs on which the note is shown. Absolute positions, not a period: a
 * counter that restarted after each showing would turn three appearances into
 * one every five weeks, for ever.
 *
 * At about one filing a week that is roughly a month, four months and ten
 * months in — once a term, then silence.
 */
export const SUPPORT_MILESTONES: readonly number[] = [5, 15, 40];

export interface SupportState {
  /** Filing runs that copied at least one photo and lost none. */
  readonly runs: number;
  /** She closed the note: it is over, whatever the count says. */
  readonly dismissed: boolean;
}

const FRESH: SupportState = { runs: 0, dismissed: false };

/**
 * Never throws. The stored value is data the teacher's browser owns and we do
 * not: a truncated write or a key from another version must read as "not yet",
 * because this runs while the filing page is loading.
 */
export function parseSupportState(raw: string | null): SupportState {
  if (raw === null) return FRESH;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return FRESH;
  }
  if (typeof parsed !== 'object' || parsed === null) return FRESH;

  const { runs, dismissed } = parsed as Partial<SupportState>;
  return {
    runs: typeof runs === 'number' && Number.isInteger(runs) && runs >= 0 ? runs : 0,
    dismissed: dismissed === true,
  };
}

export function serializeSupportState(state: SupportState): string {
  return JSON.stringify(state);
}

export function countFiling(state: SupportState): SupportState {
  return { ...state, runs: state.runs + 1 };
}

export function dismissSupport(state: SupportState): SupportState {
  return { ...state, dismissed: true };
}

export function shouldOfferSupport(state: SupportState): boolean {
  return !state.dismissed && SUPPORT_MILESTONES.includes(state.runs);
}
