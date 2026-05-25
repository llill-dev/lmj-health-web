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
import { doctorSettingsApi } from '@/lib/doctor/settingsClient';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api';

type PendingSecurityAction =
  | { kind: 'password'; values: DoctorPasswordChangeForm }
  | { kind: 'email'; values: DoctorEmailChangeRequestForm }
  | { kind: 'phone'; values: DoctorPhoneChangeRequestForm };

async function forceReLogin(navigate: ReturnType<typeof useNavigate>) {
  await useAuthStore.getState().logout({ skipRemoteRevoke: true });
  navigate('/login', { replace: true });
}

export default function DoctorProfileSecurityPanel() {
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
          : 'تعذّر إكمال العملية.';
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
        title: 'تأكيد تغيير كلمة المرور',
        description: (
          <>
            سيتم تحديث كلمة المرور وإنهاء جميع الجلسات النشطة. ستحتاج لتسجيل
            الدخول مجدداً بعد الحفظ.
          </>
        ),
        confirmLabel: 'تأكيد التغيير',
      };
    }
    if (pendingAction.kind === 'email') {
      return {
        title: 'تأكيد طلب تغيير البريد',
        description: (
          <>
            سنرسل رمز تحقق إلى{' '}
            <span className="font-extrabold text-[#101828]">
              {pendingAction.values.newEmail.trim()}
            </span>
            . تأكد من صحة البريد قبل المتابعة.
          </>
        ),
        confirmLabel: 'إرسال رمز التحقق',
      };
    }
    return {
      title: 'تأكيد طلب تغيير الهاتف',
      description: (
        <>
          سنرسل رمز تحقق إلى{' '}
          <span className="font-extrabold text-[#101828]">
            {pendingAction.values.newPhone.replace(/[\s-]/g, '')}
          </span>
          . تأكد من صحة الرقم قبل المتابعة.
        </>
      ),
      confirmLabel: 'إرسال رمز التحقق',
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
        toast('تم تحديث كلمة المرور. سجّل الدخول مجدداً.', {
          title: 'تم التحديث',
          variant: 'success',
        });
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
        toast('تم إرسال رمز التحقق إلى البريد الجديد.', {
          title: 'تحقّق من بريدك',
          variant: 'success',
        });
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
      toast('تم إرسال رمز التحقق إلى الهاتف الجديد.', {
        title: 'تحقّق من واتساب',
        variant: 'success',
      });
      setConfirmOpen(false);
      setPendingAction(null);
    } catch (error) {
      if (pendingAction.kind === 'password') {
        handleApiError(error, 'تعذّر تغيير كلمة المرور');
      } else if (pendingAction.kind === 'email') {
        handleApiError(error, 'تعذّر طلب تغيير البريد');
      } else {
        handleApiError(error, 'تعذّر طلب تغيير الهاتف');
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
          toast('أُعيد إرسال رمز التحقق.', {
            title: 'تم الإرسال',
            variant: 'success',
          });
        }}
        onVerify={async (otp) => {
          await doctorSettingsApi.confirmEmailChange({ otp });
          toast('تم تحديث البريد. سجّل الدخول مجدداً.', {
            title: 'تم التحديث',
            variant: 'success',
          });
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
          toast('أُعيد إرسال رمز التحقق.', {
            title: 'تم الإرسال',
            variant: 'success',
          });
        }}
        onVerify={async (otp) => {
          await doctorSettingsApi.confirmPhoneChange({ otp });
          toast('تم تحديث الهاتف. سجّل الدخول مجدداً.', {
            title: 'تم التحديث',
            variant: 'success',
          });
          setPhoneStep('closed');
          await forceReLogin(navigate);
        }}
      />
    );
  }

  return (
    <>
      <section
        dir="rtl"
        lang="ar"
        className="mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]"
      >
        <div className="border-b border-[#EEF2F6] px-6 py-4">
          <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
            أمان الحساب
          </div>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
            تغيير كلمة المرور أو البريد أو الهاتف يلغي جميع الجلسات النشطة.
          </p>
        </div>
        <div className="divide-y divide-[#EEF2F6]">
          {[
            {
              key: 'password',
              label: 'تغيير كلمة المرور',
              icon: KeyRound,
              onClick: () => setPasswordOpen(true),
            },
            {
              key: 'email',
              label: 'تغيير البريد الإلكتروني',
              icon: Mail,
              onClick: () => setEmailStep('request'),
            },
            {
              key: 'phone',
              label: 'تغيير رقم الهاتف',
              icon: Phone,
              onClick: () => setPhoneStep('request'),
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center justify-between px-6 py-4 text-right transition hover:bg-[#F9FAFB]"
            >
              <span className="flex items-center gap-3 font-cairo text-[13px] font-bold text-[#111827]">
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </span>
              <span className="font-cairo text-[13px] font-extrabold text-primary">
                تعديل
              </span>
            </button>
          ))}
        </div>
      </section>

      <DoctorSecurityFormDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        title="تغيير كلمة المرور"
        description="أدخل كلمة المرور الحالية والجديدة. بعد التأكيد ستُنهى جلستك الحالية."
        icon={KeyRound}
        form={passwordForm}
        fields={[
          {
            name: 'currentPassword',
            label: 'كلمة المرور الحالية',
            placeholder: 'أدخل كلمة المرور الحالية',
            type: 'password',
            autoComplete: 'current-password',
          },
          {
            name: 'newPassword',
            label: 'كلمة المرور الجديدة',
            placeholder: '6 أحرف على الأقل',
            type: 'password',
            autoComplete: 'new-password',
            hint: 'يفضّل استخدام مزيج من أحرف وأرقام.',
          },
          {
            name: 'confirmPassword',
            label: 'تأكيد كلمة المرور',
            placeholder: 'أعد إدخال كلمة المرور الجديدة',
            type: 'password',
            autoComplete: 'new-password',
          },
        ]}
        submitLabel="متابعة للتأكيد"
        onValidatedSubmit={(values) =>
          openConfirm({ kind: 'password', values })
        }
      />

      <DoctorSecurityFormDialog
        open={emailStep === 'request'}
        onOpenChange={(next) => setEmailStep(next ? 'request' : 'closed')}
        title="تغيير البريد الإلكتروني"
        description="أدخل كلمة المرور الحالية والبريد الجديد. سنرسل رمز تحقق بعد التأكيد."
        icon={Mail}
        form={emailForm}
        fields={[
          {
            name: 'currentPassword',
            label: 'كلمة المرور الحالية',
            placeholder: 'أدخل كلمة المرور الحالية',
            type: 'password',
            autoComplete: 'current-password',
          },
          {
            name: 'newEmail',
            label: 'البريد الإلكتروني الجديد',
            placeholder: 'example@mail.com',
            type: 'email',
            autoComplete: 'email',
          },
        ]}
        submitLabel="متابعة للتأكيد"
        onValidatedSubmit={(values) => openConfirm({ kind: 'email', values })}
      />

      <DoctorSecurityFormDialog
        open={phoneStep === 'request'}
        onOpenChange={(next) => setPhoneStep(next ? 'request' : 'closed')}
        title="تغيير رقم الهاتف"
        description="أدخل كلمة المرور الحالية ورقم الهاتف الجديد مع رمز الدولة."
        icon={Phone}
        form={phoneForm}
        fields={[
          {
            name: 'currentPassword',
            label: 'كلمة المرور الحالية',
            placeholder: 'أدخل كلمة المرور الحالية',
            type: 'password',
            autoComplete: 'current-password',
          },
          {
            name: 'newPhone',
            label: 'رقم الهاتف الجديد',
            placeholder: '+9639XXXXXXXX',
            type: 'tel',
            autoComplete: 'tel',
            hint: 'أدخل الرقم بصيغة دولية مع رمز الدولة.',
          },
        ]}
        submitLabel="متابعة للتأكيد"
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
            confirmBusy ? 'جاري التنفيذ…' : confirmCopy.confirmLabel
          }
          confirmDisabled={confirmBusy}
          onConfirm={executePendingAction}
        />
      ) : null}
    </>
  );
}
