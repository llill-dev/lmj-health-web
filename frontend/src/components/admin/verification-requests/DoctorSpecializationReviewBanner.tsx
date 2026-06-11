import { Link } from 'react-router-dom';
import type { DoctorSpecializationReviewState } from '@/lib/admin/doctorSpecializationReview';

const toneClasses: Record<
  DoctorSpecializationReviewState['statusTone'],
  { box: string; text: string }
> = {
  success: {
    box: 'border-[#BBF7D0] bg-[#F0FDF4]',
    text: 'text-[#166534]',
  },
  warning: {
    box: 'border-[#FDE68A] bg-[#FFFBEB]',
    text: 'text-[#92400E]',
  },
  neutral: {
    box: 'border-[#E5E7EB] bg-[#F9FAFB]',
    text: 'text-[#374151]',
  },
};

type BannerCopy = {
  title: string;
  body: string;
  showManageLink: boolean;
};

function resolveBannerCopy(state: DoctorSpecializationReviewState): BannerCopy {
  if (state.mode === 'catalog') {
    return {
      title: 'التخصص مرتبط بالقائمة المعتمدة',
      body: `التخصص الرسمي: ${state.displayLabel}`,
      showManageLink: false,
    };
  }

  if (state.mode === 'custom_pending') {
    return {
      title: 'تخصص يدوي — يلزم الربط قبل الموافقة',
      body: `أدخل الطبيب التخصص «${state.displayLabel}» يدوياً. قبل قبول الطلب، اختر تخصصاً مطابقاً من القائمة المعتمدة أو أضف تخصصاً جديداً إلى النظام.`,
      showManageLink: true,
    };
  }

  const specialtyPart =
    state.displayLabel !== '—'
      ? `التخصص الظاهر في ملف الطبيب: «${state.displayLabel}». `
      : '';

  return {
    title: 'يلزم مراجعة التخصص قبل الموافقة',
    body: `${specialtyPart}تعذّر التحقق من التخصص المرتبط بهذا الطبيب. يرجى ربطه بتخصص رسمي من القائمة قبل قبول الطلب.`,
    showManageLink: true,
  };
}

export function DoctorSpecializationReviewBanner({
  state,
  showManageLink = true,
}: {
  state: DoctorSpecializationReviewState;
  showManageLink?: boolean;
}) {
  const tone = toneClasses[state.statusTone];
  const copy = resolveBannerCopy(state);

  return (
    <div
      className={`rounded-[12px] border px-4 py-3 text-right ${tone.box}`}
    >
      <div className={`font-cairo text-[13px] font-extrabold ${tone.text}`}>
        {copy.title}
      </div>
      <p
        className={`mt-2 font-cairo text-[12px] font-semibold leading-[20px] ${tone.text}`}
      >
        {copy.body}
      </p>
      {showManageLink && copy.showManageLink ? (
        <Link
          to='/admin/doctor-specializations'
          className='mt-3 inline-block font-cairo text-[12px] font-extrabold text-primary underline-offset-2 hover:underline'
        >
          إدارة التخصصات
        </Link>
      ) : null}
    </div>
  );
}
