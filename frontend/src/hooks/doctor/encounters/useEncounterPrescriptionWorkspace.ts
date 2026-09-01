'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAwaitingAnyInitialQueryData } from '@/lib/query/queryUi';
import {
  mapPrescriptionItemsToUi,
  mapUiItemToApiBody,
} from '@/components/doctor/prescription/map-prescription-ui';
import type { PrescriptionDraftForm } from '@/components/doctor/prescription/prescription-types';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { consumePrescriptionTemplateDraft } from '@/lib/doctor/templates/consumeTemplateDraft';
import { loadEncounterPrescriptionForWorkspace } from '@/lib/doctor/encounters/encounterPrescriptionLoad';
import {
  clearDoctorTemplateDraft,
  readDoctorTemplateDraft,
} from '@/lib/doctor/templates/templateDraftStorage';
import { useI18n } from '@/i18n/provider';

export function useEncounterPrescriptionWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEnabled =
    enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(encounterId);

  const encounterQuery = useQuery({
    queryKey: doctorPatientsQueryKeys.encounterDetail(
      doctorId,
      patientId,
      encounterId,
    ),
    queryFn: () =>
      doctorApi.patients.getEncounter(doctorId, patientId, encounterId),
    enabled: isEnabled,
    staleTime: 1000 * 30,
  });

  const prescriptionQuery = useQuery({
    queryKey: doctorPatientsQueryKeys.encounterPrescription(
      doctorId,
      patientId,
      encounterId,
    ),
    queryFn: () =>
      loadEncounterPrescriptionForWorkspace(doctorId, patientId, encounterId),
    enabled: isEnabled && Boolean(encounterQuery.data?.encounter),
    staleTime: 1000 * 30,
  });

  const [generalInstructions, setGeneralInstructions] = useState('');
  const [appliedTemplateDraftName, setAppliedTemplateDraftName] = useState<
    string | null
  >(null);
  const [templateDraftNotice, setTemplateDraftNotice] = useState<string | null>(
    null,
  );
  const templateDraftAppliedRef = useRef(false);

  useEffect(() => {
    setGeneralInstructions(prescriptionQuery.data?.generalInstructions ?? '');
  }, [prescriptionQuery.data?.generalInstructions]);

  const medications = useMemo(
    () => mapPrescriptionItemsToUi(prescriptionQuery.data),
    [prescriptionQuery.data],
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: doctorPatientsQueryKeys.encounterPrescription(
        doctorId,
        patientId,
        encounterId,
      ),
    });
    queryClient.invalidateQueries({
      queryKey: doctorPatientsQueryKeys.encounterSummary(
        doctorId,
        patientId,
        encounterId,
      ),
    });
    void queryClient.invalidateQueries({
      queryKey: doctorPatientsQueryKeys.encounterWorkspace(
        doctorId,
        patientId,
        encounterId,
      ),
    });
  }, [doctorId, encounterId, patientId, queryClient]);

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const prescriptionId = prescriptionQuery.data?._id;
      if (!prescriptionId) throw new Error('missing_prescription');

      const trimmed = generalInstructions.trim();
      const serverValue = (prescriptionQuery.data?.generalInstructions ?? '').trim();

      if (trimmed === serverValue) {
        return {
          message: t('doctor.encounterWorkspace.prescription.noInstructionsChange'),
          prescription: prescriptionQuery.data,
        };
      }

      return doctorApi.patients.updateEncounterPrescription(
        doctorId,
        patientId,
        encounterId,
        prescriptionId,
        { generalInstructions: trimmed },
      );
    },
    onSuccess: invalidate,
  });

  const resolvePrescriptionId = useCallback(async () => {
    const fresh = await queryClient.fetchQuery({
      queryKey: doctorPatientsQueryKeys.encounterPrescription(
        doctorId,
        patientId,
        encounterId,
      ),
      queryFn: () =>
        loadEncounterPrescriptionForWorkspace(doctorId, patientId, encounterId),
    });
    const prescriptionId = fresh?._id;
    if (!prescriptionId) throw new Error('missing_prescription');
    return prescriptionId;
  }, [doctorId, encounterId, patientId, queryClient]);

  const addItemMutation = useMutation({
    mutationFn: async (values: PrescriptionDraftForm) => {
      const prescriptionId = await resolvePrescriptionId();
      const response = await doctorApi.patients.addEncounterPrescriptionItem(
        doctorId,
        patientId,
        encounterId,
        prescriptionId,
        mapUiItemToApiBody(values),
      );
      await queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.encounterPrescription(
          doctorId,
          patientId,
          encounterId,
        ),
      });
      return response;
    },
    onSuccess: invalidate,
  });

  useEffect(() => {
    if (!isEnabled || templateDraftAppliedRef.current) return;
    if (!prescriptionQuery.data || prescriptionQuery.isLoading) return;

    const draft = readDoctorTemplateDraft();
    if (!draft || draft.type !== 'PRESCRIPTION') return;

    templateDraftAppliedRef.current = true;

    void (async () => {
      const existingCount = mapPrescriptionItemsToUi(prescriptionQuery.data).length;
      const result = await consumePrescriptionTemplateDraft({
        draft,
        existingInstructions:
          prescriptionQuery.data?.generalInstructions ?? '',
        existingItemCount: existingCount,
        setGeneralInstructions,
        addItem: (item) => addItemMutation.mutateAsync(item),
      });

      if (result.consumed) {
        clearDoctorTemplateDraft();
        if (result.skipReason !== 'empty') {
          setAppliedTemplateDraftName(draft.name);
        }
        return;
      }

      if (result.skipReason === 'existing_items') {
        setTemplateDraftNotice(
          t(
            'doctor.encounterWorkspace.prescription.templateSkippedExistingItems',
          ).replace('{name}', draft.name),
        );
        return;
      }

      if (result.skipReason === 'partial_failure') {
        clearDoctorTemplateDraft();
        setTemplateDraftNotice(
          t(
            'doctor.encounterWorkspace.prescription.templatePartiallyApplied',
          ).replace('{name}', draft.name),
        );
      }
    })();
  }, [
    addItemMutation,
    isEnabled,
    prescriptionQuery.data,
    prescriptionQuery.isLoading,
  ]);

  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      values,
    }: {
      itemId: string;
      values: PrescriptionDraftForm;
    }) => {
      const prescriptionId = await resolvePrescriptionId();
      return doctorApi.patients.updateEncounterPrescriptionItem(
        doctorId,
        patientId,
        encounterId,
        prescriptionId,
        itemId,
        mapUiItemToApiBody(values),
      );
    },
    onSuccess: invalidate,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const prescriptionId = await resolvePrescriptionId();
      return doctorApi.patients.deleteEncounterPrescriptionItem(
        doctorId,
        patientId,
        encounterId,
        prescriptionId,
        itemId,
      );
    },
    onSuccess: invalidate,
  });

  const duplicateItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const prescriptionId = await resolvePrescriptionId();
      return doctorApi.patients.duplicateEncounterPrescriptionItem(
        doctorId,
        patientId,
        encounterId,
        prescriptionId,
        itemId,
      );
    },
    onSuccess: invalidate,
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      const fresh = await queryClient.fetchQuery({
        queryKey: doctorPatientsQueryKeys.encounterPrescription(
          doctorId,
          patientId,
          encounterId,
        ),
        queryFn: () =>
          loadEncounterPrescriptionForWorkspace(
            doctorId,
            patientId,
            encounterId,
          ),
      });

      const prescriptionId = fresh?._id;
      if (!prescriptionId) throw new Error('missing_prescription');

      const itemCount = mapPrescriptionItemsToUi(fresh).length;
      if (itemCount === 0) {
        throw new Error('errors.prescription.finalizeRequiresItems');
      }

      const trimmed = generalInstructions.trim();
      const serverValue = (fresh.generalInstructions ?? '').trim();
      if (trimmed !== serverValue) {
        await doctorApi.patients.updateEncounterPrescription(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
          { generalInstructions: trimmed },
        );
      }

      return doctorApi.patients.finalizeEncounterPrescription(
        doctorId,
        patientId,
        encounterId,
        prescriptionId,
      );
    },
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.encounterSummary(
          doctorId,
          patientId,
          encounterId,
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.fullProfile(doctorId, patientId),
      });
    },
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      const prescriptionId = prescriptionQuery.data?._id;
      if (!prescriptionId) throw new Error('missing_prescription');
      await saveDraftMutation.mutateAsync();
      return doctorApi.patients.getEncounterPrescriptionPreview(
        doctorId,
        patientId,
        encounterId,
        prescriptionId,
      );
    },
  });

  const clearAppliedTemplateDraftName = useCallback(
    () => setAppliedTemplateDraftName(null),
    [],
  );

  const clearTemplateDraftNotice = useCallback(
    () => setTemplateDraftNotice(null),
    [],
  );

  const isBusy =
    saveDraftMutation.isPending ||
    addItemMutation.isPending ||
    updateItemMutation.isPending ||
    deleteItemMutation.isPending ||
    duplicateItemMutation.isPending ||
    finalizeMutation.isPending ||
    previewMutation.isPending;

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: encounterQuery.data, isError: encounterQuery.isError },
    { data: prescriptionQuery.data, isError: prescriptionQuery.isError },
  ]);

  return {
    encounter: encounterQuery.data?.encounter,
    prescription: prescriptionQuery.data,
    medications,
    generalInstructions,
    setGeneralInstructions,
    appliedTemplateDraftName,
    clearAppliedTemplateDraftName,
    templateDraftNotice,
    clearTemplateDraftNotice,
    isAwaitingData,
    isError: encounterQuery.isError || prescriptionQuery.isError,
    error: encounterQuery.error ?? prescriptionQuery.error ?? null,
    isBusy,
    isEditable:
      Boolean(prescriptionQuery.data) &&
      encounterQuery.data?.encounter?.status !== 'closed' &&
      !prescriptionQuery.data?.status?.toLowerCase().includes('final'),
    refetch: () => {
      void encounterQuery.refetch();
      void prescriptionQuery.refetch();
    },
    saveDraft: saveDraftMutation.mutateAsync,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    duplicateItem: duplicateItemMutation.mutateAsync,
    finalize: finalizeMutation.mutateAsync,
    preview: previewMutation.mutateAsync,
    getErrorMessage: (error: unknown) => {
      if (
        error instanceof Error &&
        error.message === 'errors.prescription.finalizeRequiresItems'
      ) {
        return t('doctor.encounterWorkspace.prescription.finalizeRequiresItems');
      }
      return getUserFacingRequestErrorMessage(error);
    },
  };
}
