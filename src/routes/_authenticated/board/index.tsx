import { createFileRoute } from '@tanstack/react-router';
import { REALTIME_CHANNEL_DATA_TYPE } from '@/config/constants';
import {
  queryMarketStatusOptions,
  queryStocksDetailOptions,
  queryStockStaticDataOptions,
} from '@/features/boards/services/queries';
import { BoardView } from '@/features/boards/views/board-view';

const STOCK_SYMBOLS: string[] = [
  '41I1FA000',
  'ACB',
  'BCM',
  'BID',
  'CTG',
  'DGC',
  'FPT',
  'GAS',
  'GVR',
  'HDB',
  'HPG',
  'LPB',
  'MBB',
  'MSN',
  'MWG',
  'PLX',
  'SAB',
  'SHB',
  'SSB',
  'SSI',
  'STB',
  'TCB',
  'TPB',
  'VCB',
  'VHM',
  'VIB',
  'VIC',
  'VJC',
  'VNM',
  'VPB',
  'VRE',
];

const STOCK_TYPES: REALTIME_CHANNEL_DATA_TYPE[] = [
  REALTIME_CHANNEL_DATA_TYPE.QUOTE,
  REALTIME_CHANNEL_DATA_TYPE.BID_OFFER,
];

export const Route = createFileRoute('/_authenticated/board/')({
  component: BoardView,
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(queryMarketStatusOptions);
    void queryClient.prefetchQuery(queryStockStaticDataOptions);
    void queryClient.prefetchQuery(queryStocksDetailOptions(STOCK_SYMBOLS));

    return {
      symbols: STOCK_SYMBOLS,
      types: STOCK_TYPES,
    };
  },
});
