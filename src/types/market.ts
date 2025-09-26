import {
  MARKET,
  MARKET_STATUS,
  REALTIME_CHANNEL_DATA_TYPE,
  SELL_BUY_TYPE,
  SYMBOL_TYPE,
} from '@/config/constants';

interface ExtraSymbolData {
  channelType?: REALTIME_CHANNEL_DATA_TYPE; //last channel that updated data
}

export interface BidOffer {
  p?: number; // price
  v?: number; // volume
  c?: number; // volume change
}

export interface SymbolData extends ExtraSymbolData {
  s: string; // symbol code
  rc?: string; // Reference code
  m?: MARKET;
  n1?: string; // Vietnamese name
  n2?: string; // English name
  t?: SYMBOL_TYPE;
  b?: string; // Underlying asset
  bs?: SYMBOL_TYPE; // Underlying asset symbol type
  i?: boolean; //Highlight Index
  buyin?: boolean; // in buyin list
  o?: number; // open
  h?: number; // high
  l?: number; // low
  c?: number; // close
  a?: number; // avg
  ch?: number; // change
  r?: number; // rate
  re?: number; // reference price
  vo?: number; // tradingVolume
  va?: number; // tradingValue
  ce?: number; //ceilingPrice
  fl?: number; //floorPrice
  bb?: BidOffer[]; // Dư mua
  bo?: BidOffer[]; // DƯ bán
  mv?: number;
  mb?: 'BUY' | 'SELL';
  ti?: number; //Time
  ss?: string; //Session
  tb?: number; //Total Bid Volume
  to?: number; //Total Offer Volume
  isFr?: boolean; // is foreign
  h52W?: number;
  l52W?: number;
  av52W?: number;
  ftd?: string; //First Trade Date
  ltd?: string; //Last Trade Date
  md?: string; //Maturity Date
  ic?: {
    // Index Count
    ce: number;
    fl: number;
    up: number;
    dw: number;
    uc: number;
    tc?: number; // total trade count
    utc?: number; // total untrade count
  };
  et?: {
    //Estimated Price for next trading date
    ce?: number;
    fl?: number;
  };
  frBvo?: number; // Foreigner Buy Volume
  frSvo?: number; // Foreinger Sell Volume
  frCr?: number; // Current Foreigner Room
  frTr?: number; // Total Foreigner Room
  frBva?: number; // Foreginer buy value
  frSva?: number; // Foreginer sell value // Net  = B-S
  oi?: number; // Open Interest
  is?: string; // Issuer name
  ep?: number; // Expected Price
  er?: number; // Expected Change
  ec?: number; // Expected Rate
  exp?: number; // Exercise Price
  exr?: string; // Exercise Ratio
  iv?: number; // Implied Volatility
  rv?: number; // real Volatility
  vd?: number; // Volatility Diff
  de?: number; // Delta
  ul?: SymbolData; // Extra data for underlying assets
  pc?: number; // Previous Close Price
  lq?: number; // listed qty
  prvo?: number; // Previous Trading Volume
  abo?: number; // accumumulate bid volume
  aoo?: number; // accumumulate offer volume
  tbo?: number; // total bid
  too?: number; // total offer
  dbo?: number; // diffBidOffer
  av10?: number; // avg volume 10 days
  ie?: boolean;
  mvUp?: boolean; // market streamer format volume cell
  mvaUp?: boolean; // market streamer format value cell
  ba?: number;

  fsp?: number;
  noFsp?: number;

  mbo?: number; // buy volume
  mso?: number; // sell volume
  mbso?: number; // b/s volume

  av20?: number;

  etfStockList?: {
    s: string;
    u: number;
  }[];

  contractMul?: number; // Hệ số PS

  //CBOND
  iss?: string;
  par?: number;
  periodRemain?: string;
  interestRateType?: string;
  interestType?: string;
  interestCouponType?: string;
  interestPeriod?: string;
  interestRate?: number;
  interestPeriodUnit?: string;
  interestPaymentType?: string;
  hm?: {
    p?: number;
    v?: number;
  };
  lm?: {
    p?: number;
    v?: number;
  };
}

export interface SubscribeSymbol {
  symbols: string[];
  types: REALTIME_CHANNEL_DATA_TYPE[];
  fromBrowser?: boolean;
}

export interface MarketStatus {
  market: MARKET;
  status: MARKET_STATUS;
  lastTradingDate: string;
  lastMarketInit: number;
  type: SELL_BUY_TYPE;
}

export interface DealNotice {
  s: string;
  ti: number;
  m: string;
  ptmp: number;
  ptmvo: number;
  ptmva: number;
  ptvo: number;
  ptva: number;
}

export interface DealNoticeData {
  accVolume: number;
  accValue: number;
  data: DealNotice[];
}

export interface Advertise {
  s: string;
  ti: number;
  sb: SELL_BUY_TYPE;
  m: string;
  p: number;
  v: number;
}

export interface AdvertiseData {
  buy: Advertise[];
  sell: Advertise[];
}

export interface SectorInfo {
  id: string;
  symbols: string[];
  name: {
    vi: string;
    en: string;
  };
}

export interface Quote {
  o?: number;
  ti?: number;
  c?: number;
  ch?: number;
  h?: number;
  l?: number;
  mb?: string;
  mv?: number;
  r?: number;
  va?: number;
  vo?: number;
}

export interface QuoteData {
  data: Quote[];
  fromIndex: number;
  toIndex: number;
}
