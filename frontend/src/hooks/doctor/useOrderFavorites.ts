'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CatalogOrderCategory } from '@/components/doctor/encounters/orders/encounter-order-config';
import {
  doctorApi,
  doctorClinicalQueryKeys,
  doctorPatientsQueryKeys,
} from '@/lib/doctor/client';
import { orderCategoryToCatalogSection } from '@/lib/doctor/orderFavoritesSection';
import type { OrderCatalogSection } from '@/lib/doctor/orderFavoritesTypes';

function catalogQueryKey(category: CatalogOrderCategory) {
  switch (category) {
    case 'radiology':
      return doctorPatientsQueryKeys.imagingCatalog();
    case 'lab':
      return doctorPatientsQueryKeys.labCatalog();
    case 'procedure':
      return doctorPatientsQueryKeys.procedureCatalog();
  }
}

export function useOrderFavorites(section?: OrderCatalogSection) {
  const query = useQuery({
    queryKey: doctorClinicalQueryKeys.orderFavorites(section),
    queryFn: () =>
      doctorApi.orderFavorites.list({
        catalogSection: section,
        limit: 100,
      }),
    staleTime: 30_000,
  });

  return {
    favorites: query.data?.favorites ?? [],
    refetch: query.refetch,
  };
}

export function useToggleOrderCatalogFavorite(category: CatalogOrderCategory) {
  const section = orderCategoryToCatalogSection(category);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      catalogItemId: string;
      isFavorited: boolean;
    }) => {
      if (input.isFavorited) {
        const list = await doctorApi.orderFavorites.list({
          catalogSection: section,
          limit: 100,
        });
        const match = (list.favorites ?? []).find(
          (favorite) => favorite.catalogItemId === input.catalogItemId,
        );
        if (match?._id) {
          await doctorApi.orderFavorites.remove(match._id);
        }
        return { isFavorited: false };
      }

      await doctorApi.orderFavorites.create({
        catalogSection: section,
        catalogItemId: input.catalogItemId,
      });
      return { isFavorited: true };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorClinicalQueryKeys.orderFavorites(section),
      });
      void queryClient.invalidateQueries({
        queryKey: catalogQueryKey(category),
      });
    },
  });
}
