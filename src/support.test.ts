import { describe, expect, it } from 'vitest';
import {
  countFiling,
  dismissSupport,
  parseSupportState,
  serializeSupportState,
  shouldOfferSupport,
  SUPPORT_MILESTONES,
} from './support';

const state = (runs: number, dismissed = false) => ({ runs, dismissed });

describe('shouldOfferSupport', () => {
  it('keeps the first four filings to itself', () => {
    for (let runs = 0; runs < 5; runs++) expect(shouldOfferSupport(state(runs))).toBe(false);
  });

  it('offers on the fifth, the fifteenth and the fortieth filing', () => {
    expect(SUPPORT_MILESTONES).toEqual([5, 15, 40]);
    for (const runs of SUPPORT_MILESTONES) expect(shouldOfferSupport(state(runs))).toBe(true);
  });

  // 20, 25, 30 and 35 are the runs a "once every five" reading would catch. The
  // schedule thins out on purpose, so this is where a slide back to a period
  // shows up, and 41 onwards is where "three times, then silence" is decided.
  it('stays quiet between the three moments, and for good after the last', () => {
    for (let runs = 0; runs <= 60; runs++) {
      if (SUPPORT_MILESTONES.includes(runs)) continue;
      expect(shouldOfferSupport(state(runs)), `run ${runs}`).toBe(false);
    }
  });

  it('never offers once she has closed it', () => {
    for (const runs of SUPPORT_MILESTONES) {
      expect(shouldOfferSupport(state(runs, true))).toBe(false);
    }
  });
});

describe('countFiling', () => {
  it('counts up, and only up', () => {
    expect(countFiling(state(4)).runs).toBe(5);
    expect(countFiling(state(5)).runs).toBe(6);
    expect(countFiling(state(40)).runs).toBe(41);
  });

  it('carries a dismissal through a filing', () => {
    expect(countFiling(state(4, true))).toEqual(state(5, true));
  });
});

describe('dismissSupport', () => {
  it('ends it without losing the count', () => {
    expect(dismissSupport(state(5))).toEqual(state(5, true));
  });
});

describe('parseSupportState', () => {
  it('reads back what it wrote', () => {
    const kept = state(15, true);
    expect(parseSupportState(serializeSupportState(kept))).toEqual(kept);
  });

  it('starts fresh in a browser that has never filed', () => {
    expect(parseSupportState(null)).toEqual(state(0));
  });

  // A key edited by hand, truncated, or written by some other version must read
  // as "not yet". Throwing here would take the whole page down on load.
  it('starts fresh rather than throwing on a damaged key', () => {
    expect(parseSupportState('{"runs":')).toEqual(state(0));
    expect(parseSupportState('null')).toEqual(state(0));
    expect(parseSupportState('42')).toEqual(state(0));
    expect(parseSupportState('[]')).toEqual(state(0));
    expect(parseSupportState('{"runs":"cinq"}')).toEqual(state(0));
    expect(parseSupportState('{"runs":-3}')).toEqual(state(0));
    expect(parseSupportState('{"runs":2.5}')).toEqual(state(0));
    expect(parseSupportState('{"runs":5,"dismissed":"oui"}')).toEqual(state(5));
  });
});
