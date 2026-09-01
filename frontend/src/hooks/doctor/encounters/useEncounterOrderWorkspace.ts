'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAwaitingAnyInitialQueryData, isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import { useToggleOrderCatalogFavorite } from '@/hooks/doctor/orders/useOrderFavorites';
import {
  getEncounterOrderConfig,
  type CatalogOrderCategory,
} from '@/components/doctor/encounters/orders/encounter-order-config';
import {
  mapManualFormToUiItem,
  mapOrderToClinicalForm,
  mapRadiologyItemsToUi,
  resolveRadiologyStatusLabel,
} from '@/components/doctor/radiology/map-radiology-ui';
import {
  getEncounterOrderRequestErrorMessage,
  mapClinicalFormToOrderPatch,
  mapUiItemToOrderItemBody,
} from '@/lib/doctor/encounters/encounterOrderBodies';
import {
  ORDER_CLINICAL_MESSAGES,
  OrderClinicalFormSubmitError,
  OrderItemsRequiredError,
  assertOrderClinicalFormValid,
  type OrderClinicalFieldMessages,
} from '@/lib/doctor/orders/orderClinicalFormSchema';
import { resolveOrderClinicalServerFeedback } from '@/lib/doctor/orders/orderFormErrors';
import type {
  RadiologyClinicalForm,
  RadiologyManualForm,
  RadiologyOrderItemUi,
} from '@/components/doctor/radiology/radiology-types';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import { orderCategoryForTemplateType } from '@/lib/doctor/templates/applyTemplateDraft';
import { consumeOrderTemplateDraft } from '@/lib/doctor/templates/consumeTemplateDraft';
import {
  clearDoctorTemplateDraft,
  readDoctorTemplateDraft,
} from '@/lib/doctor/templates/templateDraftStorage';
import { useI18n } from '@/i18n/provider';
import {
  loadEncounterImagingOrderForWorkspace,
  loadEncounterLabOrderForWorkspace,
  loadEncounterProcedureOrderForWorkspace,
} from '@/lib/doctor/encounters/encounterOrderLoad';
import type {
  OrderCatalogItem,
  OrderCatalogListResponse,
} from '@/lib/doctor/encounters/encounterOrderTypes';

function normalizeCatalogItems(
  data?: OrderCatalogListResponse,
  category?: CatalogOrderCategory,
): OrderCatalogItem[] {
  if (!data) return [];
  if (data.items?.length) return data.items;
  if (category === 'lab' && data.labTests?.length) return data.labTests;
  if (category === 'radiology' && data.imaging?.length) return data.imaging;
  if (category === 'procedure' && data.procedures?.length) {
    return data.procedures;
  }
  return data.labTests ?? data.imaging ?? data.procedures ?? [];
}

const EMPTY_CLINICAL: RadiologyClinicalForm = {
  urgency: '',
  clinicalReason: '',
  instructionsToPatient: '',
  imagingCenterInstructions: '',
};

const LOADERS = {
  radiology: loadEncounterImagingOrderForWorkspace,
  lab: loadEncounterLabOrderForWorkspace,
  procedure: loadEncounterProcedureOrderForWorkspace,
} as const;

function orderQueryKey(
  category: CatalogOrderCategory,
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  switch (category) {
    case 'radiology':
      return doctorPatientsQueryKeys.encounterRadiologyOrder(
        doctorId,
        patientId,
        encounterId,
      );
    case 'lab':
      return doctorPatientsQueryKeys.encounterLabOrder(
        doctorId,
        patientId,
        encounterId,
      );
    case 'procedure':
      return doctorPatientsQueryKeys.encounterProcedureOrder(
        doctorId,
        patientId,
        encounterId,
      );
  }
}

function catalogQueryKey(category: CatalogOrderCategory, search?: string) {
  switch (category) {
    case 'radiology':
      return doctorPatientsQueryKeys.imagingCatalog(search);
    case 'lab':
      return doctorPatientsQueryKeys.labCatalog(search);
    case 'procedure':
      return doctorPatientsQueryKeys.procedureCatalog(search);
  }
}

function fetchCatalog(category: CatalogOrderCategory) {
  switch (category) {
    case 'radiology':
      return () => doctorApi.patients.listImagingCatalog({ limit: 50 });
    case 'lab':
      return () => doctorApi.patients.listLabCatalog({ limit: 50 });
    case 'procedure':
      return () => doctorApi.patients.listProcedureCatalog({ limit: 50 });
  }
}

