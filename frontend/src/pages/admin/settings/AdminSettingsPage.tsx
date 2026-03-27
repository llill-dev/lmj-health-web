import type { ComponentType, ReactNode } from 'react';
import { useId, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Bell,
  CloudUpload,
  Mail,
  Settings,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <input
      id={id}
      type='checkbox'
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className={
        disabled
          ? "relative h-[18px] w-[34px] cursor-not-allowed appearance-none rounded-full bg-[#E5E7EB] opacity-70 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:bg-white after:shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
          : "relative h-[18px] w-[34px] cursor-pointer appearance-none rounded-full bg-[#E5E7EB] transition-[background-color,box-shadow] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:bg-white after:shadow-[0_4px_10px_rgba(0,0,0,0.14)] after:transition-[left,background-color,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.2,0.8,0.2,1)] checked:bg-primary checked:shadow-[0_10px_20px_rgba(15,143,139,0.25)] checked:after:left-[18px] checked:after:bg-[#F2FFFE]"
      }
      aria-checked={checked}
    />
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className='overflow-hidden rounded-[10px] border border-[#EAECF0] bg-white'>
      <div className='flex items-center justify-between px-6 py-4'>
        <div className='flex items-center gap-2 text-right'>
          <Icon className='h-4 w-4 text-primary' />
          <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
            {title}
          </div>
        </div>
      </div>
      <div className='border-t border-[#EAECF0] px-6 py-5'>{children}</div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  defaultValue,
  type = 'text',
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className='space-y-2'>
      <div className='text-right font-cairo text-[12px] font-bold text-[#344054]'>
        {label}
      </div>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className='h-[40px] w-full rounded-[8px] border border-[#EAECF0] bg-white px-4 font-cairo text-[12px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3] focus:border-[#BFEDEC] focus:ring-2 focus:ring-[#16C5C020]'
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [appointmentsNoti, setAppointmentsNoti] = useState(true);
  const [registrationNoti, setRegistrationNoti] = useState(true);
  const [requestsNoti, setRequestsNoti] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [auditLog, setAuditLog] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <>
      <Helmet>
        <title>الإعدادات • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='min-h-[520px] bg-white'
      >
        <div className='mx-auto w-full max-w-[1420px] px-12 pb-10'>
          <div className='space-y-6'>
            <SectionCard
              title='الإعدادات العامة'
              icon={Settings}
            >
              <div className='space-y-4'>
                <Field
                  label='اسم التطبيق'
                  defaultValue='LMJ HEALTH'
                />
                <Field
                  label='وصف التطبيق'
                  defaultValue='منصة طبية متكاملة'
                />
                <div className='flex justify-start'>
                  <button
                    type='button'
                    className='inline-flex h-[34px] items-center gap-2 rounded-[8px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(15,143,139,0.20)]'
                  >
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title='شعار التطبيق'
              icon={CloudUpload}
            >
              <div className='flex items-center gap-6'>
                <div className='flex min-h-[96px] min-w-[96px] shrink-0 items-center justify-center rounded-[6px] bg-primary text-white shadow-[0_14px_30px_rgba(15,143,139,0.25)]'>
                  <div className='font-cairo text-[25px] px-8 leading-[36px] font-black'>
                    LMJ
                  </div>
                </div>
                <div className=''>
                  <button
                    type='button'
                    className='inline-flex h-[36px] items-center gap-2 rounded-[8px] border border-primary bg-white px-2 font-cairo text-[12px] font-extrabold text-primary'
                  >
                    تحميل شعار جديد
                  </button>
                  <div className='mt-2 text-right font-cairo text-[11px] font-medium text-[#98A2B3]'>
                    الحجم المفضل 512×512 • صيغة (PNG)
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title='إعدادات البريد الإلكتروني'
              icon={Mail}
            >
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <Field
                    label='SMTP Server'
                    placeholder='smtp.example.com'
                  />
                  <Field
                    label='Port'
                    defaultValue='587'
                  />
                </div>
                <Field
                  label='Username'
                  placeholder='user@example.com'
                />
                <div className='flex justify-start'>
                  <button
                    type='button'
                    className='inline-flex h-[34px] items-center gap-2 rounded-[8px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(15,143,139,0.20)]'
                  >
                    حفظ الإعدادات
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title='إعدادات الإشعارات'
              icon={Bell}
            >
              <div className='space-y-4'>
                <div className='flex items-center justify-between rounded-[8px] bg-[#F8FAFC] px-4 py-4'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      إشعارات المواعيد
                    </div>
                    <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                      إرسال تذكير للمواعيد
                    </div>
                  </div>
                  <Toggle
                    checked={appointmentsNoti}
                    onChange={setAppointmentsNoti}
                  />
                </div>

                <div className='flex items-center justify-between rounded-[8px] bg-[#F8FAFC] px-4 py-4'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      إشعارات التسجيل
                    </div>
                    <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                      إشعار عند تسجيل مستخدم جديد
                    </div>
                  </div>
                  <Toggle
                    checked={registrationNoti}
                    onChange={setRegistrationNoti}
                  />
                </div>

                <div className='flex items-center justify-between rounded-[8px] bg-[#F8FAFC] px-4 py-4'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      إشعارات الطلبات
                    </div>
                    <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                      إشعار عند طلب جديد أو قبول جديد
                    </div>
                  </div>
                  <Toggle
                    checked={requestsNoti}
                    onChange={setRequestsNoti}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title='الأمان والصلاحيات'
              icon={ShieldCheck}
            >
              <div className='space-y-4'>
                <div className='flex items-center justify-between rounded-[8px] bg-[#F8FAFC] px-4 py-4'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      المصادقة الثنائية
                    </div>
                    <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                      رمز 2FA لتعزيز الأمان
                    </div>
                  </div>
                  <Toggle
                    checked={twoFactor}
                    onChange={setTwoFactor}
                  />
                </div>

                <div className='flex items-center justify-between rounded-[8px] bg-[#F8FAFC] px-4 py-4'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      تسجيل العمليات
                    </div>
                    <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                      حفظ سجل لجميع الإجراءات والنشاطات
                    </div>
                  </div>
                  <Toggle
                    checked={auditLog}
                    onChange={setAuditLog}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title='النسخ الاحتياطي'
              icon={HardDrive}
            >
              <div className='space-y-4'>
                <div className='flex items-center justify-between rounded-[8px] bg-[#F8FAFC] px-4 py-4'>
                  <div className='text-right'>
                    <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      النسخ التلقائي
                    </div>
                    <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                      نسخ احتياطي يومي تلقائي
                    </div>
                  </div>
                  <Toggle
                    checked={autoBackup}
                    onChange={setAutoBackup}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <button
                    type='button'
                    className='flex h-[42px] items-center justify-center rounded-[6px] border border-primary bg-white font-cairo text-[12px] font-extrabold text-primary'
                  >
                    استعادة نسخة
                  </button>
                  <button
                    type='button'
                    className='flex h-[42px] items-center justify-center rounded-[6px] bg-primary font-cairo text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(15,143,139,0.20)]'
                  >
                    إنشاء نسخة احتياطية الآن
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
