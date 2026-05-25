import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  MessageSquareText,
  Video,
  ShieldClose,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import DoctorProfileEditDialog, {
  type ProfileEditForm,
} from '@/components/doctor/profile-settings/doctor-profile-edit-dialog';
import DoctorProfileSecurityPanel from '@/components/doctor/profile-settings/doctor-profile-security-panel';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useDoctorProfile,
  useUpdateDoctorProfile,
} from '@/hooks/doctor/useDoctorProfile';
import type { DoctorConsultationType } from '@/lib/doctor/profileClient';

function formatFee(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toLocaleString('ar-SY')} ل.س`;
}

export default function DoctorProfileSettingsPage() {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const profileQuery = useDoctorProfile();
  const updateProfile = useUpdateDoctorProfile();

  const doctor = profileQuery.data?.doctor;
  const user = doctor?.user;
  const consultationTypes = (doctor?.consultationTypes ?? []) as DoctorConsultationType[];

  const displayName = user?.fullName?.trim() || 'الطبيب';
  const displayInitial = displayName.charAt(0) || 'د';
  const specialization = doctor?.specialization?.trim() || '—';
  const bio =
    doctor?.bio?.trim() ||
    'لم تُضف نبذة بعد. استخدم «تعديل الملف» لإضافة نبذة مختصرة.';

  const stats = useMemo(
    () => [
      {
        label: 'رسوم الاستشارة',
        value: formatFee(doctor?.consultationFee),
      },
      {
        label: 'أنماط الاستشارة',
        value: String(consultationTypes.length || 0),
      },
      {
        label: 'الحالة',
        value: doctor?.isApproved ? 'موثّق' : 'قيد المراجعة',
      },
    ],
    [consultationTypes.length, doctor?.consultationFee, doctor?.isApproved],
  );

  const contact = useMemo(
    () => [
      {
        label: 'رقم الهاتف',
        value: user?.phone?.trim() || '—',
        icon: <Phone className="h-4 w-4 text-white" />,
      },
      {
        label: 'البريد الإلكتروني',
        value: user?.email?.trim() || '—',
        icon: <Mail className="h-4 w-4 text-white" />,
      },
      {
        label: 'العنوان',
        value: user?.address?.trim() || doctor?.clinicAddress?.trim() || '—',
        icon: <MapPin className="h-4 w-4 text-white" />,
      },
    ],
    [doctor?.clinicAddress, user?.address, user?.email, user?.phone],
  );

  const professional = useMemo(
    () => [
      {
        label: 'الرقم المهني',
        value: doctor?.medicalLicenseNumber?.trim() || '—',
        icon: <BadgeCheck className="h-4 w-4 text-white" />,
      },
      {
        label: 'التخصص',
        value: specialization,
        icon: <Stethoscope className="h-4 w-4 text-white" />,
      },
      {
        label: 'عنوان العيادة',
        value: doctor?.clinicAddress?.trim() || '—',
        icon: <MapPin className="h-4 w-4 text-white" />,
      },
      {
        label: 'رسوم الاستشارة',
        value: formatFee(doctor?.consultationFee),
        icon: <ShieldCheck className="h-4 w-4 text-white" />,
      },
      {
        label: 'التعليم',
        value: doctor?.education?.trim() || '—',
        icon: <CalendarDays className="h-4 w-4 text-white" />,
      },
    ],
    [doctor, specialization],
  );

  const consultationModes = useMemo(
    () => [
      {
        key: 'offline',
        title: 'استشارة في العيادة',
        subtitle: 'زيارة شخصية مباشرة',
        icon: <MessageSquareText className="h-4 w-4 text-white" />,
        enabled: consultationTypes.includes('offline'),
      },
      {
        key: 'online',
        title: 'استشارة عبر الإنترنت',
        subtitle: 'استشارة عن بعد',
        icon: <Video className="h-4 w-4 text-white" />,
        enabled: consultationTypes.includes('online'),
      },
    ],
    [consultationTypes],
  );

  const handleSaveProfile = async (values: ProfileEditForm) => {
    const existingTypes = consultationTypes.filter(
      (type): type is DoctorConsultationType =>
        type === 'online' || type === 'offline',
    );

    await updateProfile.mutateAsync({
      fullName: values.fullName.trim(),
      phone: values.phone.replace(/[\s-]/g, ''),
      address: values.address.trim(),
      bio: values.bio.trim(),
      consultationFee: Number(values.consultationFee),
      consultationTypes: existingTypes.length ? existingTypes : undefined,
    });

    toast('تم تحديث الملف الشخصي بنجاح.', {
      title: 'حفظ الملف',
      variant: 'success',
    });
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center font-cairo text-[13px] font-semibold text-[#667085]">
        <Loader2 className="me-2 h-5 w-5 animate-spin text-primary" />
        جاري تحميل الملف الشخصي…
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded-[14px] border border-[#FEE2E2] bg-[#FFF1F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
        تعذّر تحميل الملف الشخصي. حاول تحديث الصفحة.
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile Settings • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <section className="relative overflow-hidden rounded-[6px] bg-primary px-6 pb-6 pt-8 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-[220px] w-[220px] rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-[260px] w-[260px] rounded-full bg-white/10" />

          <div className="flex flex-col items-center text-center">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={displayName}
                className="h-[64px] w-[64px] rounded-full border-2 border-white/50 object-cover"
              />
            ) : (
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-white/50 bg-white/15">
                <span className="font-cairo text-[20px] font-extrabold text-white">
                  {displayInitial}
                </span>
              </div>
            )}

            <div className="mt-3 font-cairo text-[18px] font-extrabold text-white">
              {/^د\.?\s/u.test(displayName) ? displayName : `د. ${displayName}`}
            </div>
            <div className="mt-1 font-cairo text-[13px] font-semibold text-white/80">
              {specialization}
            </div>

            {doctor?.isApproved ? (
              <span className="mt-3 inline-flex h-[24px] items-center justify-center rounded-full bg-white/15 px-4 font-cairo text-[11px] font-extrabold text-white">
                حساب محقق
              </span>
            ) : (
              <span className="mt-3 inline-flex h-[24px] items-center justify-center rounded-full bg-[#FFFFFF33] px-4 font-cairo text-[11px] font-extrabold text-white">
                بانتظار موافقة الإدارة
              </span>
            )}
          </div>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-4 text-center shadow-[0_14px_24px_rgba(0,0,0,0.08)]"
            >
              <div className="font-cairo text-[24px] font-black text-primary">
                {s.value}
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                {s.label}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-[6px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
            نبذة عن الطبيب
          </div>
          <div className="mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]">
            {bio}
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="border-b border-[#EEF2F6] px-6 py-4">
            <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
              معلومات الاتصال
            </div>
          </div>
          <div className="divide-y divide-[#EEF2F6]">
            {contact.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-primary">
                    {row.icon}
                  </div>
                  <div className="text-right">
                    <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      {row.label}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-extrabold text-[#111827]">
                      {row.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="border-b border-[#EEF2F6] px-6 py-4">
            <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
              طرق الاستشارة
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-3">
              {consultationModes.map((mode) => (
                <div
                  key={mode.key}
                  className="flex h-[64px] items-center justify-between rounded-[6px] bg-[#0F8F8B26] px-2 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-primary">
                      {mode.icon}
                    </div>
                    <div className="text-right">
                      <p className="font-cairo text-[14px] font-bold text-[#1F2937]">
                        {mode.title}
                      </p>
                      <p className="mt-1 font-cairo text-[12px] font-semibold text-[#6A7282]">
                        {mode.subtitle}
                      </p>
                    </div>
                  </div>
                  {mode.enabled ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <ShieldClose className="h-4 w-4 text-[#98A2B3]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="border-b border-[#EEF2F6] px-6 py-4">
            <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
              المعلومات المهنية
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-3">
              {professional.map((row) => (
                <div
                  key={row.label}
                  className="flex h-[64px] items-center justify-between rounded-[6px] bg-[#E9FFFE] px-2 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-primary">
                      {row.icon}
                    </div>
                    <div className="text-right">
                      <p className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        {row.label}
                      </p>
                      <p className="mt-1 font-cairo text-[14px] font-bold text-[#101828]">
                        {row.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[6px] bg-primary px-6 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="font-cairo text-[11px] font-semibold text-white/80">
                حالة الحساب
              </div>
              <div className="mt-1 font-cairo text-[13px] font-extrabold text-white">
                {doctor?.isApproved ? 'نشط وموثّق' : 'بانتظار الموافقة'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="h-[36px] rounded-[6px] bg-[#FFFFFF33] px-4 font-cairo text-[12px] font-extrabold text-white transition hover:bg-[#FFFFFF44]"
            >
              تعديل الملف
            </button>
          </div>
        </section>

        <DoctorProfileSecurityPanel />

        <DoctorProfileEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          doctor={doctor}
          busy={updateProfile.isPending}
          onSubmit={handleSaveProfile}
        />

        <div className="h-10" />
      </div>
    </>
  );
}
