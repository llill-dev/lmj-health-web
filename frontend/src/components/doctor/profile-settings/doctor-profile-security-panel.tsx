'use client';

import { useState } from 'react';
import { KeyRound, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import VerifyAccount from '@/components/auth/verify/verify-account';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import DoctorSecurityFormDialog from '@/components/doctor/profile-settings/doctor-security-form-dialog';
import {
  doctorEmailChangeRequestSchema,
  doctorPasswordChangeSchema,
  doctorPhoneChangeRequestSchema,
  type DoctorEmailChangeRequestForm,
  type DoctorPasswordChangeForm,
  type DoctorPhoneChangeRequestForm,
} from '@/components/doctor/profile-settings/doctor-profile-security-schemas';
import { useToast } from '@/components/ui/ToastProvider';
import { resolveDeleteAccountPath } from '@/lib/auth/accountDeletionSession';
import { doctorSettingsApi } from '@/lib/doctor/settingsClient';
import { readAuthUser } from '@/lib/cookies';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api';
import { useI18n } from '@/i18n/provider';

type PendingSecurityAction =
  | { kind: 'password'; values: DoctorPasswordChangeForm }
  | { kind: 'email'; values: DoctorEmailChangeRequestForm }
  | { kind: 'phone'; values: DoctorPhoneChangeRequestForm };

async function forceReLogin(navigate: ReturnType<typeof useNavigate>) {
  await useAuthStore.getState().logout({ skipRemoteRevoke: true });
  navigate('/login', { replace: true });
}

export default function DoctorProfileSecurityPanel() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<'closed' | 'request' | 'verify'>(
    'closed',
  );
  const [phoneStep, setPhoneStep] = useState<'closed' | 'request' | 'verify'>(
    'closed',
  );
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingAction, setPendingAction] =
    useState<PendingSecurityAction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const passwordForm = useForm<DoctorPasswordChangeForm>({
    resolver: zodResolver(doctorPasswordChangeSchema),
    mode: 'onTouched',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const emailForm = useForm<DoctorEmailChangeRequestForm>({
    resolver: zodResolver(doctorEmailChangeRequestSchema),
    mode: 'onTouched',
    defaultValues: { currentPassword: '', newEmail: '' },
  });

  const phoneForm = useForm<DoctorPhoneChangeRequestForm>({
    resolver: zodResolver(doctorPhoneChangeRequestSchema),
    mode: 'onTouched',
    defaultValues: { currentPassword: '', newPhone: '' },
  });

  const handleApiError = (error: unknown, title: string) => {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : tr('تعذّر إكمال العملية.', 'Could not complete the action.');
    toast(message, { title, variant: 'error', durationMs: 5200 });
  };

  const openConfirm = (action: PendingSecurityAction) => {
    setPendingAction(action);
    if (action.kind === 'password') setPasswordOpen(false);
    if (action.kind === 'email') setEmailStep('closed');
    if (action.kind === 'phone') setPhoneStep('closed');
    setConfirmOpen(true);
  };

  const confirmCopy = (() => {
    if (!pendingAction) return null;
    if (pendingAction.kind === 'password') {
      return {
        title: tr('تأكيد تغيير كلمة المرور', 'Confirm password change'),
        description: (
          <>
            {tr(
              'سيتم تحديث كلمة المرور وإنهاء جميع الجلسات النشطة. ستحتاج لتسجيل الدخول مجدداً بعد الحفظ.',
              'Your password will be updated and all active sessions ended. You will need to sign in again after saving.',
            )}
          </>
        ),
        confirmLabel: tr('تأكيد التغيير', 'Confirm change'),
      };
    }
    if (pendingAction.kind === 'email') {
      return {
        title: tr('تأكيد طلب تغيير البريد', 'Confirm email change request'),
        description: (
          <>
            {tr('سنرسل رمز تحقق إلى', 'We will send a verification code to')}{' '}
            <span className="font-extrabold text-[#101828]">
              {pendingAction.values.newEmail.trim()}
            </span>
            .{' '}
            {tr(
              'تأكد من صحة البريد قبل المتابعة.',
              'Make sure the email is correct before continuing.',
            )}
          </>
        ),
        confirmLabel: tr('إرسال رمز التحقق', 'Send verification code'),
      };
    }
    return {
      title: tr('تأكيد طلب تغيير الهاتف', 'Confirm phone change request'),
      description: (
        <>
          {tr('سنرسل رمز تحقق إلى', 'We will send a verification code to')}{' '}
          <span className="font-extrabold text-[#101828]">
            {pendingAction.values.newPhone.replace(/[\s-]/g, '')}
          </span>
          .{' '}
          {tr(
            'تأكد من صحة الرقم قبل المتابعة.',
            'Make sure the number is correct before continuing.',
          )}
        </>
      ),
      confirmLabel: tr('إرسال رمز التحقق', 'Send verification code'),
    };
  })();

  const executePendingAction = async () => {
    if (!pendingAction) return;
    setConfirmBusy(true);
    try {
      if (pendingAction.kind === 'password') {
        await doctorSettingsApi.changePassword({
          currentPassword: pendingAction.values.currentPassword,
          newPassword: pendingAction.values.newPassword,
        });
        toast(
          tr(
            'تم تحديث كلمة المرور. سجّل الدخول مجدداً.',
            'Password updated. Please sign in again.',
          ),
          {
            title: tr('تم التحديث', 'Updated'),
            variant: 'success',
          },
        );
        setConfirmOpen(false);
        setPendingAction(null);
        passwordForm.reset();
        await forceReLogin(navigate);
        return;
      }

      if (pendingAction.kind === 'email') {
        await doctorSettingsApi.requestEmailChange(pendingAction.values);
        setPendingEmail(pendingAction.values.newEmail.trim());
        setEmailStep('verify');
        toast(
          tr(
            'تم إرسال رمز التحقق إلى البريد الجديد.',
            'A verification code was sent to the new email.',
          ),
          {
            title: tr('تحقّق من بريدك', 'Check your email'),
            variant: 'success',
          },
        );
        setConfirmOpen(false);
        setPendingAction(null);
        return;
      }

      const phone = pendingAction.values.newPhone.replace(/[\s-]/g, '');
      await doctorSettingsApi.requestPhoneChange({
        currentPassword: pendingAction.values.currentPassword,
        newPhone: phone,
      });
      setPendingPhone(phone);
      setPhoneStep('verify');
      toast(
        tr(
          'تم إرسال رمز التحقق إلى الهاتف الجديد.',
          'A verification code was sent to the new phone.',
        ),
        {
          title: tr('تحقّق من واتساب', 'Check WhatsApp'),
          variant: 'success',
        },
      );
      setConfirmOpen(false);
      setPendingAction(null);
    } catch (error) {
      if (pendingAction.kind === 'password') {
        handleApiError(
          error,
          tr('تعذّر تغيير كلمة المرور', 'Could not change password'),
        );
      } else if (pendingAction.kind === 'email') {
        handleApiError(
          error,
          tr('تعذّر طلب تغيير البريد', 'Could not request email change'),
        );
      } else {
        handleApiError(
          error,
          tr('تعذّر طلب تغيير الهاتف', 'Could not request phone change'),
        );
      }
      throw error;
    } finally {
      setConfirmBusy(false);
    }
  };

  if (emailStep === 'verify') {
    return (
      <VerifyAccount
        destination={pendingEmail}
        onBack={() => setEmailStep('request')}
        onResend={async () => {
          const values = emailForm.getValues();
          await doctorSettingsApi.requestEmailChange(values);
          toast(tr('أُعيد إرسال رمز التحقق.', 'Verification code resent.'), {
            title: tr('تم الإرسال', 'Sent'),
            variant: 'success',
          });
        }}
        onVerify={async (otp) => {
          await doctorSettingsApi.confirmEmailChange({ otp });
          toast(
            tr(
              'تم تحديث البريد. سجّل الدخول مجدداً.',
              'Email updated. Please sign in again.',
            ),
            {
              title: tr('تم التحديث', 'Updated'),
              variant: 'success',
            },
          );
          setEmailStep('closed');
          await forceReLogin(navigate);
        }}
      />
    );
  }

  if (phoneStep === 'verify') {
    return (
      <VerifyAccount
        destination={pendingPhone}
        onBack={() => setPhoneStep('request')}
        onResend={async () => {
          const values = phoneForm.getValues();
          const phone = values.newPhone.replace(/[\s-]/g, '');
          await doctorSettingsApi.requestPhoneChange({
            currentPassword: values.currentPassword,
            newPhone: phone,
          });
          toast(tr('أُعيد إرسال رمز التحقق.', 'Verification code resent.'), {
            title: tr('تم الإرسال', 'Sent'),
            variant: 'success',
          });
        }}
        onVerify={async (otp) => {
          await doctorSettingsApi.confirmPhoneChange({ otp });
          toast(
            tr(
              'تم تحديث الهاتف. سجّل الدخول مجدداً.',
              'Phone updated. Please sign in again.',
            ),
            {
              title: tr('تم التحديث', 'Updated'),
              variant: 'success',
            },
          );
          setPhoneStep('closed');
          await forceReLogin(navigate);
        }}
      />
    );
  }

  return (
    <>
      <section
        dir={dir}
        lang={locale}
        className="mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]"
      >
        <div className="border-b border-[#EEF2F6] px-6 py-4">
          <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
            {tr('أمان الحساب', 'Account security')}
          </div>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
            {tr(
              'تغيير كلمة المرور أو البريد أو الهاتف يلغي جميع الجلسات النشطة.',
              'Changing password, email, or phone ends all active sessions.',
            )}
          </p>
        </div>
        <div className="divide-y divide-[#EEF2F6]">
          {[
            {
              key: 'password',
              label: tr('تغيير كلمة المرور', 'Change password'),
              icon: KeyRound,
              onClick: () => setPasswordOpen(true),
            },
            {
              key: 'email',
              label: tr('تغيير البريد الإلكتروني', 'Change email'),
              icon: Mail,
              onClick: () => setEmailStep('request'),
            },
            {
              key: 'phone',
              label: tr('تغيير رقم الهاتف', 'Change phone number'),
              icon: Phone,
              onClick: () => setPhoneStep('request'),
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center justify-between px-6 py-4 text-start transition hover:bg-[#F9FAFB]"
            >
              <span className="flex items-center gap-3 font-cairo text-[13px] font-bold text-[#111827]">
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </span>
              <span className="font-cairo text-[13px] font-extrabold text-primary">
                {tr('تعديل', 'Edit')}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        dir={dir}
        lang={locale}
        className="mt-5 overflow-hidden rounded-[6px] border border-[#FECACA] bg-[#FFFBFB] shadow-[0_18px_30px_rgba(0,0,0,0.06)]"
      >
        <div className="border-b border-[#FECACA] px-6 py-4">
          <div className="font-cairo text-[14px] font-extrabold text-[#B91C1C]">
            {tr('منطقة الخطر', 'Danger zone')}
          </div>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
            {tr(
              'حذف الحساب يضع حسابك في حالة «بانتظار الحذف» لمدة 7 أيام مع إمكانية الاسترجاع.',
              'Deleting your account places it in a pending-deletion state for 7 days with recovery available.',
            )}
          </p>
        </div>
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#FCA5A5] bg-white font-cairo text-[13px] font-extrabold text-[#DC2626] transition hover:bg-[#FEF2F2]"
          >
            {tr('حذف الحساب', 'Delete account')}
          </button>
        </div>
      </section>

      <ConfirmActionDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={tr('تأكيد بدء حذف الحساب', 'Confirm account deletion')}
        description={
          <>
            {tr(
              'أنت على وشك بدء عملية حذف الحساب. سيتم إرشادك عبر خطوات التحقق (كلمة المرور، السبب، رمز OTP). يمكنك استعادة حسابك خلال',
              'You are about to start account deletion. You will be guided through verification steps (password, reason, OTP). You can recover your account within',
            )}{' '}
            <span className="font-extrabold text-[#101828]">
              {tr('7 أيام', '7 days')}
            </span>{' '}
            {tr('قبل الحذف النهائي.', 'before permanent deletion.')}
          </>
        }
        confirmLabel={tr('متابعة إلى حذف الحساب', 'Continue to delete account')}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          navigate(resolveDeleteAccountPath(readAuthUser()?.role));
        }}
      />

      <DoctorSecurityFormDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        title={tr('تغيير كلمة المرور', 'Change password')}
        description={tr(
          'أدخل كلمة المرور الحالية والجديدة. بعد التأكيد ستُنهى جلستك الحالية.',
          'Enter your current and new password. After confirmation your current session will end.',
        )}
        icon={KeyRound}
        form={passwordForm}
        fields={[
          {
            name: 'currentPassword',
            label: tr('كلمة المرور الحالية', 'Current password'),
            placeholder: tr(
              'أدخل كلمة المرور الحالية',
              'Enter current password',
            ),
            type: 'password',
            autoComplete: 'current-password',
          },
          {
            name: 'newPassword',
            label: tr('كلمة المرور الجديدة', 'New password'),
            placeholder: tr('6 أحرف على الأقل', 'At least 6 characters'),
            type: 'password',
            autoComplete: 'new-password',
            hint: tr(
              'يفضّل استخدام مزيج من أحرف وأرقام.',
              'Prefer a mix of letters and numbers.',
            ),
          },
          {
            name: 'confirmPassword',
            label: tr('تأكيد كلمة المرور', 'Confirm password'),
            placeholder: tr(
              'أعد إدخال كلمة المرور الجديدة',
              'Re-enter the new password',
            ),
            type: 'password',
            autoComplete: 'new-password',
          },
        ]}
        submitLabel={tr('متابعة للتأكيد', 'Continue to confirm')}
        onValidatedSubmit={(values) =>
          openConfirm({ kind: 'password', values })
        }
      />

      <DoctorSecurityFormDialog
        open={emailStep === 'request'}
        onOpenChange={(next) => setEmailStep(next ? 'request' : 'closed')}
        title={tr('تغيير البريد الإلكتروني', 'Change email')}
        description={tr(
          'أدخل كلمة المرور الحالية والبريد الجديد. سنرسل رمز تحقق بعد التأكيد.',
          'Enter your current password and new email. We will send a verification code after confirmation.',
        )}
        icon={Mail}
        form={emailForm}
        fields={[
          {
            name: 'currentPassword',
            label: tr('كلمة المرور الحالية', 'Current password'),
            placeholder: tr(
              'أدخل كلمة المرور الحالية',
              'Enter current password',
            ),
            type: 'password',
            autoComplete: 'current-password',
          },
          {
            name: 'newEmail',
            label: tr('البريد الإلكتروني الجديد', 'New email'),
            placeholder: 'example@mail.com',
            type: 'email',
            autoComplete: 'email',
          },
        ]}
        submitLabel={tr('متابعة للتأكيد', 'Continue to confirm')}
        onValidatedSubmit={(values) => openConfirm({ kind: 'email', values })}
      />

      <DoctorSecurityFormDialog
        open={phoneStep === 'request'}
        onOpenChange={(next) => setPhoneStep(next ? 'request' : 'closed')}
        title={tr('تغيير رقم الهاتف', 'Change phone number')}
        description={tr(
          'أدخل كلمة المرور الحالية ورقم الهاتف الجديد مع رمز الدولة.',
          'Enter your current password and new phone number with country code.',
        )}
        icon={Phone}
        form={phoneForm}
        fields={[
          {
            name: 'currentPassword',
            label: tr('كلمة المرور الحالية', 'Current password'),
            placeholder: tr(
              'أدخل كلمة المرور الحالية',
              'Enter current password',
            ),
            type: 'password',
            autoComplete: 'current-password',
          },
          {
            name: 'newPhone',
            label: tr('رقم الهاتف الجديد', 'New phone number'),
            placeholder: '+9639XXXXXXXX',
            type: 'tel',
            autoComplete: 'tel',
            hint: tr(
              'أدخل الرقم بصيغة دولية مع رمز الدولة.',
              'Enter the number in international format with country code.',
            ),
          },
        ]}
        submitLabel={tr('متابعة للتأكيد', 'Continue to confirm')}
        onValidatedSubmit={(values) => openConfirm({ kind: 'phone', values })}
      />

      {confirmCopy ? (
        <ConfirmActionDialog
          open={confirmOpen}
          onOpenChange={(next) => {
            setConfirmOpen(next);
            if (!next) setPendingAction(null);
          }}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={
            confirmBusy
              ? tr('جاري التنفيذ…', 'Working…')
              : confirmCopy.confirmLabel
          }
          confirmDisabled={confirmBusy}
          onConfirm={executePendingAction}
        />
      ) : null}
    </>
  );
}
