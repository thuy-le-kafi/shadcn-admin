import { useEffect } from 'react';
import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import { REALTIME_CHANNEL_DATA_TYPE } from '@/config/constants';
import { SymbolData } from '@/types/market';
import memoize from 'fast-memoize';
import { useIsSocketInitialized } from '@/stores/global-store';
import { socket } from '@/lib/socket';
import {
  queryStockDetailOptions,
  queryStockStaticDataOptions,
} from '@/features/boards/services/queries';
import { queryStocksDetailOptions } from '@/features/boards/services/queries';

export const useStocksData = (
  symbols: string[],
  types: REALTIME_CHANNEL_DATA_TYPE[]
) => {
  useSuspenseQuery(queryStockStaticDataOptions);
  useSuspenseQuery(queryStocksDetailOptions(symbols));

  const isSocketInitialized = useIsSocketInitialized();

  const stocksData = useQueries({
    queries: symbols.map(queryStockDetailOptions),
    combine: (results) => {
      return {
        data: results
          .map((result) => result.data)
          .filter(Boolean) as SymbolData[],
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
      };
    },
  });

  useEffect(() => {
    if (!isSocketInitialized) return;
    socket.subscribeSymbol({ symbols, types });
    return () => {
      socket.unsubscribeSymbol({ symbols, types });
    };
  }, [isSocketInitialized, symbols, types]);

  return stocksData;
};

export const selectQuote = memoize((data: SymbolData) => ({
  ti: data.ti,
  mb: data.mb,
  c: data.c,
  mv: data.mv,
  vo: data.vo,
}));

// export const useStockQuotes = (symbol: string) => {
//   const isSocketInitialized = useIsSocketInitialized();
//   const stockQuotes = useQuery(queryStocksQuotesOptions(symbol));

//   useEffect(() => {
//     if (!isSocketInitialized) return;
//     socket.subscribeSymbol({
//       symbols: [symbol],
//       types: [REALTIME_CHANNEL_DATA_TYPE.QUOTE],
//     });
//     return () => {
//       socket.unsubscribeSymbol({
//         symbols: [symbol],
//         types: [REALTIME_CHANNEL_DATA_TYPE.QUOTE],
//       });
//     };
//   }, [isSocketInitialized, symbol]);

//   const lastVoRef = useRef<number | undefined>(undefined);
//   // nếu vo có đổi thì mới update
//   const combinedData = useMemo(() => {
//     if (lastVoRef.current === stockData.data?.vo) {
//       return stockQuotes.data;
//     }

//     lastVoRef.current = stockData.data?.vo;

//     return {
//       ...stockQuotes.data,
//       data: [stockData.data, ...(stockQuotes.data?.data || [])],
//     };
//   }, [stockQuotes.data, stockData.data]);

//   return {
//     data: combinedData,
//     isLoading: stockQuotes.isLoading,
//     isError: stockQuotes.isError,
//   };
// };
