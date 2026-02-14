// store/useMigrationStore.ts

import { create } from 'zustand';
import type { MigrationResponse, MigrationStatus } from '../Screens/Mapping/MigrationResponse/types';

interface MigrationStore {
  // Estado
  status: MigrationStatus;
  result: MigrationResponse | null;
  isResultVisible: boolean;
  
  // Ações
  setStatus: (status: MigrationStatus) => void;
  setResult: (result: MigrationResponse | null) => void;
  showResult: () => void;
  hideResult: () => void;
  reset: () => void;
}

export const useMigrationStore = create<MigrationStore>((set) => ({
  // Estado inicial
  status: 'idle',
  result: null,
  isResultVisible: false,
  
  // Ações
  setStatus: (status) => set({ status }),
  
  setResult: (result) => set({ 
    result,
    isResultVisible: result !== null,
    status: result ? 'success' : 'idle'
  }),
  
  showResult: () => set({ isResultVisible: true }),
  
  hideResult: () => set({ isResultVisible: false }),
  
  reset: () => set({ 
    status: 'idle',
    result: null,
    isResultVisible: false
  }),
}));