import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle, FileText, Files, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import {
  DoctorTableSkeleton,
  DoctorToolbarSkeleton,
} from "@/components/doctor/shared/skeletons";
import CreateMedicalRecordForm from "@/components/doctor/medical-records/create-medical-record-form";
import {
  MedicalRecordsPagination,
  MedicalRecordsTable,
  MedicalRecordsToolbar,
  type MedicalRecordRowVm,
} from "@/components/doctor/medical-records";
import MedicalRecordDetailsDialog, {
  type MedicalRecordDetails,
} from "@/components/doctor/medical-records/medical-record-details-dialog";
import {
  useCreateDoctorMedicalRecord,
  useDoctorMedicalRecord,
  useDoctorMedicalRecordsHub,
  useUpdateDoctorMedicalRecord,
} from "@/hooks";
import { readAuthUser } from "@/lib/cookies";
import { useToast } from "@/components/ui/ToastProvider";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";

function formatArabicDate(value?: string | null) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SA");
}

function mapRecordToDetails(
  record: NonNullable<ReturnType<typeof useDoctorMedicalRecord>["record"]>,
  patientName: string,
): MedicalRecordDetails {
  return {
    id: record._id,
    patientName,
    date: formatArabicDate(record.date || record.createdAt),
    diagnosisSubtitle: record.diagnosis || record.title || "بدون تشخيص",
    symptoms: record.title ? [record.title] : ["لا توجد أعراض موثقة"],
    vitals: [],
    medicinesCount: record.prescriptions?.length ?? 0,
    prescriptions: (record.prescriptions ?? []).map((item) => ({
      name: item,
      dosage: "—",
      duration: "—",
      frequency: "—",
      notes: "",
    })),
    followUpDate: record.followUpRequired ? "تحتاج متابعة" : "لا توجد متابعة",
    additionalNotes:
      record.attachments && record.attachments.length > 0
        ? `المرفقات: ${record.attachments.join("، ")}`
        : "لا توجد ملاحظات إضافية.",
  };
}

