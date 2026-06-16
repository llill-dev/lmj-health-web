import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorApi, doctorPatientsQueryKeys } from '@/lib/doctor/client';
import type { EncounterDocumentLinkBody } from '@/lib/doctor/encounterDocumentsTypes';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

export function useEncounterDocuments(
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  const isEnabled =
    enabled && Boolean(doctorId) && Boolean(patientId) && Boolean(encounterId);

  const query = useQuery({
    queryKey: [
      ...doctorPatientsQueryKeys.encounterDetail(
        doctorId,
        patientId,
        encounterId,
      ),
      'documents',
    ],
    queryFn: () =>
      doctorApi.patients.listEncounterDocuments(
        doctorId,
        patientId,
        encounterId,
      ),
    enabled: isEnabled,
    staleTime: 30_000,
  });

  return {
    documents: query.data?.documents ?? [],
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEncounterDocumentMutations(
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: [
        ...doctorPatientsQueryKeys.encounterDetail(
          doctorId,
          patientId,
          encounterId,
        ),
        'documents',
      ],
    });
  };

  const linkMutation = useMutation({
    mutationFn: (body: EncounterDocumentLinkBody) =>
      doctorApi.patients.linkEncounterDocument(
        doctorId,
        patientId,
        encounterId,
        body,
      ),
    onSuccess: () => invalidate(),
  });

  const shareMutation = useMutation({
    mutationFn: (input: { documentId: string; shareNote?: string }) =>
      doctorApi.patients.shareEncounterDocument(
        doctorId,
        patientId,
        encounterId,
        input.documentId,
        { shareNote: input.shareNote },
      ),
    onSuccess: () => invalidate(),
  });

  return {
    linkDocument: linkMutation.mutateAsync,
    shareDocument: shareMutation.mutateAsync,
    isBusy: linkMutation.isPending || shareMutation.isPending,
  };
}
