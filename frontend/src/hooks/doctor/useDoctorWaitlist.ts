import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import {
  waitlistApi,
  waitlistQueryKeys,
} from '@/lib/doctor/waitlist/client';
import type {
  WaitlistBookBody,
  WaitlistListParams,
  WaitlistRequest,
  WaitlistSuggestionsParams,
} from '@/lib/doctor/waitlist/types';

export function resolveWaitlistPatientName(request: WaitlistRequest): string {
  const patient = request.patient;
  if (typeof patient === 'object' && patient?.userId?.fullName?.trim()) {
    return patient.userId.fullName.trim();
  }
  return '—';
}

export function resolveWaitlistPatientPublicId(request: WaitlistRequest): string {
  const patient = request.patient;
  if (typeof patient === 'object' && patient?.publicId?.trim()) {
    return patient.publicId.trim();
  }
  return '—';
}

export function useDoctorWaitlist(params: WaitlistListParams) {
  const query = useQuery({
    queryKey: waitlistQueryKeys.list(params),
    queryFn: () => waitlistApi.list(params),
    staleTime: 30_000,
  });

  const requests = query.data?.waitlistRequests ?? [];
  const total = query.data?.total ?? requests.length;
  const limit = params.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    requests,
    total,
    totalPages,
    page: query.data?.page ?? params.page ?? 1,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useWaitlistSuggestions(
  params: WaitlistSuggestionsParams | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: waitlistQueryKeys.suggestions(params ?? { date: '' }),
    queryFn: () => waitlistApi.suggestions(params!),
    enabled: enabled && Boolean(params?.date),
    staleTime: 60_000,
  });
}

function invalidateWaitlist(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: waitlistQueryKeys.all });
  void queryClient.invalidateQueries({ queryKey: ['doctor', 'home', 'snapshot'] });
}

export function useWaitlistMutations() {
  const queryClient = useQueryClient();

  const markContacted = useMutation({
    mutationFn: (input: { id: string; note?: string }) =>
      waitlistApi.markContacted(input.id, { note: input.note }),
    onSuccess: () => invalidateWaitlist(queryClient),
  });

  const closeRequest = useMutation({
    mutationFn: (input: { id: string; closedReason?: string }) =>
      waitlistApi.close(input.id, { closedReason: input.closedReason }),
    onSuccess: () => invalidateWaitlist(queryClient),
  });

  const bookRequest = useMutation({
    mutationFn: (input: { id: string; body: WaitlistBookBody }) =>
      waitlistApi.book(input.id, input.body),
    onSuccess: () => invalidateWaitlist(queryClient),
  });

  return {
    markContacted: markContacted.mutateAsync,
    closeRequest: closeRequest.mutateAsync,
    bookRequest: bookRequest.mutateAsync,
    isBusy:
      markContacted.isPending ||
      closeRequest.isPending ||
      bookRequest.isPending,
  };
}