export default function DoctorMedicalRecordsPage() {
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] =
    useState<MedicalRecordDetails | null>(null);

  const list = useDoctorMedicalRecordsHub(doctorId, { search, page, limit });
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    list.refetch(),
  );

  const recordDetailsQuery = useDoctorMedicalRecord(
    doctorId,
    selectedPatientId,
    selectedRecordId,
    Boolean(selectedPatientId && selectedRecordId && detailsOpen),
  );
  const createMutation = useCreateDoctorMedicalRecord(doctorId);
  const updateMutation = useUpdateDoctorMedicalRecord(
    doctorId,
    selectedPatientId,
    selectedRecordId,
  );

  const selectedPatient = list.patients.find(
    (patient) => patient._id === selectedPatientId,
  );

  const editingRecord = useMemo(() => {
    if (!selectedRecordId || !selectedPatientId) return null;
    const row = list.rows.find(
      (item) =>
        item.id === selectedRecordId && item.patientId === selectedPatientId,
    );
    return row?.raw ?? null;
  }, [list.rows, selectedPatientId, selectedRecordId]);

  useEffect(() => {
    setPage(1);
  }, [search, limit]);

  useEffect(() => {
    if (page > list.totalPages) {
      setPage(list.totalPages);
    }
  }, [list.totalPages, page]);

  useEffect(() => {
    if (!recordDetailsQuery.record || !selectedPatient) return;
    setDetailsRecord(
      mapRecordToDetails(
        recordDetailsQuery.record,
        selectedPatient.user.fullName,
      ),
    );
  }, [recordDetailsQuery.record, selectedPatient]);

  const openDetails = (row: MedicalRecordRowVm) => {
    setDetailsRecord(null);
    setSelectedPatientId(row.patientId);
    setSelectedRecordId(row.id);
    setDetailsOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>السجلات الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="pb-10 w-full">
        <MedicalRecordDetailsDialog
          open={detailsOpen}
          onOpenChange={(open) => {
            setDetailsOpen(open);
            if (!open) {
              setSelectedRecordId("");
              setDetailsRecord(null);
            }
          }}
          record={detailsRecord}
        />

        <DoctorDashboardOverview
          variant="medical-records"
          surface="mint"
          kpiColumns={4}
          title="السجلات الطبية"
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {list.isAwaitingData ? "—" : list.stats.totalRecords}
              </span>
              <span className="text-primary/90"> — إجمالي السجلات</span>
            </span>
          }
          mode={mode === "edit" ? "create" : mode}
          actionLabel="إضافة سجل جديد"
          onActionClick={() => setMode("create")}
          kpis={[
            {
              key: "totalRecords",
              icon: <Files className="h-5 w-5 shrink-0" />,
              value: list.isAwaitingData ? "—" : list.stats.totalRecords,
              label: "إجمالي السجلات",
            },
            {
              key: "prescriptions",
              icon: <FileText className="h-5 w-5 shrink-0" />,
              value: list.isAwaitingData ? "—" : list.stats.prescriptions,
              label: "الوصفات المسجلة",
            },
            {
              key: "needsFollowUp",
              icon: <Activity className="h-5 w-5 shrink-0" />,
              value: list.isAwaitingData ? "—" : list.stats.needsFollowUp,
              label: "تحتاج متابعة",
            },
            {
              key: "active",
              icon: <CheckCircle className="h-5 w-5 shrink-0" />,
              value: list.isAwaitingData ? "—" : list.stats.active,
              label: "سجلات نشطة",
            },
          ]}
          overlay={
            mode !== "list" ? (
              <motion.button
                type="button"
                onClick={() => setMode("list")}
                className="absolute left-[24px] top-[24px] flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-white shadow-[0_14px_24px_rgba(0,0,0,0.16)]"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5 text-[#0F8F8B]" />
              </motion.button>
            ) : null
          }
        />

        <AnimatePresence mode="wait" initial={false}>
          {mode === "create" || mode === "edit" ? (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <CreateMedicalRecordForm
                patients={list.patients.map((patient) => ({
                  id: patient._id,
                  name: patient.user.fullName,
                }))}
                title={
                  mode === "edit" ? "تعديل السجل الطبي" : "إنشاء سجل طبي جديد"
                }
                description={
                  mode === "edit"
                    ? "يمكنك تعديل الحقول التي يدعمها الـ API الحالي ثم حفظ التغييرات."
                    : "سيتم حفظ العنوان والتشخيص والوصفات النصية وحالة المتابعة فقط في هذا الإصدار."
                }
                submitLabel={mode === "edit" ? "حفظ التعديلات" : "حفظ السجل"}
                patientLocked={mode === "edit"}
                initialValues={
                  mode === "edit" && editingRecord
                    ? {
                        patientId: selectedPatientId,
                        title: editingRecord.title ?? "",
                        diagnosis: editingRecord.diagnosis ?? "",
                        prescriptions: editingRecord.prescriptions ?? [],
                        followUpRequired: Boolean(
                          editingRecord.followUpRequired,
                        ),
                      }
                    : selectedPatientId
                      ? { patientId: selectedPatientId }
                      : undefined
                }
                onCancel={() => setMode("list")}
                onSave={async (payload) => {
                  try {
                    if (mode === "edit" && selectedRecordId) {
                      await updateMutation.mutateAsync({
                        title: payload.title,
                        diagnosis: payload.diagnosis,
                        prescriptions:
                          payload.prescriptions.length > 0
                            ? payload.prescriptions
                            : undefined,
                        followUpRequired: payload.followUpRequired,
                      });
                      toast("تم تحديث السجل الطبي بنجاح", {
                        title: "تم الحفظ",
                        variant: "success",
                      });
                    } else {
                      await createMutation.mutateAsync({
                        patientId: payload.patientId,
                        body: {
                          title: payload.title,
                          diagnosis: payload.diagnosis,
                          prescriptions:
                            payload.prescriptions.length > 0
                              ? payload.prescriptions
                              : undefined,
                          followUpRequired: payload.followUpRequired,
                        },
                      });
                      toast("تم إنشاء السجل الطبي بنجاح", {
                        title: "تم الحفظ",
                        variant: "success",
                      });
                    }
                    setSelectedPatientId(payload.patientId);
                    setSelectedRecordId("");
                    setMode("list");
                    void list.refetch();
                  } catch (error) {
                    toast(getUserFacingRequestErrorMessage(error), {
                      title: "فشلت العملية",
                      variant: "error",
                    });
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-6">
                <MedicalRecordsToolbar
                  search={search}
                  onSearchChange={setSearch}
                />

                <div className="mt-6">
                  {list.isAwaitingData && !list.rows.length ? (
                    <div className="space-y-4">
                      <DoctorToolbarSkeleton tabs={0} />
                      <DoctorTableSkeleton rows={8} columns={7} />
                    </div>
                  ) : list.isError ? (
                    <DoctorListErrorState
                      title="تعذّر تحميل السجلات الطبية"
                      brief={getUserFacingRequestErrorMessage(list.error)}
                      retrying={retryingList}
                      onRetry={() => void retryList()}
                    />
                  ) : (
                    <MedicalRecordsTable
                      rows={list.rows}
                      onOpenDetails={openDetails}
                    />
                  )}
                </div>
              </section>

              {!list.isAwaitingData && !list.isError ? (
                <div className="mt-5">
                  <MedicalRecordsPagination
                    page={list.page}
                    totalPages={list.totalPages}
                    showingFrom={list.showingFrom}
                    showingTo={list.showingTo}
                    total={list.total}
                    pageSize={limit}
                    disabled={false}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setLimit(size);
                      setPage(1);
                    }}
                  />
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
