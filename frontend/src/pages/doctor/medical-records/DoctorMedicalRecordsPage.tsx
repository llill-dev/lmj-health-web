import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  ChevronRight,
  FileText,
  Files,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import CreateMedicalRecordForm from '@/components/doctor/medical-records/create-medical-record-form';
import MedicalRecordDetailsDialog, {
  type MedicalRecordDetails,
} from '@/components/doctor/medical-records/medical-record-details-dialog';
import {
  useCreateDoctorMedicalRecord,
  useDoctorMedicalRecord,
  useDoctorMedicalRecords,
  useDoctorPatients,
} from '@/hooks';
import { readAuthUser } from '@/lib/cookies';
import { useToast } from '@/components/ui/ToastProvider';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import StyledSelect from '@/components/ui/styled-select';

function formatArabicDate(value?: string | null) {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-SA');
}

function mapRecordToDetails(
  record: NonNullable<ReturnType<typeof useDoctorMedicalRecord>['record']>,
  patientName: string,
): MedicalRecordDetails {
  return {
    id: record._id,
    patientName,
    date: formatArabicDate(record.date || record.createdAt),
    diagnosisSubtitle: record.diagnosis || record.title || 'بدون تشخيص',
    symptoms: record.title ? [record.title] : ['لا توجد أعراض موثقة'],
    vitals: [],
    medicinesCount: record.prescriptions?.length ?? 0,
    prescriptions: (record.prescriptions ?? []).map((item) => ({
      name: item,
      dosage: '—',
      duration: '—',
      frequency: '—',
      notes: '',
    })),
    followUpDate: record.followUpRequired ? 'تحتاج متابعة' : 'لا توجد متابعة',
    additionalNotes:
      record.attachments && record.attachments.length > 0
        ? `المرفقات: ${record.attachments.join('، ')}`
        : 'لا توجد ملاحظات إضافية.',
  };
}

