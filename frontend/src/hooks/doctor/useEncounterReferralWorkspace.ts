'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isAwaitingAnyInitialQueryData } from '@/lib/query/queryUi';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { consumeReferralTemplateDraft } from '@/lib/doctor/consumeTemplateDraft';
import {
  resolveEncounterOrderStatusLabel,
} from '@/lib/doctor/encounterOrderCategories';
import { loadEncounterReferralOrderForWorkspace } from '@/lib/doctor/encounterOrderLoad';
import {
  ReferralFormSubmitError,
  assertReferralFormValid,
} from '@/lib/doctor/referralFormSchema';
import { resolveReferralServerFeedback } from '@/lib/doctor/referralFormErrors';
import {
  mapReferralPriorityFromApi,
  mapReferralPriorityToApiUrgency,
} from '@/lib/doctor/referralPriority';
import {
  clearDoctorTemplateDraft,
  readDoctorTemplateDraft,
} from '@/lib/doctor/templateDraftStorage';

export type {
  ReferralFormState,
  ReferralPriority,
} from '@/lib/doctor/referralFormSchema';
import type { ReferralFormState, ReferralPriority } from '@/lib/doctor/referralFormSchema';

const EMPTY_FORM: ReferralFormState = {
  referralType: '',
  specialty: '',
  reason: '',
  referredDoctorName: '',
  institution: '',
  clinicalSummary: '',
  questionsToColleague: '',
  notes: '',
  priority: 'normal',
};

function mapOrderToForm(order?: {
  specialty?: string;
  reason?: string;
  clinicalReason?: string;
  referredDoctorName?: string;
  institution?: string;
  clinicalSummary?: string;
  questionsToColleague?: string;
  notes?: string;
  urgency?: string;
  priority?: string;
  referralType?: string;
} | null): ReferralFormState {
  if (!order) return EMPTY_FORM;
  return {
    referralType: order.referralType?.trim() ?? '',
    specialty: order.specialty?.trim() ?? '',
    reason: order.reason?.trim() ?? order.clinicalReason?.trim() ?? '',
    referredDoctorName: order.referredDoctorName?.trim() ?? '',
    institution: order.institution?.trim() ?? '',
    clinicalSummary: order.clinicalSummary?.trim() ?? '',
    questionsToColleague: order.questionsToColleague?.trim() ?? '',
    notes: order.notes?.trim() ?? '',
    priority: mapReferralPriorityFromApi(order.priority ?? order.urgency),
  };
}

function mapFormToApiBody(form: ReferralFormState) {
  return {
    referralType: form.referralType.trim() || undefined,
    specialty: form.specialty.trim() || undefined,
    reason: form.reason.trim() || undefined,
    referredDoctorName: form.referredDoctorName.trim() || undefined,
    institution: form.institution.trim() || undefined,
    clinicalSummary: form.clinicalSummary.trim() || undefined,
    questionsToColleague: form.questionsToColleague.trim() || undefined,
    notes: form.notes.trim() || undefined,
    /** الباك إند يتوقع low | medium | high — لا normal/urgent/emergency */
    urgency: mapReferralPriorityToApiUrgency(form.priority),
  };
}

