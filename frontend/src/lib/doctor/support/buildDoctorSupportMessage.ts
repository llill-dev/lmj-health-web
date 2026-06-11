import type {
  DoctorSupportContactForm,
  DoctorSupportIdentity,
  DoctorSupportRequestType,
} from '@/lib/doctor/support/types';

const REQUEST_TYPE_LABELS: Record<DoctorSupportRequestType, string> = {
  technical: 'مشكلة تقنية',
  account: 'الحساب والأمان',
  billing: 'الفوترة والاشتراك',
  verification: 'التحقق والملف المهني',
  other: 'أخرى',
};

export function doctorSupportRequestTypeLabel(
  type: DoctorSupportRequestType,
): string {
  return REQUEST_TYPE_LABELS[type];
}

export function buildDoctorSupportMessage(input: {
  form: Pick<DoctorSupportContactForm, 'subject' | 'message' | 'requestType'>;
  identity: DoctorSupportIdentity;
  fullName: string;
  email: string;
  phone: string;
}): string {
  const lines = [
    input.form.message.trim(),
    '',
    '— معلومات الطبيب —',
    `نوع الطلب: ${doctorSupportRequestTypeLabel(input.form.requestType)}`,
    input.form.subject.trim()
      ? `الموضوع: ${input.form.subject.trim()}`
      : null,
    input.identity.doctorProfileId
      ? `معرّف الطبيب: ${input.identity.doctorProfileId}`
      : null,
    input.fullName.trim() ? `الاسم: ${input.fullName.trim()}` : null,
    input.email.trim() ? `البريد: ${input.email.trim()}` : null,
    input.phone.trim() ? `الهاتف: ${input.phone.trim()}` : null,
    'الدور: doctor',
  ].filter(Boolean);

  return lines.join('\n').trim();
}
