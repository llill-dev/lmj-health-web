import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, doctorOrdersQueryKeys } from '@/lib/doctor/client';
import type { AppendDoctorOrderResultsBody } from '@/lib/doctor/doctorOrderTypes';

export function useDoctorOrderMutations() {
  const queryClient = useQueryClient();

  const invalidateOrders = async () => {
    await queryClient.invalidateQueries({ queryKey: doctorOrdersQueryKeys.all });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      statusCode,
    }: {
      orderId: string;
      statusCode: string;
    }) => {
      if (statusCode === 'CANCELLED') {
        return doctorApi.orders.cancel(orderId);
      }
      return doctorApi.orders.updateStatus(orderId, {
        statusCode,
        status: statusCode,
      });
    },
    onSuccess: async (_data, variables) => {
      await invalidateOrders();
      await queryClient.invalidateQueries({
        queryKey: doctorOrdersQueryKeys.detail(variables.orderId),
      });
    },
  });

  const appendResultsMutation = useMutation({
    mutationFn: async ({
      orderId,
      body,
    }: {
      orderId: string;
      body: AppendDoctorOrderResultsBody;
    }) => doctorApi.orders.appendResults(orderId, body),
    onSuccess: async (_data, variables) => {
      await invalidateOrders();
      await queryClient.invalidateQueries({
        queryKey: doctorOrdersQueryKeys.detail(variables.orderId),
      });
    },
  });

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    appendResults: appendResultsMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    isAppendingResults: appendResultsMutation.isPending,
    invalidateOrders,
  };
}
