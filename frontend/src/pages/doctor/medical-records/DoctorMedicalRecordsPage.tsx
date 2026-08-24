import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle, FileDown, FileText, Files, X } from "lucide-react";
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
import { generateDoctorDocumentPdf, openPdfBlobInNewTab } from "@/lib/doctor/orders/doctorOrderDocuments";
import { useI18n } from "@/i18n/provider";

function formatLocaleDate(value: string | null | undefined, locale: string) {
  if (!value) return locale === "ar" ? "غير محدد" : "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");
}

function mapRecordToDetails(
  record: NonNullable<ReturnType<typeof useDoctorMedicalRecord>["record"]>,
  patientName: string,
  locale: string,
): MedicalRecordDetails {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  return {
    id: record._id,
    patientName,
    date: formatLocaleDate(record.date || record.createdAt, locale),
    diagnosisSubtitle:
      record.diagnosis || record.title || tr("بدون تشخيص", "No diagnosis"),
    symptoms: record.title
      ? [record.title]
      : [tr("لا توجد أعراض موثقة", "No documented symptoms")],
    vitals: [],
    medicinesCount: record.prescriptions?.length ?? 0,
    prescriptions: (record.prescriptions ?? []).map((item) => ({
      name: item,
      dosage: "—",
      duration: "—",
      frequency: "—",
      notes: "",
    })),
    followUpDate: record.followUpRequired
      ? tr("تحتاج متابعة", "Follow-up needed")
      : tr("لا توجد متابعة", "No follow-up"),
    additionalNotes:
      record.attachments && record.attachments.length > 0
        ? tr(
            `المرفقات: ${record.attachments.join("، ")}`,
            `Attachments: ${record.attachments.join(", ")}`,
          )
        : tr("لا توجد ملاحظات إضافية.", "No additional notes."),
  };
}

export default function DoctorMedicalRecordsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
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
        locale,
      ),
    );
  }, [recordDetailsQuery.record, selectedPatient, locale]);

  const openDetails = (row: MedicalRecordRowVm) => {
    setDetailsRecord(null);
    setSelectedPatientId(row.patientId);
    setSelectedRecordId(row.id);
    setDetailsOpen(true);
  };

  const openEdit = (row: MedicalRecordRowVm) => {
    setSelectedPatientId(row.patientId);
    setSelectedRecordId(row.id);
    setMode('edit');
  };

  const handleDownloadPdf = async (row: MedicalRecordRowVm) => {
    try {
      toast(tr("جارٍ إنشاء ملف PDF...", "Generating PDF..."), {
        title: tr("تحميل التقرير", "Download report"),
        variant: "info",
      });
      const blob = await generateDoctorDocumentPdf({
        sourceType: "diagnosis",
        sourceId: row.id,
      });
      const filename = `medical-record-${row.systemId}-${row.id.slice(-6)}.pdf`;
      openPdfBlobInNewTab(blob, filename);
      toast(tr("تم إنشاء ملف PDF بنجاح", "PDF created successfully"), {
        title: tr("نجح التحميل", "Download succeeded"),
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr("فشل إنشاء ملف PDF", "Failed to create PDF"),
        variant: "error",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {tr("السجلات الطبية • LMJ Health", "Medical Records • LMJ Health")}
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
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
          title={tr("السجلات الطبية", "Medical Records")}
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {list.isAwaitingData ? "—" : list.stats.totalRecords}
              </span>
              <span className="text-primary/90">
                {tr(" — إجمالي السجلات", " — total records")}
              </span>
            </span>
          }
          mode={mode === "edit" ? "create" : mode}
          actionLabel={tr("إضافة سجل جديد", "Add new record")}
          onActionClick={() => setMode("create")}
          kpis={[
            {
              key: "totalRecords",
              icon: <Files className="h-5 w-5 shrink-0" />,
              value: list.isAwaitingData ? "—" : list.stats.totalRecords,
              label: tr("إجمالي السجلات", "Total records"),
            },
            {
              key: "prescriptions",
              icon: <FileText className="h-5 w-5 shrink-0" />,
              value: list.isAwaitingData ? "—" : list.stats.prescriptions,
              label: tr("الوصفات المسجلة", "Prescriptions"),
            },
            {
              key: "needsFollowUp",
              icon: <Activity className="h-5 w-5 shrink-0" />,
              value: list.isAwaitingData ? "—" : list.stats.needsFollowUp,
              label: tr("تحتاج متابعة", "Needs follow-up"),
            },
            {
              key: "active",
              icon: <CheckCircle className="h-5 w-5 shrink-0" />,
              value: list.isAwaitingData ? "—" : list.stats.active,
              label: tr("سجلات نشطة", "Active records"),
            },
          ]}
          overlay={
            mode !== "list" ? (
              <motion.button
                type="button"
                onClick={() => setMode("list")}
                className="absolute start-4 top-4 flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-white shadow-[0_14px_24px_rgba(0,0,0,0.16)] sm:start-[24px] sm:top-[24px]"
                aria-label={tr("إغلاق", "Close")}
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
                  mode === "edit"
                    ? tr("تعديل السجل الطبي", "Edit medical record")
                    : tr("إنشاء سجل طبي جديد", "Create new medical record")
                }
                description={
                  mode === "edit"
                    ? tr(
                        "يمكنك تعديل الحقول التي يدعمها الـ API الحالي ثم حفظ التغييرات.",
                        "You can edit the fields supported by the current API, then save the changes.",
                      )
                    : tr(
                        "سيتم حفظ العنوان والتشخيص والوصفات النصية وحالة المتابعة فقط في هذا الإصدار.",
                        "Only the title, diagnosis, text prescriptions, and follow-up status will be saved in this version.",
                      )
                }
                submitLabel={mode === "edit" ? tr("حفظ التعديلات", "Save changes") : tr("حفظ السجل", "Save record")}
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
                      toast(tr("تم تحديث السجل الطبي بنجاح", "The medical record was updated successfully"), {
                        title: tr("تم الحفظ", "Saved"),
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
                      toast(tr("تم إنشاء السجل الطبي بنجاح", "The medical record was created successfully"), {
                        title: tr("تم الحفظ", "Saved"),
                        variant: "success",
                      });
                    }
                    setSelectedPatientId(payload.patientId);
                    setSelectedRecordId("");
                    setMode("list");
                    void list.refetch();
                  } catch (error) {
                    toast(getUserFacingRequestErrorMessage(error), {
                      title: tr("فشلت العملية", "Operation failed"),
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
                  onClear={() => setSearch('')}
                />

                <div className="mt-5 sm:mt-6">
                  {list.isAwaitingData && !list.rows.length ? (
                    <div className="space-y-4">
                      <DoctorToolbarSkeleton tabs={0} />
                      <DoctorTableSkeleton rows={8} columns={7} />
                    </div>
                  ) : list.isError ? (
                    <DoctorListErrorState
                      title={tr("تعذّر تحميل السجلات الطبية", "Failed to load medical records")}
                      brief={getUserFacingRequestErrorMessage(list.error)}
                      retrying={retryingList}
                      onRetry={() => void retryList()}
                    />
                  ) : (
                    <MedicalRecordsTable
                      rows={list.rows}
                      onOpenDetails={openDetails}
                      onEdit={openEdit}
                      onDownloadPdf={handleDownloadPdf}
                      onAddNew={() => {
                        setMode('create');
                        setSelectedPatientId('');
                      }}
                      isFiltered={search.trim() !== ''}
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
