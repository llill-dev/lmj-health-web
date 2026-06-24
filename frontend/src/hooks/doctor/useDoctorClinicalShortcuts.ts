'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  doctorApi,
  doctorClinicalQueryKeys,
  doctorPatientsQueryKeys,
} from '@/lib/doctor/client';
import type {
  CreateDoctorLibraryItemBody,
  UpdateDoctorLibraryItemBody,
} from '@/lib/doctor/libraryTypes';
import type {
  CreateDoctorTemplateBody,
  DoctorTemplateApplyResponse,
  UpdateDoctorTemplateBody,
} from '@/lib/doctor/templateTypes';
import { storeDoctorTemplateDraft } from '@/lib/doctor/templateDraftStorage';
import type { AddDoctorPatientMedicationBody } from '@/lib/doctor/types';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

export function useDoctorLibraryItems(params: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
  favorite?: boolean;
} = {}) {
  const query = useQuery({
    queryKey: doctorClinicalQueryKeys.libraryItems(params),
    queryFn: () => doctorApi.library.list(params),
    staleTime: 30_000,
  });

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    refetch: query.refetch,
  };
}

export function useCreateDoctorLibraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDoctorLibraryItemBody) => doctorApi.library.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorClinicalQueryKeys.all,
      });
    },
  });
}

export function useUpdateDoctorLibraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { itemId: string; body: UpdateDoctorLibraryItemBody }) =>
      doctorApi.library.update(input.itemId, input.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorClinicalQueryKeys.all,
      });
    },
  });
}

export function useDeleteDoctorLibraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => doctorApi.library.delete(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorClinicalQueryKeys.all,
      });
    },
  });
}

export function useToggleDoctorLibraryFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      isFavorite,
    }: {
      itemId: string;
      isFavorite: boolean;
    }) => doctorApi.library.setFavorite(itemId, isFavorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorClinicalQueryKeys.all,
      });
    },
  });
}

export function useDoctorLibraryRecent(limit = 8) {
  const query = useQuery({
    queryKey: doctorClinicalQueryKeys.libraryRecent(),
    queryFn: () => doctorApi.library.recent(limit),
    staleTime: 30_000,
  });

  return {
    items: query.data?.items ?? [],
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    refetch: query.refetch,
  };
}

export function useDoctorTemplates(params: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
} = {}) {
  const query = useQuery({
    queryKey: doctorClinicalQueryKeys.templates(params),
    queryFn: () => doctorApi.templates.list(params),
    staleTime: 30_000,
  });

  return {
    templates: query.data?.templates ?? [],
    total: query.data?.total ?? 0,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    refetch: query.refetch,
  };
}

export function useCreateDoctorTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDoctorTemplateBody) => doctorApi.templates.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorClinicalQueryKeys.all,
      });
    },
  });
}

export function useUpdateDoctorTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { templateId: string; body: UpdateDoctorTemplateBody }) =>
      doctorApi.templates.update(input.templateId, input.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorClinicalQueryKeys.all,
      });
    },
  });
}

export function useDeleteDoctorTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => doctorApi.templates.delete(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorClinicalQueryKeys.all,
      });
    },
  });
}

export function useApplyDoctorTemplate() {
  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await doctorApi.templates.apply(templateId);
      const stored = storeDoctorTemplateDraft(response, templateId);
      return {
        ...(response as DoctorTemplateApplyResponse),
        storedLocally: stored != null,
      };
    },
  });
}

export function useAddDoctorPatientMedication(
  doctorId: string,
  patientId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddDoctorPatientMedicationBody) =>
      doctorApi.patients.addPatientMedication(doctorId, patientId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorPatientsQueryKeys.fullProfile(doctorId, patientId),
      });
    },
  });
}
