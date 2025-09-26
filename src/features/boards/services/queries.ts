import { queryOptions } from '@tanstack/react-query';
import { MARKET, MARKET_DATA_FETCH_COUNT } from '@/config/constants';
import { MARKET_HEADER } from '@/config/constants';
import {
  AdvertiseData,
  DealNoticeData,
  MarketStatus,
  QuoteData,
  SectorInfo,
  SymbolData,
} from '@/types/market';
import { request } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';

export const queryKeys = {
  marketStatus: ['market', 'status'] as const,
  dealNotice: (market: MARKET) => ['market', 'dealNotice', market] as const,
  advertise: (market: MARKET) => ['market', 'advertise', market] as const,
  stocksStaticData: ['market', 'stocksStaticData'] as const,
  stocksDetail: (symbols: string[]) =>
    ['market', 'stocks', ...symbols] as const,
  stocksQuotes: (symbol: string) =>
    ['market', 'stock', 'quotes', symbol] as const,
  stockDetail: (symbol: string) => ['market', 'stock', symbol] as const,
  indexList: ['market', 'indexList'] as const,
  sectorList: ['market', 'sectorList'] as const,
};

export const queryMarketStatusOptions = queryOptions({
  queryKey: queryKeys.marketStatus,
  queryFn: () =>
    request.get<MarketStatus[]>('/api/v1/market/marketStatus', {
      ...MARKET_HEADER,
    }),
  staleTime: Infinity, // make it don't refetch,
});

export const queryDealNoticeOptions = (market: MARKET) =>
  queryOptions({
    queryKey: queryKeys.dealNotice(market),
    queryFn: () =>
      request.get<DealNoticeData>(
        `/api/v1/market/dealNotice?market=${market}`,
        { ...MARKET_HEADER }
      ),
    staleTime: Infinity,
  });

export const queryAdvertiseOptions = (market: MARKET) =>
  queryOptions({
    queryKey: queryKeys.advertise(market),
    queryFn: () =>
      request.get<AdvertiseData>(`/api/v1/market/advertised?market=${market}`, {
        ...MARKET_HEADER,
      }),
    staleTime: Infinity,
  });

export const queryIndexListOptions = queryOptions({
  queryKey: queryKeys.indexList,
  queryFn: () =>
    request.get<Record<string, string[]>>(import.meta.env.VITE_INDEX_LIST_URL, {
      ...MARKET_HEADER,
    }),
  staleTime: Infinity,
});

export const querySectorListOptions = queryOptions({
  queryKey: queryKeys.sectorList,
  queryFn: () =>
    request.get<SectorInfo[]>(import.meta.env.VITE_SECTOR_URL, {
      ...MARKET_HEADER,
    }),
  staleTime: Infinity,
});

const setStockData = (data: SymbolData) => {
  queryClient.setQueryData(
    queryStockDetailOptions(data.s).queryKey,
    (oldData) => (oldData ? { ...oldData, ...data } : data)
  );
};

export const queryStockStaticDataOptions = queryOptions({
  queryKey: queryKeys.stocksStaticData,
  queryFn: async () => {
    const res = await request.get<SymbolData[]>(
      import.meta.env.VITE_SYMBOL_STATIC_URL,
      {
        ...MARKET_HEADER,
      }
    );
    for (let data of res) {
      setStockData(data);
    }
    return res;
  },
  staleTime: Infinity,
});

export const queryStockDetailOptions = (symbol: string) =>
  queryOptions({
    queryKey: queryKeys.stockDetail(symbol),
    queryFn: async () => {
      const res = await request.get<SymbolData[]>(
        `/api/v1/market/symbolLatest?symbolList=${symbol}`,
        {
          ...MARKET_HEADER,
        }
      );
      return res[0];
    },
  });

export const queryStocksQuotesOptions = (symbol: string) =>
  queryOptions({
    queryKey: queryKeys.stocksQuotes(symbol),
    queryFn: () =>
      request.get<QuoteData>(`/api/v1/market/quote?symbol=${symbol}`, {
        ...MARKET_HEADER,
      }),
  });

export const queryStocksDetailOptions = (symbols: string[]) =>
  queryOptions({
    queryKey: queryKeys.stocksDetail(symbols),
    queryFn: async () => {
      const url = '/api/v1/market/symbolLatest?symbolList=';
      let responses: SymbolData[] = [];
      if (symbols.length > 0) {
        const requests = [];

        for (let i = 0; i < symbols.length; i += MARKET_DATA_FETCH_COUNT) {
          const symbolChunk = symbols.slice(i, i + MARKET_DATA_FETCH_COUNT);
          requests.push(
            request
              .get<SymbolData[]>(url + symbolChunk.join(','), {
                ...MARKET_HEADER,
              })
              .catch((err) => {
                console.error('queryStocksDetailOptions error', err);
                return [];
              })
          );
        }

        const results = await Promise.all(requests);
        responses = results.flat();

        // Normalize into cache per-symbol
        for (let res of responses) {
          setStockData(res);
        }
      }

      return responses;
    },
  });
