import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { socket } from '@/lib/socket';
import { queryMarketStatusOptions } from '@/features/boards/services/queries';

export const useMarketStatus = () => {
  const data = useSuspenseQuery(queryMarketStatusOptions);

  useEffect(() => {
    socket.subscribeMarketStatus();
    return () => {
      socket.unsubscribeMarketStatus();
    };
  }, []);

  return data;
};
