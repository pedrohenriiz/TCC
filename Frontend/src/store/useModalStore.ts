import { create } from 'zustand';

type ValidModals = 'CREATE_MAPPING' | 'CREATE_TABLE_CONFIG';

const useModalStore = create((set, get) => ({
  openedModals: [],
  data: {},

  setOpenedModals: (openModal: ValidModals, modalData: unknown) => {
    const isModalAlreadyOpened = get().openedModals.find(
      (modalId) => modalId === openModal
    );

    if (!isModalAlreadyOpened) {
      set((state) => ({
        openedModals: [...state.openedModals, openModal],
      }));
    }

    if (modalData) {
      set((state) => ({
        data: {
          ...state.data,
          [openModal]: modalData,
        },
      }));
    }
  },

  closeOpenedModal: () => {
    const removedModal = get().openedModals.pop();

    const modalData = get().data;

    const removedModalHasData = modalData[removedModal];

    if (removedModal && removedModalHasData) {
      set((state) => {
        delete state.data[removedModal];
        return state;
      });
    }
  },

  closeAllModals: () => {
    set({
      openedModals: [],
      data: {},
    });
  },
}));

export default useModalStore;
