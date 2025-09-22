import { SOCKET_STATUS } from '@/config/constants';
import { create } from 'zustand';

type GlobalState = {
  socketStatus: SOCKET_STATUS;
  isSocketInitialized: boolean;
  actions: {
    setSocketStatus: (status: SOCKET_STATUS) => void;
    setIsSocketInitialized: (isInitialized: boolean) => void;
  };
};

export const useGlobalStore = create<GlobalState>()((set) => ({
  socketStatus: SOCKET_STATUS.DISCONNECTED,
  isSocketInitialized: false,
  actions: {
    setSocketStatus: (status: SOCKET_STATUS) => {
      set({ socketStatus: status });
    },
    setIsSocketInitialized: (isInitialized: boolean) => {
      set({ isSocketInitialized: isInitialized });
    },
  },
}));

export const useSocketStatus = () => {
  return useGlobalStore((state) => state.socketStatus);
};

export const useIsSocketInitialized = () => {
  return useGlobalStore((state) => state.isSocketInitialized);
};

export const useGlobalActions = () => {
  return useGlobalStore((state) => state.actions);
};
