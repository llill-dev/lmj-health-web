import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import {
  EncounterWorkspaceHeader,
  EncounterWorkspacePageSkeleton,
  EncounterWorkspacePatientCard,
  EncounterWorkspaceSectionCard,
  EncounterWorkspaceSectionsSkeleton,
  type EncounterWorkspaceSectionKey,
} from '@/components/doctor/encounters/workspace';
import { ENCOUNTER_WORKSPACE_SECTION_PATHS } from '@/components/doctor/encounters/workspace/encounter-workspace-types';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useCloseDoctorPatientEncounter,
  useEncounterWorkspace,
} from '@/hooks/doctor';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { readAuthUser } from '@/lib/cookies';

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
  const { patientId = '', encounterId = '' } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const authUser = readAuthUser();
  const doctorName = authUser?.fullName?.trim()
    ? /^د\.?\s/u.test(authUser.fullName)
      ? authUser.fullName
      : `د. ${authUser.fullName}`
    : 'الطبيب';

  const [expandedSections, setExpandedSections] = useState(
    DEFAULT_EXPANDED_SECTIONS,
  );
  const [closeOpen, setCloseOpen] = useState(false);

  const queryClient = useQueryClient();
  const workspace = useEncounterWorkspace(doctorId, patientId, encounterId);
  const closeEncounterMutation = useCloseDoctorPatientEncounter(doctorId);

  const sections = workspace.sections;

  const toggleSection = (key: EncounterWorkspaceSectionKey) => {
    setExpandedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const openSection = (key: EncounterWorkspaceSectionKey) => {
    navigate(ENCOUNTER_WORKSPACE_SECTION_PATHS[key](patientId, encounterId));
  };

  const handleSaveProgress = () => {
    toast('تم تحديث عرض الزيارة من الخادم.', {
      title: 'حفظ التقدم',
      variant: 'success',
    });
    workspace.refetch();
  };

  const handleCloseEncounter = async () => {
    if (!patientId || !encounterId) return;
    try {
      const response = await closeEncounterMutation.mutateAsync({
        patientId,
        encounterId,
      });
      toast(response.message ?? 'تم إغلاق الزيارة الطبية بنجاح.', {
        title: 'إغلاق الزيارة',
        variant: 'success',
      });
      setCloseOpen(false);
      await queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.encounterSummary(
          doctorId,
          patientId,
          encounterId,
        ),
      });
      navigate(`/doctor/encounters/${patientId}/${encounterId}/summary`, {
        replace: true,
      });
    } catch (requestError) {
      toast(getUserFacingRequestErrorMessage(requestError), {
        title: 'تعذّر إغلاق الزيارة',
        variant: 'error',
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

        {workspace.isEncounterLoading ? (
          <EncounterWorkspacePageSkeleton />
        ) : workspace.isError || !workspace.encounter || !workspace.patientVm ? (
          <DoctorListErrorState
            title="تعذّر تحميل مساحة الزيارة الطبية"
            brief={getUserFacingRequestErrorMessage(workspace.error)}
            detail={getUserFacingRequestErrorMessage(workspace.error)}
            retrying={workspace.isFetching}
            onRetry={workspace.refetch}
          />
        ) : (
          <div className="space-y-4">
            <EncounterWorkspacePatientCard
              patient={workspace.patientVm}
              isEnriching={workspace.isPatientEnriching}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => openSection('prescription')}
                className="flex h-12 w-full items-center justify-center rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FAF9]"
              >
                فتح الوصفة الطبية
              </button>
              <button
                type="button"
                onClick={() => openSection('radiology')}
                className="flex h-12 w-full items-center justify-center rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FAF9]"
              >
                فتح طلبات الأشعة
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => openSection('lab')}
                className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#BFEDEC] bg-[#F8FFFE] font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#E6F4F3]"
              >
                طلبات التحاليل
              </button>
              <button
                type="button"
                onClick={() => openSection('procedure')}
                className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#BFEDEC] bg-[#F8FFFE] font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#E6F4F3]"
              >
                طلبات الإجراءات
              </button>
              <button
                type="button"
                onClick={() => openSection('referral')}
                className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#BFEDEC] bg-[#F8FFFE] font-cairo text-[13px] font-extrabold text-primary transition hover:bg-[#E6F4F3]"
              >
                التحويلات الطبية
              </button>
            </div>

            {workspace.isSectionsLoading ? (
              <EncounterWorkspaceSectionsSkeleton />
            ) : (
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
                    onOpenSection={() => openSection(section.key)}
                    onAddReferral={() => openSection('referral')}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCloseOpen(true)}
                disabled={
                  workspace.encounter.status === 'closed' ||
                  closeEncounterMutation.isPending
                }
                className="inline-flex h-12 items-center justify-center rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FAF9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {closeEncounterMutation.isPending
                  ? 'جارٍ إغلاق الزيارة...'
                  : 'إغلاق الزيارة'}
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={workspace.isFetching}
                className="inline-flex h-12 items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.28)] transition hover:opacity-95 disabled:opacity-60"
              >
                {workspace.isFetching ? 'جارٍ التحديث...' : 'تحديث من الخادم'}
              </button>
            </div>

            {workspace.profileDenied ? (
              <div className="rounded-[12px] border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-right font-cairo text-[12px] font-semibold text-[#B45309]">
                الوصول الكامل لملف المريض غير متاح؛ بيانات الأقسام من طلبات هذه
                الزيارة فقط.
              </div>
            ) : null}
          </div>
        )}

        <ConfirmActionDialog
          open={closeOpen}
          onOpenChange={setCloseOpen}
          title="إغلاق الزيارة الطبية"
          description="هل أنت متأكد من إغلاق هذه الزيارة؟ تأكد من اعتماد الطلبات قبل المتابعة."
          confirmLabel="تأكيد الإغلاق"
          confirmDisabled={closeEncounterMutation.isPending}
          onConfirm={handleCloseEncounter}
        />

        <div className="h-10" />
      </div>
    </>
  );
}
