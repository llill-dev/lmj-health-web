import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api';
import {
  getBillingPaymentErrorToast,
  getBillingRefundErrorToast,
} from '@/lib/doctor/billing/errors';

describe('getBillingPaymentErrorToast', () => {
  it('maps invoiceNotPayable to a clear Arabic message', () => {
    const toast = getBillingPaymentErrorToast(
      new ApiError(
        409,
        'errors.billing.invoiceNotPayable',
        {},
        'يمكن إضافة الدفعات فقط إلى الفواتير المصدرة أو الجزئية أو المتأخرة.',
      ),
    );

    expect(toast.title).toBe('لا يمكن إضافة دفعة');
    expect(toast.message).toContain('مسدّدة');
  });

  it('maps futureDateNotAllowed when message is the raw messageKey', () => {
    const toast = getBillingPaymentErrorToast(
      new ApiError(
        422,
        'errors.validationFailed',
        {},
        'errors.validation.futureDateNotAllowed',
      ),
    );

    expect(toast.title).toBe('تاريخ غير صالح');
    expect(toast.message).toContain('المستقبل');
    expect(toast.message).not.toContain('errors.');
  });

  it('replaces generic unknown server errors', () => {
    const toast = getBillingPaymentErrorToast(
      new ApiError(500, 'errors.unknown', {}, 'حدث خطأ غير متوقع.'),
    );

    expect(toast.message).not.toBe('حدث خطأ غير متوقع.');
    expect(toast.message).toContain('الخادم');
  });
});

describe('getBillingRefundErrorToast', () => {
  it('maps futureDateNotAllowed from validation response', () => {
    const toast = getBillingRefundErrorToast(
      new ApiError(
        422,
        'errors.validationFailed',
        {},
        'errors.validation.futureDateNotAllowed',
      ),
    );

    expect(toast.title).toBe('تاريخ غير صالح');
    expect(toast.message).toContain('المستقبل');
    expect(toast.message).not.toContain('errors.validation');
  });
});