export function useEncounterOrderWorkspace(
  category: CatalogOrderCategory,
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const { locale, t } = useI18n();
  const config = getEncounterOrderConfig(t)[category];
  const queryClient = useQueryClient();
  const toggleFavoriteMutation = useToggleOrderCatalogFavorite(category);
  const isEnabled =
    enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(encounterId);

  const orderKey = orderQueryKey(category, doctorId, patientId, encounterId);

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
    queryKey: orderKey,
    queryFn: () => LOADERS[category](doctorId, patientId, encounterId),
    enabled: isEnabled && Boolean(encounterQuery.data?.encounter),
    staleTime: 1000 * 30,
  });

  const catalogQuery = useQuery({
    queryKey: catalogQueryKey(category),
    queryFn: fetchCatalog(category),
    enabled: isEnabled,
    staleTime: 1000 * 60,
  });

  const [clinical, setClinical] = useState<RadiologyClinicalForm>(EMPTY_CLINICAL);
  const [clinicalFieldErrors, setClinicalFieldErrors] =
    useState<OrderClinicalFieldMessages>({});
  const [itemsSectionError, setItemsSectionError] = useState<string | undefined>();
  const [appliedTemplateDraftName, setAppliedTemplateDraftName] = useState<
    string | null
  >(null);
  const [templateDraftNotice, setTemplateDraftNotice] = useState<string | null>(
    null,
  );
  const templateDraftAppliedRef = useRef(false);

  useEffect(() => {
    setClinical(mapOrderToClinicalForm(orderQuery.data, category));
    setClinicalFieldErrors({});
    setItemsSectionError(undefined);
  }, [orderQuery.data, category]);

  const setClinicalValidated = useCallback(
    (next: RadiologyClinicalForm) => {
      setClinical(next);
      setClinicalFieldErrors({});
      setItemsSectionError(undefined);
    },
    [],
  );

  const items = useMemo(
    () => mapRadiologyItemsToUi(orderQuery.data, t),
    [orderQuery.data, t],
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: orderKey });
    void queryClient.invalidateQueries({
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
  }, [doctorId, encounterId, orderKey, patientId, queryClient]);

  const resolveOrderId = useCallback(async () => {
    const fresh = await queryClient.fetchQuery({
      queryKey: orderKey,
      queryFn: () => LOADERS[category](doctorId, patientId, encounterId),
    });
    if (!fresh?._id) throw new Error('missing_order');
    return fresh._id;
  }, [category, doctorId, encounterId, orderKey, patientId, queryClient]);

  const persistClinicalDraft = useCallback(async () => {
    const orderId = await resolveOrderId();
    return doctorApi.patients.updateEncounterOrder(
      doctorId,
      patientId,
      encounterId,
      orderId,
      mapClinicalFormToOrderPatch(category, clinical),
    );
  }, [
    category,
    clinical,
    doctorId,
    encounterId,
    patientId,
    resolveOrderId,
  ]);

  const saveDraftMutation = useMutation({
    mutationFn: persistClinicalDraft,
    onSuccess: invalidate,
  });

  const addItemMutation = useMutation({
    mutationFn: async (payload: Omit<RadiologyOrderItemUi, 'id'>) => {
      const orderId = await resolveOrderId();
      return doctorApi.patients.addEncounterOrderItem(
        doctorId,
        patientId,
        encounterId,
        orderId,
        mapUiItemToOrderItemBody(category, payload),
      );
    },
    onSuccess: invalidate,
  });

  const addCatalogItemMutation = useMutation({
    mutationFn: async (catalog: OrderCatalogItem) => {
      const title =
        catalog.title?.trim() ??
        catalog.name?.trim() ??
        catalog.label?.trim() ??
        'بند';
      const section = catalog.section?.trim() || catalog.category?.trim();
      return addItemMutation.mutateAsync({
        name: title,
        category: section || 'كتالوج',
        type: section || '—',
        bodyArea: section || '—',
        side: '—',
        position: '—',
        notes: '—',
        catalogItemId: catalog._id,
      });
    },
  });

  const addManualItemMutation = useMutation({
    mutationFn: async (form: RadiologyManualForm) =>
      addItemMutation.mutateAsync(mapManualFormToUiItem(form)),
  });

  useEffect(() => {
    if (!isEnabled || templateDraftAppliedRef.current) return;
    if (!orderQuery.data || orderQuery.isLoading) return;

    const draft = readDoctorTemplateDraft();
    const draftCategory = draft
      ? orderCategoryForTemplateType(draft.type)
      : null;
    if (!draft || draftCategory !== category) return;

    templateDraftAppliedRef.current = true;

    void (async () => {
      const existingCount = mapRadiologyItemsToUi(orderQuery.data).length;
      const existingClinical = mapOrderToClinicalForm(orderQuery.data, category);
      const result = await consumeOrderTemplateDraft({
        draft,
        category,
        existingClinical,
        existingItemCount: existingCount,
        setClinical: setClinicalValidated,
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
          `لم يُطبَّق قالب «${draft.name}» لأن الطلب يحتوي بنوداً مسبقاً. المسودة ما زالت محفوظة.`,
        );
        return;
      }

      if (result.skipReason === 'partial_failure') {
        clearDoctorTemplateDraft();
        setTemplateDraftNotice(
          `تم تطبيق قالب «${draft.name}» جزئياً فقط. راجع البنود المتبقية يدوياً.`,
        );
      }
    })();
  }, [
    addItemMutation,
    category,
    isEnabled,
    orderQuery.data,
    orderQuery.isLoading,
    setClinicalValidated,
  ]);

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const orderId = await resolveOrderId();
      return doctorApi.patients.deleteEncounterOrderItem(
        doctorId,
        patientId,
        encounterId,
        orderId,
        itemId,
      );
    },
    onSuccess: invalidate,
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
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

  const previewMutation = useMutation({
    mutationFn: async () => {
      const orderId = await resolveOrderId();
      return doctorApi.patients.getEncounterOrderPreview(
        doctorId,
        patientId,
        encounterId,
        orderId,
      );
    },
  });

  const validateClinicalForm = useCallback(
    (mode: 'save' | 'finalize') => {
      try {
        const result = assertOrderClinicalFormValid(
          clinical,
          mode,
          config.clinicalVariant,
        );
        setClinicalFieldErrors({});
        return result;
      } catch (error) {
        if (error instanceof OrderClinicalFormSubmitError) {
          setClinicalFieldErrors(error.fields);
        }
        throw error;
      }
    },
    [clinical, config.clinicalVariant],
  );

  const assertHasOrderItems = useCallback(() => {
    if (items.length > 0) {
      setItemsSectionError(undefined);
      return;
    }
    const msg = ORDER_CLINICAL_MESSAGES.itemsRequired;
    setItemsSectionError(msg);
    throw new OrderItemsRequiredError();
  }, [items.length]);

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
    deleteItemMutation.isPending ||
    finalizeMutation.isPending ||
    previewMutation.isPending ||
    toggleFavoriteMutation.isPending;

  const isAwaitingData = isAwaitingAnyInitialQueryData([
    { data: encounterQuery.data, isError: encounterQuery.isError },
    { data: orderQuery.data, isError: orderQuery.isError },
  ]);

  const isAwaitingCatalogData = isAwaitingInitialQueryData(
    catalogQuery.data,
    catalogQuery.isError,
  );

  return {
    category,
    config,
    encounter: encounterQuery.data?.encounter,
    order: orderQuery.data,
    items,
    clinical,
    setClinical: setClinicalValidated,
    clinicalFieldErrors,
    setClinicalFieldErrors,
    itemsSectionError,
    setItemsSectionError,
    appliedTemplateDraftName,
    clearAppliedTemplateDraftName,
    templateDraftNotice,
    clearTemplateDraftNotice,
    catalogItems: normalizeCatalogItems(catalogQuery.data, category),
    isAwaitingCatalogData,
    statusLabel: resolveRadiologyStatusLabel(orderQuery.data, locale),
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
      void catalogQuery.refetch();
    },
    toggleCatalogFavorite: toggleFavoriteMutation.mutateAsync,
    validateClinicalForm,
    assertHasOrderItems,
    saveDraft: async () => {
      validateClinicalForm('save');
      return saveDraftMutation.mutateAsync();
    },
    addCatalogItem: addCatalogItemMutation.mutateAsync,
    addManualItem: addManualItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    finalize: async () => {
      assertHasOrderItems();
      validateClinicalForm('finalize');
      await saveDraftMutation.mutateAsync();
      return finalizeMutation.mutateAsync();
    },
    preview: async () => {
      validateClinicalForm('save');
      await saveDraftMutation.mutateAsync();
      return previewMutation.mutateAsync();
    },
    getErrorMessage: (error: unknown) =>
      getEncounterOrderRequestErrorMessage(error, locale),
    getFieldErrors: (error: unknown) => {
      if (error instanceof OrderClinicalFormSubmitError) return error.fields;
      return resolveOrderClinicalServerFeedback(error).fields;
    },
    handleSubmitError: (error: unknown) => {
      if (error instanceof OrderClinicalFormSubmitError) {
        setClinicalFieldErrors(error.fields);
        return { toastMessage: error.message, fields: error.fields };
      }
      if (error instanceof OrderItemsRequiredError) {
        const msg = ORDER_CLINICAL_MESSAGES.itemsRequired;
        setItemsSectionError(msg);
        return { toastMessage: msg, fields: {} };
      }
      const { toastMessage, fields } = resolveOrderClinicalServerFeedback(error);
      if (Object.keys(fields).length) setClinicalFieldErrors(fields);
      return { toastMessage, fields };
    },
  };
}
