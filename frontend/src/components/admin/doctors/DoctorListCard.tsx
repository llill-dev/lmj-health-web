import {
  Award,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Phone,
} from 'lucide-react';
import type {
  AdminDoctorApprovalStatus,
  AdminDoctorSummary,
} from '@/lib/admin/types';

const TEAL = '#108B8B';
const STAT_BG = '#E6F4F4';

function doctorInitial(fullName?: string) {
  const n = (fullName ?? '').trim();
  if (!n.length) return 'د';
  return n.charAt(0);
}

function StatusBadge({ status }: { status?: AdminDoctorApprovalStatus }) {
  if (status === 'approved') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-[8px] bg-[#28A745] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-white'>
        <CheckCircle2 className='h-3.5 w-3.5 shrink-0' />
        مقبول
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-[8px] bg-[#DC3545] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-white'>
        <Ban className='h-3.5 w-3.5 shrink-0' />
        مرفوض
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1.5 rounded-[8px] bg-[#343A40] px-3 py-1.5 font-cairo text-[11px] font-extrabold text-white'>
      <Clock className='h-3.5 w-3.5 shrink-0' />
      بانتظار الموافقة
    </span>
  );
}

export default function DoctorListCard({
  doctor: d,
  onDetails,
}: {
  doctor: AdminDoctorSummary;
  onDetails: () => void;
}) {
  const appt = d.appointmentsCount;
  const done = d.completedAppointmentsCount;
  const pts = d.linkedPatientsCount;
  const fmt = (n: number | undefined) =>
    typeof n === 'number' && !Number.isNaN(n) ? String(n) : '—';

  return (
    <div className='rounded-[10px] border border-[#E8ECEF] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]'>
      <div className='flex flex-col gap-4 px-3 py-4 sm:px-4 lg:grid lg:grid-cols-[minmax(0,16rem)_17.5rem_minmax(0,1fr)_auto] lg:items-stretch lg:gap-x-6 lg:gap-y-0 xl:grid-cols-[minmax(0,18rem)_17.5rem_minmax(0,1fr)_auto]'>
        <div className='flex min-w-0 items-start gap-3 lg:min-w-0 lg:max-w-[16rem] xl:max-w-[18rem]'>
          <div
            className='flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] text-[22px] font-black text-white'
            style={{ backgroundColor: TEAL }}
          >
            {doctorInitial(d.user?.fullName)}
          </div>
          <div className='min-w-0 flex-1 text-right'>
            <div className='break-words font-cairo text-sm font-extrabold leading-snug text-[#1F2937] sm:text-[15px]'>
              {d.user?.fullName ?? '—'}
            </div>
            <div className='mt-1 break-words font-cairo text-[12px] font-semibold text-[#6B7280] sm:text-[13px]'>
              {d.specialization ?? '—'}
            </div>
          </div>
        </div>

        <div className='grid w-full shrink-0 grid-cols-3 gap-2 lg:w-[17.5rem] lg:justify-self-start'>
          {[
            { label: 'المواعيد', value: fmt(appt) },
            { label: 'مكتملة', value: fmt(done) },
            { label: 'المرضى', value: fmt(pts) },
          ].map((box) => (
            <div
              key={box.label}
              className='flex min-w-0 flex-col items-center justify-center rounded-[8px] px-1.5 py-2 sm:px-2'
              style={{ backgroundColor: STAT_BG }}
            >
              <span
                className='text-center font-cairo text-[10px] font-bold sm:text-[11px]'
                style={{ color: TEAL }}
              >
                {box.label}
              </span>
              <span
                className='mt-0.5 font-cairo text-base font-black leading-none sm:text-lg md:text-[20px]'
                style={{ color: TEAL }}
              >
                {box.value}
              </span>
            </div>
          ))}
        </div>

        <div className='flex w-full min-w-0 flex-col gap-2 text-right lg:min-w-0'>
          <div className='flex items-start gap-2'>
            <Award
              className='h-4 w-4 shrink-0 mt-0.5'
              style={{ color: TEAL }}
              aria-hidden
            />
            <span className='font-cairo text-[12px] font-semibold text-[#6B7280]'>
              رخصة:{' '}
              <span className='text-[#374151]'>
                {d.medicalLicenseNumber ?? '—'}
              </span>
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Mail
              className='h-4 w-4 shrink-0'
              style={{ color: TEAL }}
              aria-hidden
            />
            <span className='truncate font-cairo text-[12px] font-semibold text-[#6B7280]'>
              {d.user?.email ?? '—'}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Phone
              className='h-4 w-4 shrink-0'
              style={{ color: TEAL }}
              aria-hidden
            />
            <span
              className='font-cairo text-[12px] font-semibold text-[#6B7280]'
              dir='ltr'
            >
              {d.user?.phone ?? '—'}
            </span>
          </div>
        </div>

        <div className='flex w-full shrink-0 flex-col items-stretch gap-3 border-t border-[#F3F4F6] pt-4 sm:border-t-0 sm:pt-0 lg:w-auto lg:items-end lg:justify-self-end'>
          <div className='flex justify-end'>
            <StatusBadge status={d.approvalStatus} />
          </div>
          <button
            type='button'
            onClick={onDetails}
            className='inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] px-4 font-cairo text-[13px] font-extrabold text-white transition hover:opacity-92 lg:w-auto lg:min-w-[8.5rem]'
            style={{ backgroundColor: TEAL }}
          >
            <span>التفاصيل</span>
            <Eye className='h-4 w-4 shrink-0' />
          </button>
        </div>
      </div>
    </div>
  );
}
