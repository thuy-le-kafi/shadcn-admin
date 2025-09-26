import { AxiosError } from 'axios';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 3 * 1000, //
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!');
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!');
        }
        if (error.response?.status === 403) {
          toast.error('Access Forbidden!');
        }
      }
    },
  }),
});
