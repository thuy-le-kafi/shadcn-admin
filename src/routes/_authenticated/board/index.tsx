import { createFileRoute } from '@tanstack/react-router';
import { queryMarketStatusOptions } from '@/features/boards/services/queries';
import { BoardView } from '@/features/boards/views/board-view';

export const Route = createFileRoute('/_authenticated/board/')({
  component: BoardView,
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(queryMarketStatusOptions);
  },
});
