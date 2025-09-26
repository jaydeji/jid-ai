import { QueryClient } from '@tanstack/react-query'
import { config } from '../config'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 2000,
      retry: false,
      refetchOnWindowFocus: !config.DEV,
      refetchOnReconnect: !config.DEV,
      notifyOnChangeProps: ['data', 'isLoading'],
      // refetchInterval: isMutating ? false : 30000,
    },
  },
})
