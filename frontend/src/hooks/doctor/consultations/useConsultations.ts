'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  consultationsApi,
  type ConsultationTicketStatus,
} from '@/lib/consultations/client';

export function useConsultationsList(status?: ConsultationTicketStatus) {
  return useQuery({
    queryKey: ['consultations', 'list', status ?? 'all'],
    queryFn: () => consultationsApi.list(status ? { status } : undefined),
    staleTime: 1000 * 30,
  });
}

export function useConsultationDetails(ticketId: string | null) {
  return useQuery({
    queryKey: ['consultations', 'detail', ticketId],
    queryFn: () => consultationsApi.getById(ticketId!),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 30,
  });
}

export function useSendConsultationMessage(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { content: string; attachments?: string[] }) =>
      consultationsApi.sendMessage(ticketId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['consultations', 'detail', ticketId],
      });
      void queryClient.invalidateQueries({ queryKey: ['consultations', 'list'] });
      void queryClient.invalidateQueries({
        queryKey: ['doctor', 'home', 'snapshot'],
      });
    },
  });
}

export function useUpdateConsultationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      status,
      reason,
    }: {
      ticketId: string;
      status: 'closed' | 'dismissed';
      reason?: string;
    }) => consultationsApi.updateStatus(ticketId, { status, reason }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['consultations', 'detail', variables.ticketId],
      });
      void queryClient.invalidateQueries({ queryKey: ['consultations', 'list'] });
      void queryClient.invalidateQueries({
        queryKey: ['doctor', 'home', 'snapshot'],
      });
    },
  });
}

export function useMarkConsultationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => consultationsApi.markRead(ticketId),
    onSuccess: (_data, ticketId) => {
      void queryClient.invalidateQueries({
        queryKey: ['consultations', 'detail', ticketId],
      });
      void queryClient.invalidateQueries({ queryKey: ['consultations', 'list'] });
    },
  });
}
