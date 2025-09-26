import {
  MARKET,
  REALTIME_CHANNEL_DATA_TYPE,
  SELL_BUY_TYPE,
  SOCKET_STATUS,
} from '@/config/constants';
import {
  Advertise,
  DealNotice,
  MarketStatus,
  SubscribeSymbol,
  SymbolData,
} from '@/types/market';
import { AGClientSocket, create } from 'socketcluster-client';
import { useGlobalStore } from '@/stores/global-store';
import {
  queryAdvertiseOptions,
  queryDealNoticeOptions,
  queryMarketStatusOptions,
  queryStockDetailOptions,
  queryStocksQuotesOptions,
} from '@/features/boards/services/queries.js';
import { queryClient } from './queryClient';
import * as scCodecMinBin from './sc-codec-min-bin.js';

class Socket {
  private instance: AGClientSocket | null = null;
  private subscriptionRefs: Map<string, number> = new Map();
  private channelCallbacks: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    const options: AGClientSocket.ClientOptions = {
      hostname: import.meta.env.VITE_WS_HOST || 'localhost',
      path: import.meta.env.VITE_WS_PATH || '/socketcluster/',
      port: Number(import.meta.env.VITE_WS_PORT ?? 8000),
      secure: import.meta.env.VITE_WS_SSL === 'true',
      ackTimeout: Number(import.meta.env.VITE_WS_ACK_TIMEOUT ?? 30000),
      codecEngine: scCodecMinBin,
      ...(import.meta.env.VITE_API_KEY && {
        query: { apikey: import.meta.env.VITE_API_KEY },
      }),
    };

