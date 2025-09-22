import { queryOptions } from '@tanstack/react-query';
import { MARKET } from '@/config/constants';
import {
  AdvertiseData,
  DealNoticeData,
  MarketStatus,
  SymbolData,
} from '@/types/market';
import { request } from '@/lib/apiClient';

export const queryKeys = {
  marketStatus: () => ['market', 'status'] as const,
  dealNotice: (market: MARKET) => ['market', 'dealNotice', market] as const,
  advertise: (market: MARKET) => ['market', 'advertise', market] as const,
  stock: (symbol: string) => ['market', 'stock', symbol] as const,
};

export const queryMarketStatusOptions = queryOptions({
  queryKey: queryKeys.marketStatus(),
  queryFn: () =>
    request.get<MarketStatus[]>('/api/v1/market/marketStatus', {
      headers: {
        apikey: undefined,
      },
    }),
  staleTime: Infinity,
});

export const queryDealNoticeOptions = (market: MARKET) =>
  queryOptions({
    queryKey: queryKeys.dealNotice(market),
    queryFn: () =>
      request.get<DealNoticeData>(`/api/v1/market/dealNotice?market=${market}`),
    staleTime: Infinity,
  });

export const queryAdvertiseOptions = (market: MARKET) =>
  queryOptions({
    queryKey: queryKeys.advertise(market),
    queryFn: () =>
      request.get<AdvertiseData>(`/api/v1/market/advertised?market=${market}`),
    staleTime: Infinity,
  });

export const queryStockOptions = (symbol: string) =>
  queryOptions({
    queryKey: queryKeys.stock(symbol),
    queryFn: async () => {
      const response = await request.get<SymbolData[]>(
        `/api/v1/market/symbolLatest?symbolList=${symbol}`
      );
      return response[0];
    },
    staleTime: Infinity,
  });
