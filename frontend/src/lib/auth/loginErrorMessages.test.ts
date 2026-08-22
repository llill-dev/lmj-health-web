import { describe, expect, it } from 'vitest';
import { resolveLoginErrorMessageAr } from '@/lib/auth/loginErrorMessages';

describe('resolveLoginErrorMessageAr', () => {
  it('uses phone-specific copy for NOT_VERIFIED', () => {
    const phone = resolveLoginErrorMessageAr('NOT_VERIFIED', 'phone');
    const email = resolveLoginErrorMessageAr('NOT_VERIFIED', 'email');

    expect(phone).toContain('هذا الرقم');
    expect(phone).not.toContain('بريدك الإلكتروني');
    expect(email).toContain('بريدك الإلكتروني');
  });

  it('uses phone-specific copy for INVALID_CREDENTIALS', () => {
    expect(resolveLoginErrorMessageAr('INVALID_CREDENTIALS', 'phone')).toContain(
      'رقم الهاتف',
    );
    expect(resolveLoginErrorMessageAr('INVALID_CREDENTIALS', 'email')).toContain(
      'البريد الإلكتروني',
    );
  });
});
