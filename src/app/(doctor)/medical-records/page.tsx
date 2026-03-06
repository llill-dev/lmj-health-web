'use client';

import { useMemo, useState } from 'react';
import {
  FileText,
  Search,
  Activity,
  ClipboardList,
  Files,
  CalendarDays,
  Building2,
  ChevronRight,
  X,
  Calendar,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DoctorDashboardOverview from '@/components/doctor/doctor-dashboard-overview';
import CreateMedicalRecordForm from '@/components/doctor/create-medical-record-form';
import MedicalRecordDetailsDialog, {
  type MedicalRecordDetails,
} from '@/components/doctor/medical-record-details-dialog';

type MedicalRecordItem = {
  id: string;
  systemId: string;
  patientName: string;
  patientInitial: string;
  patientPhone: string;
  date: string;
  statusLabel: string;
  facility: string;
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
    systemId: 'MR-SY-2024-00001234',
    patientName: 'أحمد محمد',
    patientInitial: 'أ',
    patientPhone: '+966501234567',
    date: '2024-02-08',
    statusLabel: 'يحتاج متابعة',
    facility: 'عيادة القلب',
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
  {
    id: 'mr-2',
    systemId: 'MR-SY-2024-00001789',
    patientName: 'فاطمة أحمد',
    patientInitial: 'ف',
    patientPhone: '+966502345678',
    date: '2024-12-01',
    statusLabel: 'طارئة',
    facility: 'قسم الطوارئ - مشفى دمشق',
    diagnosisTitle: 'التشخيص',
    diagnosisSubtitle: 'ألم حاد في الصدر - اشتباه ذبحة صدرية',
    symptoms: ['ألم صدر', 'ضيق تنفس'],
    medicinesCount: 1,
    vitals: [
      { label: 'ضغط الدم', value: '140/90' },
      { label: 'النبض', value: '92' },
      { label: 'الحرارة', value: '37.0' },
      { label: 'الوزن', value: '68' },
    ],
    followUpDate: '02-12-2024',
  },
  {
    id: 'mr-3',
    systemId: 'MR-SY-2024-00001456',
    patientName: 'أحمد محمد',
    patientInitial: 'أ',
    patientPhone: '+966501234567',
    date: '2024-11-20',
    statusLabel: 'نشط',
    facility: 'مشفى دمشق',
    diagnosisTitle: 'التشخيص',
    diagnosisSubtitle: 'الحالة الصحية جيدة بشكل عام',
    symptoms: ['تعب بسيط'],
    medicinesCount: 0,
    vitals: [
      { label: 'ضغط الدم', value: '120/80' },
      { label: 'النبض', value: '70' },
      { label: 'الحرارة', value: '36.8' },
      { label: 'الوزن', value: '74' },
    ],
    followUpDate: '01-12-2024',
  },
  {
    id: 'mr-4',
    systemId: 'MR-SY-2024-00001567',
    patientName: 'فاطمة أحمد',
    patientInitial: 'ف',
    patientPhone: '+966502345678',
    date: '2024-11-10',
    statusLabel: 'مغلق',
    facility: 'عيادة القلب',
    diagnosisTitle: 'التشخيص',
    diagnosisSubtitle:
      'المريضة أُحيلت للفحص القلبي بسبب تاريخ عائلي. الفحوصات طبيعية ولا توجد مشاكل قلبية حالياً.',
    symptoms: ['ألم خفيف'],
    medicinesCount: 1,
    vitals: [
      { label: 'ضغط الدم', value: '118/78' },
      { label: 'النبض', value: '72' },
      { label: 'الحرارة', value: '36.9' },
      { label: 'الوزن', value: '66' },
    ],
    followUpDate: '17-11-2024',
  },
  {
    id: 'mr-5',
    systemId: 'MR-SY-2023-00008912',
    patientName: 'أحمد محمد',
    patientInitial: 'أ',
    patientPhone: '+966501234567',
    date: '2023-06-15',
    statusLabel: 'متأرشفة',
    facility: 'عيادة القلب',
    diagnosisTitle: 'التشخيص',
    diagnosisSubtitle: 'التهاب اللوزتين الحاد',
    symptoms: ['حرارة', 'ألم حلق'],
    medicinesCount: 1,
    vitals: [
      { label: 'ضغط الدم', value: '110/70' },
      { label: 'النبض', value: '68' },
      { label: 'الحرارة', value: '38.2' },
      { label: 'الوزن', value: '73' },
    ],
    followUpDate: '22-06-2023',
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

            <section className='mt-5 rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)] overflow-hidden'>
              <div className='w-full overflow-x-auto'>
                <div className='min-w-max'>
                  <div className='grid grid-cols-[repeat(14,minmax(60px,80px))] items-center gap-8 border-b border-[#EEF2F6] bg-[#F9FAFB] px-6 py-4'>
                    <div className='col-span-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      System ID
                    </div>
                    <div className='col-span-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      اسم المريض
                    </div>
                    <div className='col-span-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      التشخيص
                    </div>
                    <div className='col-span-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      المنشأة
                    </div>
                    <div className='col-span-2 text-right font-cairo text-[13px] font-extrabold text-[#111827]'>
                      التاريخ
                    </div>
                    <div className='col-span-2 text-center font-cairo text-[13px] font-extrabold text-[#111827]'>
                      الحالة
                    </div>
                    <div className='col-span-2 text-center font-cairo text-[13px] font-extrabold text-[#111827]'>
                      الإجراءات
                    </div>
                  </div>

                  <div>
                    {filtered.map((r) => {
                      const statusStyle =
                        r.statusLabel === 'نشط'
                          ? 'bg-[#16C5C0] text-white'
                          : r.statusLabel === 'طارئة'
                            ? 'bg-[#F04438] text-white'
                            : r.statusLabel === 'يحتاج متابعة'
                              ? 'bg-[#F79009] text-white'
                              : r.statusLabel === 'متأرشفة'
                                ? 'bg-[#E5E7EB] text-[#344054]'
                                : 'bg-[#667085] text-white';

                      return (
                        <div
                          key={r.id}
                          className='grid items-center grid-cols-[repeat(14,minmax(60px,80px))] gap-8 border-b border-[#EEF2F6] px-6 py-4 last:border-b-0'
                        >
                          <div className='col-span-2 flex items-start justify-between gap-3 pt-1'>
                            <div className='flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-[#16C5C0] text-white shadow-[0_14px_24px_rgba(22,197,192,0.28)]'>
                              <FileText className='h-5 w-5' />
                            </div>
                            <div className='min-w-0 text-left'>
                              <div className='break-words font-cairo text-[13px] font-extrabold text-[#0FA6A3]'>
                                {r.systemId}
                              </div>
                              <div className='mt-1 font-cairo text-[13px] font-extrabold text-[#0FA6A3]'>
                                {r.id.replace('mr-', '').padStart(4, '0')}
                              </div>
                            </div>
                          </div>

                          <div className='col-span-2 flex items-start justify-start gap-3 pt-1'>
                            <div className='flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#16C5C0] text-white'>
                              <span className='font-cairo text-[14px] font-extrabold'>
                                {r.patientInitial}
                              </span>
                            </div>
                            <div className='text-right'>
                              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                                {r.patientName}
                              </div>
                              <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                                {r.patientPhone}
                              </div>
                            </div>
                          </div>

                          <div className='col-span-2 flex justify-start pt-1'>
                            <div className='w-full max-w-full rounded-[12px] border border-[#B8D3FF] bg-[#EEF5FF] px-4 py-3 text-right'>
                              <div className='whitespace-normal break-words font-cairo text-[13px] font-extrabold leading-[18px] text-[#111827]'>
                                {r.diagnosisSubtitle}
                              </div>
                            </div>
                          </div>

                          <div className='col-span-2 flex items-start justify-start gap-2 text-right pt-1'>
                            <Building2 className='h-4 w-4 text-[#F79009]' />
                            <div className='min-w-0'>
                              <div className='whitespace-normal break-words font-cairo text-[13px] font-extrabold text-[#667085]'>
                                {r.facility}
                              </div>
                            </div>
                          </div>

                          <div className='col-span-2 flex items-start justify-start gap-2 text-right pt-1'>
                            <Calendar className='h-4 w-4 text-[#98A2B3]' />
                            <span className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                              {r.date}
                            </span>
                          </div>

                          <div className='col-span-2 flex justify-center pt-1'>
                            <div
                              className={`inline-flex h-[30px] items-center justify-center rounded-[8px] px-4 font-cairo text-[12px] font-extrabold ${statusStyle}`}
                            >
                              {r.statusLabel}
                            </div>
                          </div>

                          <div className='col-span-2 flex items-center justify-center gap-4 pt-1'>
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
                              className='flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#16C5C0]'
                            >
                              <span>عرض التفاصيل</span>
                            </button>

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
                              className='flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-[#16C5C0] text-white shadow-[0_10px_18px_rgba(22,197,192,0.28)]'
                              aria-label='تفاصيل'
                            >
                              <ChevronRight className='h-5 w-5' />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between gap-4 bg-white px-6 py-4'>
                <div className='font-cairo text-[13px] font-semibold text-[#98A2B3]'>
                  عرض {filtered.length} من {mockRecords.length} سجل
                </div>
                <div className='inline-flex h-[36px] items-center justify-center rounded-[999px] bg-[#16C5C0] px-4 font-cairo text-[13px] font-extrabold text-white'>
                  إجمالي {mockRecords.length} سجل طبي
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
