'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils/utils';
import {
  OrderClinicalFormSubmitError,
  OrderItemsRequiredError,
} from '@/lib/doctor/orderClinicalFormSchema';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import {
  RadiologyActionButtons,
  RadiologyCatalogPicker,
  RadiologyPageHeader,
  RadiologySelectedItemCard,
} from '@/components/doctor/radiology';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { useToast } from '@/components/ui/ToastProvider';
import type { useEncounterOrderWorkspace } from '@/hooks/doctor/useEncounterOrderWorkspace';
import {
  ENCOUNTER_ORDER_CONFIG,
  type CatalogOrderCategory,
} from './encounter-order-config';
import { OrderClinicalFields } from './order-clinical-fields';

type Workspace = ReturnType<typeof useEncounterOrderWorkspace>;

export function EncounterOrderWorkspaceShell({
  category,
  patientId,
  encounterId,
  workspace,
  patientName,
  fileNumber,
  onNavigate,
}: {
  category: CatalogOrderCategory;
  patientId: string;
  encounterId: string;
  workspace: Workspace;
  patientName: string;
  fileNumber?: string;
  onNavigate: (path: string, options?: { replace?: boolean }) => void;
}) {
  const config = ENCOUNTER_ORDER_CONFIG[category];
  const { toast } = useToast();
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleSubmitError = useCallback(
    (error: unknown, toastTitle: string) => {
      const { toastMessage } = workspace.handleSubmitError(error);
      toast(toastMessage, {
        title: toastTitle,
        variant: 'error',
        durationMs: 5200,
      });
    },
    [workspace, toast],
  );

  const backTo = config.hubPath(patientId, encounterId);
  const manualPath = `/doctor/encounters/${patientId}/${encounterId}/${config.manualPathSuffix}`;

  if (!patientId || !encounterId) {
    return (
      <DoctorListErrorState
        title="رابط غير صالح"
        brief="معرّف المريض أو الزيارة مفقود."
        onRetry={() => onNavigate(backTo)}
      />
    );
  }

  if (workspace.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-dashed border-[#E2E8F0] bg-white font-cairo text-[14px] font-semibold text-[#667085]">
        {config.loadingLabel}
      </div>
    );
  }

  if (workspace.isError) {
    return (
      <DoctorListErrorState
        title={config.errorTitle}
        brief={workspace.getErrorMessage(workspace.error)}
        onRetry={workspace.refetch}
      />
    );
  }

  return (
    <>
      <RadiologyPageHeader
        patientName={patientName}
        fileNumber={fileNumber}
        statusLabel={workspace.statusLabel}
        backTo={backTo}
        title={config.pageTitle}
        subtitle={
          patientName && fileNumber
            ? `${patientName} — ${fileNumber}`
            : config.patientSubtitle(patientName)
        }
        icon={config.headerIcon}
      />

      <RadiologyCatalogPicker
        items={workspace.catalogItems}
        loading={workspace.catalogLoading}
        catalogSectionLabel={config.catalogSectionLabel}
        searchPlaceholder={config.searchPlaceholder}
        tabs={config.catalogTabs}
        disabled={!workspace.isEditable || workspace.isBusy}
        onOpenManual={() => {
          if (config.supportsManual) {
            onNavigate(manualPath);
            return;
          }
          toast('الإدخال اليدوي غير متاح لهذا القسم.', { variant: 'info' });
        }}
        onAddCatalogItem={async (item) => {
          try {
            await workspace.addCatalogItem(item);
            toast(config.catalogAddToast, { variant: 'success' });
          } catch (error) {
            toast(workspace.getErrorMessage(error), { variant: 'error' });
          }
        }}
      />

      <OrderClinicalFields
        value={workspace.clinical}
        onChange={workspace.setClinical}
        disabled={!workspace.isEditable || workspace.isBusy}
        variant={config.clinicalVariant}
        centerInstructionsLabel={config.centerInstructionsLabel}
        fieldErrors={workspace.clinicalFieldErrors}
        showFastingCheckbox={category === 'lab'}
      />

      <section
        className={cn(
          'mb-6',
          workspace.itemsSectionError &&
            'rounded-[12px] border border-[#F04438] bg-[#FFFBFB] p-3',
        )}
      >
        <h2 className="mb-3 text-right font-cairo text-[14px] font-extrabold text-[#667085]">
          {config.selectedSectionTitle(workspace.items.length)}
        </h2>
        {workspace.itemsSectionError ? (
          <p
            role="alert"
            className="mb-3 text-right font-cairo text-[11px] font-bold text-[#D92D20]"
          >
            {workspace.itemsSectionError}
          </p>
        ) : null}
        {workspace.items.length === 0 ? (
          <div
            className={cn(
              'rounded-[12px] border border-dashed py-8 text-center font-cairo text-[13px] font-semibold',
              workspace.itemsSectionError
                ? 'border-[#FDA29B] bg-white text-[#D92D20]'
                : 'border-[#BFEDEC] bg-[#F8FFFE] text-[#667085]',
            )}
          >
            {config.emptySelectedHint}
          </div>
        ) : (
          <div className="space-y-3">
            {workspace.items.map((item) => (
              <RadiologySelectedItemCard
                key={item.id}
                item={item}
                onEdit={
                  config.supportsManual
                    ? () => onNavigate(manualPath)
                    : undefined
                }
                onDelete={() => setDeleteTargetId(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      <RadiologyActionButtons
        saving={workspace.isBusy}
        disabled={!workspace.isEditable}
        onSaveDraft={async () => {
          try {
            workspace.setClinicalFieldErrors({});
            workspace.setItemsSectionError(undefined);
            const res = await workspace.saveDraft();
            toast(res.message ?? 'تم حفظ المسودة.', {
              title: 'تم الحفظ',
              variant: 'success',
            });
          } catch (error) {
            handleSubmitError(error, 'تعذّر حفظ المسودة');
          }
        }}
        onPreview={async () => {
          try {
            workspace.setClinicalFieldErrors({});
            workspace.setItemsSectionError(undefined);
            await workspace.preview();
            onNavigate(config.previewPath(patientId, encounterId));
          } catch (error) {
            handleSubmitError(error, 'تعذّر المعاينة');
          }
        }}
        onFinalize={() => {
          try {
            workspace.setClinicalFieldErrors({});
            workspace.setItemsSectionError(undefined);
            workspace.validateClinicalForm('finalize');
            workspace.assertHasOrderItems();
            setFinalizeOpen(true);
          } catch (error) {
            handleSubmitError(error, 'بيانات الطلب غير مكتملة');
          }
        }}
      />

      <ConfirmActionDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title={config.deleteItemTitle}
        description="هل تريد حذف هذا البند من الطلب؟"
        confirmLabel="حذف"
        onConfirm={async () => {
          if (!deleteTargetId) return;
          try {
            await workspace.deleteItem(deleteTargetId);
            toast('تم الحذف.', { variant: 'success' });
            setDeleteTargetId(null);
          } catch (error) {
            toast(workspace.getErrorMessage(error), { variant: 'error' });
          }
        }}
      />

      <ConfirmActionDialog
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
        title={config.finalizeTitle}
        description={config.finalizeDescription(workspace.items.length)}
        confirmLabel="تأكيد"
        confirmDisabled={workspace.items.length === 0 || workspace.isBusy}
        onConfirm={async () => {
          try {
            workspace.setClinicalFieldErrors({});
            workspace.setItemsSectionError(undefined);
            await workspace.finalize();
            toast('تم اعتماد الطلب.', {
              title: 'تم الاعتماد',
              variant: 'success',
            });
            setFinalizeOpen(false);
            onNavigate(backTo, { replace: true });
          } catch (error) {
            if (
              error instanceof OrderClinicalFormSubmitError ||
              error instanceof OrderItemsRequiredError
            ) {
              setFinalizeOpen(false);
            }
            handleSubmitError(error, 'تعذّر الاعتماد النهائي');
          }
        }}
      />
    </>
  );
}