export function useEncounterReferralWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
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

  const orderQuery = useQuery({
    queryKey: doctorPatientsQueryKeys.encounterReferralOrder(
      doctorId,
      patientId,
      encounterId,
    ),
    queryFn: () =>
      loadEncounterReferralOrderForWorkspace(doctorId, patientId, encounterId),
    enabled: isEnabled && Boolean(encounterQuery.data?.encounter),
    staleTime: 1000 * 15,
  });

  const [form, setForm] = useState<ReferralFormState>(EMPTY_FORM);
  const [appliedTemplateDraftName, setAppliedTemplateDraftName] = useState<
    string | null
  >(null);
  const [templateDraftNotice, setTemplateDraftNotice] = useState<string | null>(
    null,
  );
  const templateDraftAppliedRef = useRef(false);

  useEffect(() => {
    setForm(mapOrderToForm(orderQuery.data));
  }, [orderQuery.data]);

  useEffect(() => {
    if (!isEnabled || templateDraftAppliedRef.current) return;
    if (!orderQuery.data || orderQuery.isLoading) return;

    const draft = readDoctorTemplateDraft();
    if (!draft || draft.type !== 'REFERRAL_ORDER') return;

    templateDraftAppliedRef.current = true;

    const existingForm = mapOrderToForm(orderQuery.data);
    const result = consumeReferralTemplateDraft({
      draft,
      existingForm,
      setForm,
    });

    if (result.consumed) {
      clearDoctorTemplateDraft();
      if (result.skipReason !== 'empty' && result.appliedItemCount > 0) {
        setAppliedTemplateDraftName(draft.name);
      }
      return;
    }

    if (result.skipReason === 'existing_items') {
      setTemplateDraftNotice(
        `لم يُطبَّق قالب «${draft.name}» لأن التحويل يحتوي بيانات مسبقاً. المسودة ما زالت محفوظة.`,
      );
    }
  }, [isEnabled, orderQuery.data, orderQuery.isLoading]);

  const clearAppliedTemplateDraftName = useCallback(
    () => setAppliedTemplateDraftName(null),
    [],
  );

  const clearTemplateDraftNotice = useCallback(
    () => setTemplateDraftNotice(null),
    [],
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: doctorPatientsQueryKeys.encounterReferralOrder(
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
    void queryClient.invalidateQueries({
      queryKey: doctorPatientsQueryKeys.encounterSummary(
        doctorId,
        patientId,
        encounterId,
      ),
    });
  }, [doctorId, encounterId, patientId, queryClient]);

  const resolveOrderId = useCallback(async () => {
    const fresh = await queryClient.fetchQuery({
      queryKey: doctorPatientsQueryKeys.encounterReferralOrder(
        doctorId,
        patientId,
        encounterId,
      ),
      queryFn: () =>
        loadEncounterReferralOrderForWorkspace(doctorId, patientId, encounterId),
    });
    if (!fresh?._id) throw new Error('missing_order');
    return fresh._id;
  }, [doctorId, encounterId, patientId, queryClient]);

  const saveMutation = useMutation({
    mutationFn: async (validatedForm: ReferralFormState) => {
      const orderId = await resolveOrderId();
      return doctorApi.patients.updateEncounterOrder(
        doctorId,
        patientId,
        encounterId,
        orderId,
        mapFormToApiBody(validatedForm),
      );
    },
    onSuccess: invalidate,
  });

  const finalizeMutation = useMutation({
    mutationFn: async (validatedForm: ReferralFormState) => {
      await saveMutation.mutateAsync(validatedForm);
      const orderId = await resolveOrderId();
      return doctorApi.patients.finalizeEncounterOrder(
        doctorId,
        patientId,
        encounterId,
        orderId,
      );
    },
    onSuccess: invalidate,
  });

  const isBusy =
    saveMutation.isPending ||
    finalizeMutation.isPending;

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: encounterQuery.data, isError: encounterQuery.isError },
    {
      data: orderQuery.data,
      isError: orderQuery.isError,
    },
  ]);

  return {
    encounter: encounterQuery.data?.encounter,
    order: orderQuery.data,
    form,
    setForm,
    appliedTemplateDraftName,
    clearAppliedTemplateDraftName,
    templateDraftNotice,
    clearTemplateDraftNotice,
    statusLabel: orderQuery.data ? resolveEncounterOrderStatusLabel(orderQuery.data) : '',
    isAwaitingData,
    isError: encounterQuery.isError || orderQuery.isError,
    error: encounterQuery.error ?? orderQuery.error,
    isBusy,
    isEditable: (() => {
      if (!orderQuery.data) return false;
      if (encounterQuery.data?.encounter?.status === 'closed') return false;
      const status = `${orderQuery.data.status ?? ''} ${orderQuery.data.statusCode ?? ''}`.toLowerCase();
      return !status.includes('final') && !status.includes('complete');
    })(),
    refetch: () => {
      void encounterQuery.refetch();
      void orderQuery.refetch();
    },
    save: async () => {
      const validated = assertReferralFormValid(form, 'save');
      setForm(validated);
      return saveMutation.mutateAsync(validated);
    },
    finalize: async () => {
      const validated = assertReferralFormValid(form, 'finalize');
      setForm(validated);
      return finalizeMutation.mutateAsync(validated);
    },
    resolveSubmitFeedback: resolveReferralServerFeedback,
    getErrorMessage: (error: unknown) => {
      if (error instanceof ReferralFormSubmitError) return error.message;
      return resolveReferralServerFeedback(error).toastMessage;
    },
    getFieldErrors: (error: unknown) => {
      if (error instanceof ReferralFormSubmitError) return error.fields;
      return resolveReferralServerFeedback(error).fields;
    },
  };
}
