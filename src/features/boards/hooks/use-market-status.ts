import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useIsSocketInitialized } from '@/stores/global-store';
import { socket } from '@/lib/socket';
import { queryMarketStatusOptions } from '@/features/boards/services/queries';

export const useMarketStatus = () => {
  const data = useSuspenseQuery(queryMarketStatusOptions);
  const isSocketInitialized = useIsSocketInitialized();

  useEffect(() => {
    socket.subscribeMarketStatus();
    return () => {
      socket.unsubscribeMarketStatus();
    };
  }, [isSocketInitialized]);

  return data;
};
