import { describe, expect, it } from 'vitest';
import {
  formatPhoneForDisplay,
  phoneComparisonKey,
} from '@/lib/phone/formatPhoneForDisplay';

describe('formatPhoneForDisplay', () => {
  it('formats Syrian numbers consistently regardless of stored spacing', () => {
    expect(formatPhoneForDisplay('+963996171681')).toBe('+963 996 171 681');
    expect(formatPhoneForDisplay('+963 99617 1681')).toBe('+963 996 171 681');
    expect(formatPhoneForDisplay('00963996171681')).toBe('+963 996 171 681');
  });

  it('returns dash for empty values', () => {
    expect(formatPhoneForDisplay('')).toBe('—');
    expect(formatPhoneForDisplay(null)).toBe('—');
  });
});

describe('phoneComparisonKey', () => {
  it('matches equivalent phone strings', () => {
    expect(phoneComparisonKey('+963 99617 1681')).toBe('+963996171681');
    expect(phoneComparisonKey('+963996171681')).toBe('+963996171681');
  });
});
