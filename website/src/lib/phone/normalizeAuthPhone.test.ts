import { describe, expect, it } from 'vitest';
import {
  isValidAuthPhoneIdentifier,
  normalizeAuthPhoneIdentifier,
  resolveLoginIdentifier,
} from '@/lib/phone/normalizeAuthPhone';

describe('normalizeAuthPhoneIdentifier', () => {
  it('converts 00 international prefix to E.164', () => {
    expect(normalizeAuthPhoneIdentifier('00963996171681')).toBe('+963996171681');
  });

  it('keeps valid E.164 unchanged', () => {
    expect(normalizeAuthPhoneIdentifier('+963996171681')).toBe('+963996171681');
  });

  it('adds + to country-code digits without plus', () => {
    expect(normalizeAuthPhoneIdentifier('963996171681')).toBe('+963996171681');
  });

  it('maps Syrian local 09… to +963', () => {
    expect(normalizeAuthPhoneIdentifier('0996171681')).toBe('+963996171681');
  });

  it('maps 9-digit Syrian mobile to +963', () => {
    expect(normalizeAuthPhoneIdentifier('996171681')).toBe('+963996171681');
  });

  it('strips spaces and dashes', () => {
    expect(normalizeAuthPhoneIdentifier('+963 996-171-681')).toBe(
      '+963996171681',
    );
  });
});

describe('isValidAuthPhoneIdentifier', () => {
  it('accepts normalized Syrian numbers', () => {
    expect(isValidAuthPhoneIdentifier('00963996171681')).toBe(true);
  });
});

describe('resolveLoginIdentifier', () => {
  it('returns email for email input', () => {
    expect(resolveLoginIdentifier('User@Test.com')).toEqual({
      email: 'user@test.com',
    });
  });

  it('returns normalized phone for phone input', () => {
    expect(resolveLoginIdentifier('00963996171681')).toEqual({
      phone: '+963996171681',
    });
  });
});
