import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, doctorOrdersQueryKeys } from '@/lib/doctor/client';

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

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    invalidateOrders,
  };
}
