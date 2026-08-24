import { Info } from 'lucide-react';
import { ACTIVITY_LOG_INFO_TEXT } from '@/lib/doctor/activityLog/constants';

export function ActivityLogInfoAlert() {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-[12px] border border-[#B9E6E1] bg-[#F0FDFA] px-5 py-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p className="text-start font-cairo text-[13px] font-semibold leading-[22px] text-[#0F766E]">
        {ACTIVITY_LOG_INFO_TEXT}
      </p>
    </div>
  );
}
