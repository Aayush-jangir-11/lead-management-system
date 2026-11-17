import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh data
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection (replaces cacheTime in v5)
      retry: 1, // Retry failed queries once
      refetchOnWindowFocus: false, // Don't refetch on window focus by default
      refetchOnReconnect: true, // Refetch on internet reconnect
    },
    mutations: {
      retry: 0, // Don't retry mutations automatically to prevent duplicate writes
    },
  },
});

export default queryClient;

