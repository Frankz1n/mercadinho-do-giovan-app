import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addressesRepository } from '@/features/addresses/data/addresses-repository';
import type { AddressDraft } from '@/features/addresses/domain/address';

export const addressQueryKeys = {
  all: ['addresses'] as const,
  list: (userId: string) => [...addressQueryKeys.all, 'list', userId] as const,
  detail: (addressId: string) => [...addressQueryKeys.all, 'detail', addressId] as const,
};

export function useAddresses(userId: string | undefined) {
  return useQuery({
    queryKey: addressQueryKeys.list(userId ?? 'anonymous'),
    queryFn: () => addressesRepository.listByUser(userId!),
    enabled: Boolean(userId),
    staleTime: 15_000,
  });
}

export function useAddress(addressId: string | undefined) {
  return useQuery({
    queryKey: addressQueryKeys.detail(addressId ?? 'new'),
    queryFn: () => addressesRepository.getById(addressId!),
    enabled: Boolean(addressId),
    staleTime: 15_000,
  });
}

export function useSaveAddress(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { addressId?: string; draft: AddressDraft }) => {
      if (!userId) {
        throw new Error('Faça login para salvar o endereço.');
      }
      if (input.addressId) {
        return addressesRepository.update(input.addressId, input.draft);
      }
      return addressesRepository.create(userId, input.draft);
    },
    onSuccess: async () => {
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: addressQueryKeys.list(userId) });
      }
    },
  });
}

export function useDeleteAddress(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => addressesRepository.remove(addressId),
    onSuccess: async () => {
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: addressQueryKeys.list(userId) });
      }
    },
  });
}

export function useSetDefaultAddress(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => addressesRepository.setDefault(addressId),
    onSuccess: async () => {
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: addressQueryKeys.list(userId) });
      }
    },
  });
}
