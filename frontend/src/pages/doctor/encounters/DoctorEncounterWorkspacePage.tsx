import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import {
  EncounterWorkspaceHeader,
  EncounterWorkspacePatientCard,
  EncounterWorkspaceSectionCard,
  buildEncounterWorkspaceDemoSections,
  mapEncounterWorkspacePatient,
  mapEncounterWorkspaceSections,
  type EncounterWorkspaceSectionKey,
} from "@/components/doctor/encounters/workspace";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useCloseDoctorPatientEncounter,
  useDoctorPatientEncounterDetail,
  useDoctorPatientFullProfile,
} from "@/hooks/doctor";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { readAuthUser } from "@/lib/cookies";

const DEFAULT_EXPANDED_SECTIONS: Record<EncounterWorkspaceSectionKey, boolean> =
  {
    prescription: true,
    lab: true,
    radiology: true,
    procedure: false,
    referral: true,
  };

export default function DoctorEncounterWorkspacePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = "", encounterId = "" } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";
  const doctorName = readAuthUser()?.fullName?.trim()
    ? /^د\.?\s/u.test(readAuthUser()!.fullName!)
      ? readAuthUser()!.fullName!
      : `د. ${readAuthUser()!.fullName}`
    : "الطبيب";

  const [expandedSections, setExpandedSections] = useState(
    DEFAULT_EXPANDED_SECTIONS,
  );
  const [closeOpen, setCloseOpen] = useState(false);
  const [useDemoSections, setUseDemoSections] = useState(false);

  const encounterQuery = useDoctorPatientEncounterDetail(
    doctorId,
    patientId,
    encounterId,
    Boolean(doctorId && patientId && encounterId),
  );

  const profileQuery = useDoctorPatientFullProfile(
    doctorId,
    patientId,
    Boolean(doctorId && patientId),
  );

  const closeEncounterMutation = useCloseDoctorPatientEncounter(doctorId);

  const patientVm = useMemo(() => {
    if (!encounterQuery.encounter) return null;
    return mapEncounterWorkspacePatient(
      encounterQuery.encounter,
      profileQuery.patient,
      profileQuery.patient?.patientId,
    );
  }, [encounterQuery.encounter, profileQuery.patient]);

  const sections = useMemo(() => {
    if (useDemoSections) return buildEncounterWorkspaceDemoSections();
    const mapped = mapEncounterWorkspaceSections(profileQuery.patient);
    const allEmpty = mapped.every((section) => section.count === 0);
    return allEmpty ? buildEncounterWorkspaceDemoSections() : mapped;
  }, [profileQuery.patient, useDemoSections]);

  const isLoading = encounterQuery.isLoading || profileQuery.isLoading;
  const isError = encounterQuery.isError || profileQuery.isError;
  const error = encounterQuery.error ?? profileQuery.error;

  const toggleSection = (key: EncounterWorkspaceSectionKey) => {
    setExpandedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSaveProgress = () => {
    toast("تم حفظ تقدم الزيارة محلياً.", {
      title: "حفظ التقدم",
      variant: "success",
    });
  };

  const handleCloseEncounter = async () => {
    if (!patientId || !encounterId) return;
    try {
      const response = await closeEncounterMutation.mutateAsync({
        patientId,
        encounterId,
      });
      toast(response.message ?? "تم إغلاق الزيارة الطبية بنجاح.", {
        title: "إغلاق الزيارة",
        variant: "success",
      });
      setCloseOpen(false);
      navigate("/doctor/encounters");
    } catch (requestError) {
      toast(getUserFacingRequestErrorMessage(requestError), {
        title: "تعذّر إغلاق الزيارة",
        variant: "error",
      });
      throw requestError;
    }
  };

  return (
    <>
      <Helmet>
        <title>الزيارة الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="w-full">
        <EncounterWorkspaceHeader doctorName={doctorName} />

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-dashed border-[#E2E8F0] bg-white">
            <Loader2
              className="w-8 h-8 animate-spin text-primary"
              aria-hidden
            />
          </div>
        ) : isError || !encounterQuery.encounter || !patientVm ? (
          <DoctorListErrorState
            title="تعذّر تحميل مساحة الزيارة الطبية"
            brief={getUserFacingRequestErrorMessage(error)}
            detail={getUserFacingRequestErrorMessage(error)}
            retrying={encounterQuery.isFetching || profileQuery.isFetching}
            onRetry={() => {
              void encounterQuery.refetch();
              void profileQuery.refetch();
            }}
          />
        ) : (
          <div className="space-y-4">
            <EncounterWorkspacePatientCard patient={patientVm} />

            <div className="space-y-4">
              {sections.map((section) => (
                <EncounterWorkspaceSectionCard
                  key={section.key}
                  section={section}
                  expanded={
                    expandedSections[section.key] ??
                    section.defaultExpanded ??
                    false
                  }
                  onToggle={() => toggleSection(section.key)}
                  onAddReferral={() =>
                    toast("إضافة التحويلات ستُربط قريباً بالـ API.", {
                      title: "تحويل طبي",
                      variant: "info",
                    })
                  }
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCloseOpen(true)}
                disabled={
                  encounterQuery.encounter.status === "closed" ||
                  closeEncounterMutation.isPending
                }
                className="inline-flex h-12 items-center justify-center rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FAF9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {closeEncounterMutation.isPending
                  ? "جارٍ إغلاق الزيارة..."
                  : "إغلاق الزيارة"}
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                className="inline-flex h-12 items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95"
              >
                حفظ التقدم
              </button>
            </div>

            {profileQuery.deniedError ? (
              <div className="rounded-[12px] border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-right font-cairo text-[12px] font-semibold text-[#B45309]">
                بعض الأقسام تعرض بيانات تجريبية لأن الوصول الكامل لملف المريض
                غير متاح حالياً.
                <button
                  type="button"
                  onClick={() => setUseDemoSections(true)}
                  className="font-extrabold underline ms-2 text-primary"
                >
                  عرض النموذج الكامل
                </button>
              </div>
            ) : null}
          </div>
        )}

        <ConfirmActionDialog
          open={closeOpen}
          onOpenChange={setCloseOpen}
          title="إغلاق الزيارة الطبية"
          description="هل أنت متأكد من إغلاق هذه الزيارة؟ تأكد من حفظ التقدم قبل المتابعة."
          confirmLabel="تأكيد الإغلاق"
          confirmDisabled={closeEncounterMutation.isPending}
          onConfirm={handleCloseEncounter}
        />

        <div className="h-10" />
      </div>
    </>
  );
}
