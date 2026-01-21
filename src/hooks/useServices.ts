import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '@/services/servicesApi';

/**
 * Hook to fetch all services
 * Uses React Query for proper caching, deduplication, and automatic refetching
 */
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.getAll(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

/**
 * Hook to fetch a single service by ID
 * Uses React Query for proper caching and automatic refetching
 */
export function useService(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => servicesApi.getById(serviceId!),
    enabled: !!serviceId, // Only fetch when serviceId is available
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
