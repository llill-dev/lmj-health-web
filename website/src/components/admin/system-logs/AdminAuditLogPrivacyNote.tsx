import { AlertTriangle } from 'lucide-react';

export function AdminAuditLogPrivacyNote() {
  return (
    <section className='mt-6 rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] px-6 py-4'>
      <div className='flex items-start justify-between gap-4'>
        <div className='text-right'>
          <div className='font-cairo text-[14px] font-black text-[#92400E]'>ملاحظة الخصوصية والامتثال</div>
          <div className='mt-1 font-cairo text-[12px] font-semibold leading-[20px] text-[#B45309]'>
            لا تتضمن سجلات التدقيق أي محتوى حساس للمرضى (لا مرفقات، لا رسائل استشارة، لا نصوص تشخيص أو وصفات).
            يتم تتبع الأنشطة فقط للأغراض الأمنية والإدارية والامتثال القانوني.
            <br />
            مدد الاحتفاظ: AUTH / AUTHZ / DATA / ADMIN — 3 سنوات | PHI — 7 سنوات | SYSTEM — سنة واحدة.
          </div>
        </div>
        <div className='flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#FDE68A]'>
          <AlertTriangle className='h-5 w-5 text-[#B45309]' />
        </div>
      </div>
    </section>
  );
}
