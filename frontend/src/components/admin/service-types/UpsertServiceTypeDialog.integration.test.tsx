import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UpsertServiceTypeDialog from '@/components/admin/service-types/UpsertServiceTypeDialog';
import { SERVICES_KEYS } from '@/hooks/admin/services/useAdminServices';
import {
  getLastCreateServiceTypePayload,
  mockCreateServiceTypeFailure,
  mockCreateServiceTypeSuccess,
} from '@/test/handlers/serviceTypes';
import { renderWithProviders } from '@/test/renderWithProviders';

function ServiceTypeDialogHarness({
  onSuccess = vi.fn(),
}: {
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        فتح إضافة نوع خدمة
      </button>
      <UpsertServiceTypeDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}

async function openDialog() {
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: 'فتح إضافة نوع خدمة' }));

  return { user };
}

async function fillValidServiceTypeForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('الاسم (عربي)'), 'مختبرات');
  await user.type(screen.getByLabelText('الاسم (English)'), 'Laboratory');
  await user.type(screen.getByLabelText('Slug'), 'laboratory');
  await user.type(screen.getByLabelText('وصف (عربي)'), 'خدمات المختبرات الطبية');
  await user.type(screen.getByLabelText('وصف (English)'), 'Laboratory services');
}

describe('UpsertServiceTypeDialog integration', () => {
  it('opens from a trigger and exposes the correct dialog title', async () => {
    renderWithProviders(<ServiceTypeDialogHarness />);

    await openDialog();

    expect(
      screen.getByRole('dialog', { name: 'إضافة نوع خدمة' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'إضافة نوع خدمة' }),
    ).toBeInTheDocument();
  });

  it('closes on cancel without submitting', async () => {
    renderWithProviders(<ServiceTypeDialogHarness />);

    const { user } = await openDialog();

    await user.click(screen.getByRole('button', { name: 'إلغاء' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'إضافة نوع خدمة' }),
      ).not.toBeInTheDocument();
    });
    expect(getLastCreateServiceTypePayload()).toBeNull();
  });

  it('shows required-field validation errors and prevents submission', async () => {
    renderWithProviders(<ServiceTypeDialogHarness />);

    const { user } = await openDialog();

    await user.click(screen.getByRole('button', { name: 'إنشاء' }));

    expect((await screen.findAllByRole('alert')).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('مطلوب').length).toBeGreaterThanOrEqual(3);
    expect(getLastCreateServiceTypePayload()).toBeNull();
  });

  it('rejects invalid script and slug input before calling the API', async () => {
    renderWithProviders(<ServiceTypeDialogHarness />);

    const { user } = await openDialog();

    await user.type(screen.getByLabelText('الاسم (عربي)'), 'Laboratory');
    await user.type(screen.getByLabelText('الاسم (English)'), 'مختبرات');
    await user.type(screen.getByLabelText('Slug'), 'Bad Slug');
    await user.click(screen.getByRole('button', { name: 'إنشاء' }));

    expect(
      await screen.findByText(
        'يجب أن يكون النص بالعربية فقط: لا تُدخل حروفًا لاتينية (إنجليزية) في الحقول العربية.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'يجب أن يكون النص بالإنجليزية فقط: لا تُدخل حروفًا عربية في الحقول الإنجليزية.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'المعرّف يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط',
      ),
    ).toBeInTheDocument();
    expect(getLastCreateServiceTypePayload()).toBeNull();
  });

  it('submits the expected payload, invalidates service type queries, shows success feedback, and closes', async () => {
    const onSuccess = vi.fn();
    const { queryClient } = renderWithProviders(
      <ServiceTypeDialogHarness onSuccess={onSuccess} />,
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { user } = await openDialog();

    await fillValidServiceTypeForm(user);
    await user.click(screen.getByRole('button', { name: 'إنشاء' }));

    await waitFor(() => {
      expect(getLastCreateServiceTypePayload()).toEqual({
        name: { en: 'Laboratory', ar: 'مختبرات' },
        slug: 'laboratory',
        description: {
          en: 'Laboratory services',
          ar: 'خدمات المختبرات الطبية',
        },
        fields: [
          {
            key: 'name',
            label: { en: 'Name', ar: 'الاسم' },
            type: 'string',
            required: true,
            isPublic: true,
          },
        ],
      });
    });

    expect(
      await screen.findByText(
        'أُضيف نوع الخدمة «مختبرات» إلى النظام. راجع حالة التفعيل عند الحاجة.',
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'إضافة نوع خدمة' }),
      ).not.toBeInTheDocument();
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: SERVICES_KEYS.serviceTypes(),
    });
  });

  it('disables submit and shows the loading label while the mutation is pending', async () => {
    mockCreateServiceTypeSuccess({ delayMs: 150 });

    renderWithProviders(<ServiceTypeDialogHarness />);

    const { user } = await openDialog();

    await fillValidServiceTypeForm(user);
    await user.click(screen.getByRole('button', { name: 'إنشاء' }));

    expect(
      screen.getByRole('button', { name: 'جاري الحفظ…' }),
    ).toBeDisabled();
    expect(await screen.findByText(/أُضيف نوع الخدمة/)).toBeInTheDocument();
  });

  it('shows server validation feedback, keeps the dialog usable, and preserves entered values after failure', async () => {
    mockCreateServiceTypeFailure(422, {
      messageKey: 'errors.validationFailed',
      message: 'فشل التحقق من البيانات',
      errors: [
        {
          field: 'slug',
          message: 'هذا الـ slug مستخدم مسبقاً',
        },
      ],
    });

    renderWithProviders(<ServiceTypeDialogHarness />);

    const { user } = await openDialog();

    await fillValidServiceTypeForm(user);
    await user.click(screen.getByRole('button', { name: 'إنشاء' }));

    expect(await screen.findByText('هذا الـ slug مستخدم مسبقاً')).toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: 'إضافة نوع خدمة' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('الاسم (عربي)')).toHaveValue('مختبرات');
    expect(screen.getByLabelText('الاسم (English)')).toHaveValue('Laboratory');
    expect(screen.getByLabelText('Slug')).toHaveValue('laboratory');

    await user.clear(screen.getByLabelText('Slug'));
    await user.type(screen.getByLabelText('Slug'), 'laboratory-new');

    expect(screen.getByLabelText('Slug')).toHaveValue('laboratory-new');
  });
});
