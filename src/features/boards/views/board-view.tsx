import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { REALTIME_CHANNEL_DATA_TYPE } from '@/config/constants';
import { ColDef, ColGroupDef, themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { ErrorBoundary } from 'react-error-boundary';
import { useIsSocketInitialized } from '@/stores/global-store';
import { timeFormatterFromTimestamp } from '@/lib/grid';
import { socket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Main } from '@/components/layout/main';
import { useMarketStatus } from '@/features/boards/hooks/use-market-status';
import {
  selectQuote,
  useStocksData,
} from '@/features/boards/hooks/use-stocks-data';
import {
  queryStockDetailOptions,
  queryStocksQuotesOptions,
} from '../services/queries';

const theme = themeQuartz.withParams({
  accentColor: '#2EBD85',
  browserColorScheme: 'light',
  fontFamily: {
    googleFont: 'Inter',
  },
  fontSize: 12,
  headerFontSize: 14,
});

export const BoardView = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Main>
      <div className='mb-2 flex items-center justify-between space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>Board</h1>
      </div>
      <div className='flex-1 gap-2 overflow-auto'>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size='sm'>Open</Button>
          </SheetTrigger>
          {isOpen && <BoardSheet />}
        </Sheet>

        <Suspense fallback={<div>Loading...</div>}>
          <MarketStatus />
        </Suspense>

        <hr />
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<div>Loading stock data...</div>}>
            <StockData />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Main>
  );
};

const BoardSheet = () => {
  const logError = (error: Error) => {
    console.error(error);
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Are you absolutely sure?</SheetTitle>
        <SheetDescription>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </SheetDescription>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<div>Loading market status...</div>}>
            <MarketStatus />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary
          fallback={<div>Something went wrong1</div>}
          onError={logError}
        >
          <Suspense fallback={<div>Loading stock data...</div>}>
            <StockQuotes symbol='41I1FA000' />
          </Suspense>
        </ErrorBoundary>
      </SheetHeader>
    </SheetContent>
  );
};

export const StockQuotes = ({ symbol }: { symbol: string }) => {
  const isSocketInitialized = useIsSocketInitialized();
  const gridRef = useRef<AgGridReact<any>>(null);
  const lastVoRef = useRef<number | undefined>(undefined);

  const { data, isLoading, isError } = useQuery(
    queryStocksQuotesOptions(symbol)
  );
  const colDefs = useMemo<Array<ColGroupDef | ColDef>>(
    () => [
      {
        colId: 'ti',
        field: 'ti',
        headerName: 'Time',
        valueFormatter: timeFormatterFromTimestamp,
        flex: 1,
        headerClass: 'header text-left',
        cellClass: 'cell index text-left',
      },
      {
        colId: 'mb',
        field: 'mb',
        headerName: 'Type',
        cellClass: `cell text-left`,
        headerClass: 'header text-left',
        flex: 1,
      },
      {
        colId: 'c',
        field: 'c',
        headerName: 'Giá khớp',
        cellClass: `cell text-right justify-end`,
        flex: 1,
      },
      {
        headerName: 'Vol',
        field: 'mv',
        colId: 'mv',
        cellClass: 'cell text-right justify-end',
        flex: 1,
      },
    ],
    []
  );

  const stockData = useQuery({
    ...queryStockDetailOptions(symbol),
    select: selectQuote,
  });

  useEffect(() => {
    if (!isSocketInitialized) return;
    const payload = {
      symbols: [symbol],
      types: [REALTIME_CHANNEL_DATA_TYPE.QUOTE],
    };
    socket.subscribeSymbol(payload);
    return () => {
      socket.unsubscribeSymbol(payload);
    };
  }, [isSocketInitialized, symbol]);

  useEffect(() => {
    if (lastVoRef.current === stockData.data?.vo) return;
    lastVoRef.current = stockData.data?.vo;
    gridRef.current?.api?.applyTransactionAsync({
      add: [stockData.data],
      addIndex: 0,
    });
  }, [stockData]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  if (!data?.data.length) return <div>No data</div>;

  return (
    <>
      <h4 className='my-2 text-sm leading-none font-medium'>
        Quotes: {symbol}
      </h4>
      <div className='h-72'>
        <AgGridReact
          rowData={data.data}
          loading={isLoading}
          ref={gridRef}
          columnDefs={colDefs}
          defaultColDef={{
            resizable: false,
            minWidth: 60,
            sortable: false,
          }}
          asyncTransactionWaitMillis={100}
          suppressMovableColumns
          suppressAnimationFrame
          animateRows={false}
          theme={theme}
        />
      </div>
    </>
  );
};

const MarketStatus = () => {
  const { data: marketStatus } = useMarketStatus();

  return (
    <div>
      {marketStatus.map((s) => {
        return (
          <div key={`${s.market}-${s.type}`}>
            {s.market}-{s.status}
          </div>
        );
      })}
    </div>
  );
};

const StockData = () => {
  const routeApi = getRouteApi('/_authenticated/board/');
  const { symbols, types } = routeApi.useLoaderData();

  const { data, isLoading, isError } = useStocksData(symbols, types);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <p>Stock data</p>
      <div className='flex flex-col gap-2'>
        {data.map((data) => (
          <div key={data.s} id={data.s} className='flex flex-col gap-2'>
            <div className='flex flex-col gap-2'>
              {data.s} - {data.c} - {data.mv} - {data.ch} - {data.r}
            </div>
            <div className='flex flex-col gap-2'>
              <div>
                Bid: {data.bb?.map((bid) => `${bid.p} - ${bid.v}`).join(', ')}
              </div>
              <div>
                Offer:{' '}
                {data.bo?.map((offer) => `${offer.p} - ${offer.v}`).join(', ')}
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>
    </>
  );
};
