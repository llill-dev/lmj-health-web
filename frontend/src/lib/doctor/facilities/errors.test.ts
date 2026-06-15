import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api';
import { getDoctorFacilitySaveErrorToast } from '@/lib/doctor/facilities/errors';

describe('getDoctorFacilitySaveErrorToast', () => {
  it('maps ownerFacilityExists to a specific toast', () => {
    const toast = getDoctorFacilitySaveErrorToast(
      new ApiError(
        409,
        'errors.facilities.ownerFacilityExists',
        {},
        'conflict',
      ),
    );
    expect(toast.title).toBe('منشأة موجودة');
    expect(toast.message).toContain('منشأة واحدة');
  });

  it('replaces generic 500 unknown with facility server message', () => {
    const toast = getDoctorFacilitySaveErrorToast(
      new ApiError(500, 'errors.unknown', {}, 'حدث خطأ غير متوقع.'),
      'create',
    );
    expect(toast.title).toBe('تعذّر إنشاء المنشأة');
    expect(toast.message).toContain('500');
    expect(toast.message).not.toBe('حدث خطأ غير متوقع.');
  });

  it('formats validation errors from API body', () => {
    const toast = getDoctorFacilitySaveErrorToast(
      new ApiError(
        422,
        'errors.validationFailed',
        {
          errors: [
            { path: 'phone', msg: 'Invalid phone', location: 'body' },
            { path: 'city', msg: 'City is required', location: 'body' },
          ],
        },
        'Validation failed',
      ),
    );
    expect(toast.title).toBe('بيانات المنشأة غير مقبولة');
    expect(toast.message).toContain('الهاتف');
    expect(toast.message).toContain('المدينة');
  });
});