export default function DoctorMedicalRecordsPage() {
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState<MedicalRecordDetails | null>(
    null,
  );

  const patientsQuery = useDoctorPatients({ page: 1, limit: 100 });
  const recordsQuery = useDoctorMedicalRecords(
    doctorId,
    selectedPatientId,
    Boolean(selectedPatientId),
  );
  const recordDetailsQuery = useDoctorMedicalRecord(
    doctorId,
    selectedPatientId,
    selectedRecordId,
    Boolean(selectedPatientId && selectedRecordId),
  );
  const createMutation = useCreateDoctorMedicalRecord(doctorId);

  const selectedPatient = patientsQuery.patients.find(
    (patient) => patient._id === selectedPatientId,
  );

  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return recordsQuery.records.filter((record) => {
      if (!q) return true;
      return (
        (record.title ?? '').toLowerCase().includes(q) ||
        (record.diagnosis ?? '').toLowerCase().includes(q)
      );
    });
  }, [recordsQuery.records, searchTerm]);

  const needsFollowUpCount = recordsQuery.records.filter(
    (record) => record.followUpRequired,
  ).length;

  useEffect(() => {
    if (!recordDetailsQuery.record || !selectedPatient) return;
    setDetailsRecord(
      mapRecordToDetails(
        recordDetailsQuery.record,
        selectedPatient.user.fullName,
      ),
    );
    setDetailsOpen(true);
  }, [recordDetailsQuery.record, selectedPatient]);

  return (
    <>
      <Helmet>
        <title>Medical Records • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <MedicalRecordDetailsDialog
          open={detailsOpen}
          onOpenChange={(open) => {
            setDetailsOpen(open);
            if (!open) {
              setSelectedRecordId('');
              setDetailsRecord(null);
            }
          }}
          record={detailsRecord}
        />

        <DoctorDashboardOverview
          variant='medical-records'
          title='السجلات الطبية'
          subtitle='اختر مريضاً لعرض سجلاته الطبية وإنشاء سجل جديد.'
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
              >
                <X className='h-5 w-5 text-[#0F8F8B]' />
              </motion.button>
            ) : null
          }
          kpis={[
            {
              key: 'totalRecords',
              icon: <Files />,
              value: selectedPatientId ? recordsQuery.records.length : '—',
              label: 'إجمالي السجلات',
            },
            {
              key: 'activePrescriptions',
              icon: <FileText />,
              value: selectedPatientId
                ? recordsQuery.records.reduce(
                    (sum, record) => sum + (record.prescriptions?.length ?? 0),
                    0,
                  )
                : '—',
              label: 'الوصفات المسجلة',
            },
            {
              key: 'needsFollowUp',
              icon: <Activity />,
              value: selectedPatientId ? needsFollowUpCount : '—',
              label: 'تحتاج متابعة',
            },
          ]}
        />

        <section className='mt-5 rounded-[18px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.08)]'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]'>
            <div>
              <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                اختر المريض
              </div>
              <StyledSelect
                size='sm'
                tone='muted'
                value={selectedPatientId}
                onChange={setSelectedPatientId}
                placeholder='اختر المريض...'
                options={patientsQuery.patients.map((patient) => ({
                  value: patient._id,
                  label: patient.user.fullName,
                }))}
                emptyTriggerLabel='لا يوجد مرضى'
                listboxAriaLabel='اختيار المريض'
              />
            </div>

            <div>
              <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#111827]'>
                ابحث داخل سجلات المريض
              </div>
              <div className='relative'>
                <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                  <Search className='h-4 w-4' />
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='ابحث عن تشخيص أو عنوان السجل...'
                  className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pr-4 pl-10 font-cairo text-[13px] font-semibold text-[#111827] outline-none'
                />
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence mode='wait' initial={false}>
          {mode === 'create' ? (
            <motion.div
              key='create'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <CreateMedicalRecordForm
                patients={patientsQuery.patients.map((patient) => ({
                  id: patient._id,
                  name: patient.user.fullName,
                }))}
                onCancel={() => setMode('list')}
                onSave={async (payload) => {
                  try {
                    await createMutation.mutateAsync({
                      patientId: payload.patientId,
                      body: {
                        title: payload.address,
                        diagnosis: payload.diagnosis,
                        prescriptions: payload.treatment
                          ? [payload.treatment]
                          : undefined,
                        followUpRequired: Boolean(payload.followUpDate),
                      },
                    });
                    toast('تم إنشاء السجل الطبي بنجاح', {
                      title: 'تم الحفظ',
                      variant: 'success',
                    });
                    setSelectedPatientId(payload.patientId);
                    setMode('list');
                  } catch (error) {
                    toast(getUserFacingRequestErrorMessage(error), {
                      title: 'فشلت العملية',
                      variant: 'error',
                    });
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key='list'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {!selectedPatientId ? (
                <section className='mt-5 rounded-[18px] border border-dashed border-[#D0D5DD] bg-white px-6 py-12 text-center'>
                  <UserRound className='mx-auto h-10 w-10 text-[#98A2B3]' />
                  <div className='mt-4 font-cairo text-[15px] font-extrabold text-[#111827]'>
                    اختر مريضاً أولاً
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    الـ API يعرض السجلات الطبية لكل مريض على حدة.
                  </div>
                </section>
              ) : recordsQuery.isLoading ? (
                <section className='mt-5 rounded-[18px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]'>
                  جارٍ تحميل السجلات الطبية...
                </section>
              ) : recordsQuery.error ? (
                <section className='mt-5 rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center font-cairo text-[14px] font-semibold text-[#B42318]'>
                  {getUserFacingRequestErrorMessage(recordsQuery.error)}
                </section>
              ) : filteredRecords.length === 0 ? (
                <section className='mt-5 rounded-[18px] border border-dashed border-[#D0D5DD] bg-white px-6 py-12 text-center'>
                  <FileText className='mx-auto h-10 w-10 text-[#98A2B3]' />
                  <div className='mt-4 font-cairo text-[15px] font-extrabold text-[#111827]'>
                    لا توجد سجلات طبية لهذا المريض
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                    يمكنك إنشاء أول سجل من زر "إضافة سجل جديد".
                  </div>
                </section>
              ) : (
                <section className='mt-5 mb-8 rounded-[18px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.10)] overflow-hidden'>
                  <div className='border-b border-[#EEF2F6] bg-[#F9FAFB] px-6 py-4 text-right'>
                    <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                      سجلات {selectedPatient?.user.fullName}
                    </div>
                    <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                      {filteredRecords.length} سجل
                    </div>
                  </div>

                  <div className='divide-y divide-[#EEF2F6]'>
                    {filteredRecords.map((record) => (
                      <div
                        key={record._id}
                        className='flex items-center justify-between gap-4 px-6 py-5 hover:bg-[#F9FAFB]'
                      >
                        <div className='min-w-0 flex-1 text-right'>
                          <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                            {record.title || 'بدون عنوان'}
                          </div>
                          <div className='mt-1 font-cairo text-[13px] font-semibold text-[#667085]'>
                            {record.diagnosis || 'بدون تشخيص'}
                          </div>
                          <div className='mt-2 flex flex-wrap justify-end gap-2 text-[11px]'>
                            <span className='rounded-full bg-[#EEF6FF] px-3 py-1 font-cairo font-extrabold text-[#2563EB]'>
                              {formatArabicDate(record.date || record.createdAt)}
                            </span>
                            <span className='rounded-full bg-[#F9FAFB] px-3 py-1 font-cairo font-extrabold text-[#667085]'>
                              {record.prescriptions?.length ?? 0} وصفة
                            </span>
                            {record.followUpRequired ? (
                              <span className='rounded-full bg-[#FEF6EE] px-3 py-1 font-cairo font-extrabold text-[#F79009]'>
                                تحتاج متابعة
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <button
                          type='button'
                          onClick={() => {
                            setSelectedRecordId(record._id);
                          }}
                          className='flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_10px_18px_rgba(15,143,139,0.28)]'
                          aria-label='عرض التفاصيل'
                        >
                          <ChevronRight className='h-5 w-5' />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
