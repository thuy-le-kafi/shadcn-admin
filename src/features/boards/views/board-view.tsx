import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { queryClient } from '@/lib/queryClient';
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
import { queryMarketStatusOptions } from '@/features/boards/services/queries';

export const BoardView = () => {
  const [isOpen, setIsOpen] = useState(false);
  void queryClient.prefetchQuery(queryMarketStatusOptions);

  return (
    <Main>
      <div className='mb-2 flex items-center justify-between space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>Board</h1>
      </div>
      <div className='flex-1 gap-2 overflow-auto'>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger>Open</SheetTrigger>
          {isOpen && <BoardSheet />}
        </Sheet>

        <Suspense fallback={<div>Loading...</div>}>
          <MarketStatus />
        </Suspense>
      </div>
    </Main>
  );
};

const BoardSheet = () => {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Are you absolutely sure?</SheetTitle>
        <SheetDescription>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </SheetDescription>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <MarketStatus />
          </Suspense>
        </ErrorBoundary>
      </SheetHeader>
    </SheetContent>
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
