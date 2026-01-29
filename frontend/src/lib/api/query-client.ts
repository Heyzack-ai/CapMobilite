import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import type { ApiError } from '@/types';

// Global error handler for queries
const handleQueryError = (error: unknown) => {
  const apiError = error as ApiError;
  console.error('Query error:', apiError.message);
  // Could add toast notification here
};

// Global error handler for mutations
const handleMutationError = (error: unknown) => {
  const apiError = error as ApiError;
  console.error('Mutation error:', apiError.message);
  // Could add toast notification here
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleMutationError,
    }),
  });
}

// Singleton for client-side
let clientQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return createQueryClient();
  }

  // Browser: reuse the same query client
  if (!clientQueryClient) {
    clientQueryClient = createQueryClient();
  }
  return clientQueryClient;
}