    this.instance = create(options);
    this.initListeners();
  }

  private initListeners() {
    (async () => {
      if (!this.instance) return;
      for await (let { id } of this.instance.listener('connect')) {
        console.log('socket connected', id);

        useGlobalStore.setState({
          socketStatus: SOCKET_STATUS.CONNECTED,
          isSocketInitialized: true,
        });
        // TODO:
      }
    })();

    (async () => {
      if (!this.instance) return;
      for await (let { code, reason } of this.instance.listener('close')) {
        console.log('socket closed', code, reason);
        useGlobalStore.setState({ socketStatus: SOCKET_STATUS.DISCONNECTED });
      }
    })();

    (async () => {
      if (!this.instance) return;
      for await (let { error } of this.instance.listener('error')) {
        console.log('socket error', error);
        useGlobalStore.setState({ socketStatus: SOCKET_STATUS.CONNECTING });
        this.instance?.connect();
      }
    })();
  }

  private subscribeChannel<T = any>(
    chanelName: string,
    callback: (data: T) => void,
    token?: string
  ) {
    if (!this.instance) return;

    try {
      const currentRefs = this.subscriptionRefs.get(chanelName) || 0;
      this.subscriptionRefs.set(chanelName, currentRefs + 1);

      if (!this.channelCallbacks.has(chanelName)) {
        this.channelCallbacks.set(chanelName, new Set());
      }
      this.channelCallbacks.get(chanelName)!.add(callback);

      console.log(`subscribe channel: ${chanelName}, refs: ${currentRefs + 1}`);

      // Only subscribe to the actual channel if this is the first reference
      if (currentRefs === 0) {
        const channel = this.instance.subscribe(chanelName, {
          ...(token && { data: { token } }),
        });

        (async () => {
          for await (let data of channel) {
            const callbacks = this.channelCallbacks.get(chanelName);
            if (callbacks) {
              callbacks.forEach((cb) => cb(data));
            }
          }
        })();
      }
    } catch (error) {
      console.error(`subscribe channel :${chanelName},error: ${error}`);
    }
  }

  private unsubscribeChannel(
    chanelName: string,
    callback?: (data: any) => void
  ) {
    if (!this.instance) return;

    const currentRefs = this.subscriptionRefs.get(chanelName) || 0;

    if (currentRefs <= 0) {
      console.log(`unsubscribe channel: ${chanelName} - no active references`);
      return;
    }

    if (callback) {
      const callbacks = this.channelCallbacks.get(chanelName);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.channelCallbacks.delete(chanelName);
        }
      }
    }

    const newRefs = currentRefs - 1;
    this.subscriptionRefs.set(chanelName, newRefs);

    console.log(`unsubscribe channel: ${chanelName}, refs: ${newRefs}`);

    // Only actually unsubscribe from the channel if no more references
    if (newRefs === 0) {
      this.instance.unsubscribe(chanelName);
      this.instance.closeChannel(chanelName);
      this.subscriptionRefs.delete(chanelName);
    }
  }

  subscribeMarketStatus() {
    this.subscribeChannel<MarketStatus>('market.status', (data) => {
      queryClient.setQueryData(queryMarketStatusOptions.queryKey, (oldData) => {
        const update = (entity: MarketStatus) =>
          entity.market === data.market && entity.type === data.type
            ? { ...entity, ...data }
            : entity;
        return oldData ? oldData.map(update) : [data];
      });
    });
  }

  unsubscribeMarketStatus() {
    this.unsubscribeChannel('market.status');
  }

  subscribeNoticeData(payload: { market: MARKET }) {
    this.subscribeChannel<DealNotice>(
      `market.dealNotice.${payload.market}`,
      (data) => {
        queryClient.setQueryData(
          queryDealNoticeOptions(payload.market).queryKey,
          (oldData) => ({
            accVolume: data.ptmvo + (oldData?.accVolume || 0),
            accValue: data.ptmva + (oldData?.accValue || 0),
            data: [data, ...(oldData?.data ?? [])],
          })
        );
      }
    );
  }

  unsubscribeNoticeData(payload: { market: MARKET }) {
    this.unsubscribeChannel(`market.dealNotice.${payload.market}`);
  }

  subscribeAdvertise(payload: { market: MARKET }) {
    this.subscribeChannel<Advertise>(
      `market.advertised.${payload.market}`,
      (data) => {
        queryClient.setQueryData(
          queryAdvertiseOptions(payload.market).queryKey,
          (oldData = { buy: [], sell: [] }) => ({
            ...oldData,
            ...(data.sb === SELL_BUY_TYPE.BUY
              ? {
                  buy: [data, ...oldData.buy],
                }
              : {
                  sell: [data, ...oldData.sell],
                }),
          })
        );
      }
    );
  }

  unsubscribeAdvertise(payload: { market: MARKET }) {
    this.unsubscribeChannel(`market.advertised.${payload.market}`);
  }

  private getStockChannelName(
    symbol: string,
    type: REALTIME_CHANNEL_DATA_TYPE
  ) {
    if (type === REALTIME_CHANNEL_DATA_TYPE.QUOTE) {
      return `market.quote.${symbol}`;
    }

    if (type === REALTIME_CHANNEL_DATA_TYPE.BID_OFFER) {
      return `market.bidoffer.${symbol}`;
    }

    if (type === REALTIME_CHANNEL_DATA_TYPE.BID_ODD) {
      return `market.oddlot.${symbol}`;
    }

    return `market.quote.oddlot.${symbol}`;
  }

  subscribeSymbol(payload?: SubscribeSymbol) {
    if (!payload?.symbols || payload.symbols.length === 0) return;
    payload.symbols.filter(Boolean).forEach((symbol) => {
      payload.types.forEach((type) => {
        const chanelName = this.getStockChannelName(symbol, type);
        this.subscribeChannel<SymbolData>(chanelName, (data) => {
          queryClient.setQueryData(
            queryStockDetailOptions(data.s).queryKey,
            (oldData) => (oldData ? { ...oldData, ...data } : data)
          );
        });
      });
    });
  }

  unsubscribeSymbol(
    payload?: SubscribeSymbol,
    callback?: (data: SymbolData) => void
  ) {
    if (!payload?.symbols || payload.symbols.length === 0) return;
    payload.symbols.filter(Boolean).forEach((symbol) => {
      payload.types.forEach((type) => {
        const chanelName = this.getStockChannelName(symbol, type);
        this.unsubscribeChannel(chanelName, callback);
      });
    });
  }
}

export const socket = new Socket();
