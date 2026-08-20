import { buildDoctorSupportMessage } from '@/lib/doctor/support/buildDoctorSupportMessage';
import type {
  DoctorSupportContactForm,
  DoctorSupportIdentity,
} from '@/lib/doctor/support/types';
import { openSupportMailto } from '@/lib/platform/supportContact';

/**
 * Doctor support intake per API-3: complaints (POST /api/complaints) are patient-only.
 * Professional doctors route support through CMS contact email with structured context.
 */
export function submitDoctorSupportRequest(input: {
  form: DoctorSupportContactForm;
  identity: DoctorSupportIdentity;
  supportEmail: string;
}): void {
  const subject =
    input.form.subject.trim() ||
    `طلب دعم طبيب — ${input.form.requestType}`;

  openSupportMailto({
    email: input.supportEmail,
    subject,
    body: buildDoctorSupportMessage({
      form: input.form,
      identity: input.identity,
      fullName: input.form.fullName,
      email: input.form.email,
      phone: input.form.phone,
    }),
  });
}
