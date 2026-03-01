'use client';

import { useMemo, useState } from 'react';
import {
  FileText,
  Search,
  Activity,
  ClipboardList,
  Files,
  CalendarDays,
  ChevronRight,
  Clock,
  Link,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DoctorDashboardOverview from '@/components/doctor/doctor-dashboard-overview';
import CreateMedicalRecordForm from '@/components/doctor/create-medical-record-form';
import MedicalRecordDetailsDialog, {
  type MedicalRecordDetails,
} from '@/components/doctor/medical-record-details-dialog';

type MedicalRecordItem = {
  id: string;
  patientName: string;
  patientInitial: string;
  date: string;
  statusLabel: string;
  diagnosisTitle: string;
  diagnosisSubtitle: string;
  symptoms: string[];
  medicinesCount: number;
  vitals: {
    label: string;
    value: string;
  }[];
  followUpDate: string;
};

const mockRecords: MedicalRecordItem[] = [
  {
    id: 'mr-1',
    patientName: 'أحمد محمد',
    patientInitial: 'أ',
    date: '2024-02-08',
    statusLabel: 'يحتاج متابعة',
    diagnosisTitle: 'التشخيص',
    diagnosisSubtitle: 'التهاب الحلق',
    symptoms: ['ألم في الحلق', 'سعال', 'التهاب شديد في الحلق'],
    medicinesCount: 2,
    vitals: [
      { label: 'ضغط الدم', value: '120/80' },
      { label: 'النبض', value: '75' },
      { label: 'الحرارة', value: '37.5' },
      { label: 'الوزن', value: '75' },
    ],
    followUpDate: '15-02-2024',
  },
];

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] =
    useState<MedicalRecordDetails | null>(null);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return mockRecords;
    const q = searchTerm.toLowerCase();
    return mockRecords.filter((r) => r.patientName.toLowerCase().includes(q));
  }, [searchTerm]);

  return (
    <div
      dir='rtl'
      lang='ar'
      className='mx-auto w-full max-w-[1120px]'
    >
      <MedicalRecordDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setDetailsRecord(null);
        }}
        record={detailsRecord}
      />

      <DoctorDashboardOverview
        variant='medical-records'
        title='السجلات الطبية'
        subtitle='تتبع الحالات والوصفات'
        mode={mode}
        actionLabel='إضافة سجل جديد'
        onActionClick={() => setMode('create')}
        overlay={
          mode === 'create' ? (
            <motion.button
              type='button'
              onClick={() => setMode('list')}
              className='absolute left-[24px] top-[24px] flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-white shadow-[0_14px_24px_rgba(0,0,0,0.16)]'
              aria-label='إغلاق'
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              whileTap={{ scale: 0.98 }}
            >
              <X className='h-5 w-5 text-[#0FA6A3]' />
            </motion.button>
          ) : null
        }
        kpis={[
          {
            key: 'totalRecords',
            icon: <Files />,
            value: 1,
            label: 'إجمالي السجلات',
          },
          {
            key: 'activePrescriptions',
            icon: <ClipboardList />,
            value: 2,
            label: 'الوصفات النشطة',
          },
          {
            key: 'needsFollowUp',
            icon: <Activity />,
            value: 1,
            label: 'يحتاج متابعة',
          },
        ]}
      />

      <AnimatePresence
        mode='wait'
        initial={false}
      >
        {mode === 'create' ? (
          <motion.div
            key='create'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <CreateMedicalRecordForm
              patients={[
                { id: 'p-1', name: 'أحمد محمد' },
                { id: 'p-2', name: 'سارة عبدالله' },
                { id: 'p-3', name: 'محمد علي' },
              ]}
              onCancel={() => setMode('list')}
              onSave={() => {
                setMode('list');
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key='list'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <section className='mt-5 rounded-[6px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.08)]'>
              <div className='relative'>
                <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                  <Search className='h-4 w-4' />
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='بحث عن مريض أو تشخيص...'
                  className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pr-4 pl-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-semibold placeholder:text-[#98A2B3]'
                />
              </div>
            </section>

            <section className='mt-5 space-y-4'>
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className='rounded-[6px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)]'
                >
                  <div className='flex justify-between px-6 pt-5 gap-4'>
                    <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-[#16C5C0] text-white shadow-[0_14px_24px_rgba(22,197,192,0.28)]'>
                      <span className='font-cairo text-[18px] font-extrabold'>
                        {r.patientInitial}
                      </span>
                    </div>

                    <div className='flex-1'>
                      <div>
                        <div className='flex items-center justify-between'>
                          <div className='text-right'>
                            <div className='font-cairo text-[16px] font-extrabold leading-[20px] text-[#111827]'>
                              {r.patientName}
                            </div>
                            <div className='mt-1 flex items-center justify-end gap-2 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                              <CalendarDays className='h-4 w-4 text-[#98A2B3]' />
                              <span>{r.date}</span>
                            </div>
                          </div>
                          <div className='flex h-[22px] items-center gap-2 py-3 rounded-[12px] bg-[#FEF6EE] px-3 font-cairo text-[11px] font-extrabold text-[#F79009]'>
                            <span>{r.statusLabel}</span>
                            <Activity className='w-4 h-4' />
                          </div>
                        </div>
                      </div>
                      <div className='my-4 rounded-[6px] bg-[#E9FFFE] px-5 py-4'>
                        <div className='flex items-center justify-between'>
                          <div className='text-right'>
                            <div className='font-cairo text-[12px] font-extrabold text-[#667085]'>
                              {r.diagnosisTitle}
                            </div>
                            <div className='mt-1 font-cairo text-[14px] font-extrabold text-[#0FA6A3]'>
                              {r.diagnosisSubtitle}
                            </div>
                          </div>
                          <div className='flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-white'>
                            <FileText className='h-4 w-4 text-[#0FA6A3]' />
                          </div>
                        </div>
                      </div>
                      <div className='mt-4 text-right'>
                        <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                          الأعراض :
                        </div>
                        <div className='mt-2 flex flex-wrap gap-2'>
                          {r.symptoms.map((s) => (
                            <div
                              key={s}
                              className='inline-flex h-[24px] items-center justify-center rounded-[6px] border-[1.82px] border-[#16C5C0] px-3 font-cairo text-[11px] font-extrabold bg-[#16C5C026] text-[#0FA6A3]'
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                        <div className='inline-flex gap-2 mt-4 h-[36px] items-center justify-center rounded-f6l  px-3 font-cairo text-[11px] font-extrabold bg-[#16C5C026] text-[#0FA6A3]'>
                          <Link className='w-4 h-4' />
                          <span>{r.medicinesCount} دواء موصوف</span>
                        </div>
                      </div>

                      <div className='mt-4 grid grid-cols-4 gap-3'>
                        {r.vitals.map((v) => (
                          <div
                            key={v.label}
                            className='rounded-[6px] bg-[#F9FAFB] px-4 py-3 text-right'
                          >
                            <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                              {v.label}
                            </div>
                            <div className='mt-1 font-cairo text-[12px] font-extrabold text-[#111827]'>
                              {v.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className='my-4 flex items-center justify-start gap-2 rounded-[6px] bg-[#FFF6ED] px-4 py-3 text-right'>
                        <Clock className='w-4 h-4 text-[#F54900]' />
                        <div className='font-cairo text-[12px] font-extrabold text-[#B54708]'>
                          موعد المتابعة:
                        </div>
                        <div className='font-cairo text-[12px] font-extrabold text-[#B54708]'>
                          {r.followUpDate}
                        </div>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() => {
                        const mapped: MedicalRecordDetails = {
                          id: r.id,
                          patientName: r.patientName,
                          date: r.date,
                          diagnosisSubtitle: r.diagnosisSubtitle,
                          symptoms: r.symptoms,
                          vitals: r.vitals,
                          medicinesCount: r.medicinesCount,
                          prescriptions: [
                            {
                              name: 'أموكسيسيلين 500mg',
                              dosage: 'حبّة واحدة',
                              duration: '7 أيام',
                              frequency: '3 مرات يومياً',
                              notes: 'بعد الأكل',
                            },
                            {
                              name: 'باراسيتامول 500mg',
                              dosage: 'حبّة واحدة',
                              duration: '5 أيام',
                              frequency: 'عند الحاجة',
                              notes: 'للحمى فقط',
                            },
                          ].slice(0, r.medicinesCount),
                          followUpDate: r.followUpDate,
                          additionalNotes:
                            'المريض يعاني من التهاب بكتيري في الحلق، تم وصف المضاد الحيوي، متابعة بعد أسبوع.',
                        };
                        setDetailsRecord(mapped);
                        setDetailsOpen(true);
                      }}
                      className='flex h-9 w-9 items-center justify-center rounded-full border border-[#EEF2F6] bg-white text-[#667085]'
                      aria-label='تفاصيل'
                    >
                      <ChevronRight className='h-5 w-5' />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
