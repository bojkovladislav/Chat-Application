import { StoreApi, UseBoundStore, create } from "zustand";

interface useDisclosure {
  isOpened: boolean;
  openDiscloSure: () => void;
  closeDiscloSure: () => void;
}

export type Item = "deleteRoomItem" | "roomInfoItem" | "manageRoomItem";

type ItemsObj = Record<Item, useDisclosure>;

enum MODAL_ACTION {
  OPEN = "open",
  CLOSE = "close",
}

type SetFunction<T> = (
  partial: Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean,
) => void;

const operateModal = (
  set: SetFunction<ItemsObj>,
  item: Item,
  action: MODAL_ACTION,
) => {
  return set((state: ItemsObj) => ({
    [item]: { ...state[item], isOpened: action === "close" ? false : true },
  }));
};

const useDisclosureStore: UseBoundStore<StoreApi<ItemsObj>> = create((set) => ({
  deleteRoomItem: {
    isOpened: false,
    openDiscloSure: () =>
      operateModal(set, "deleteRoomItem", MODAL_ACTION.OPEN),
    closeDiscloSure: () =>
      operateModal(set, "deleteRoomItem", MODAL_ACTION.CLOSE),
  },
  roomInfoItem: {
    isOpened: false,
    openDiscloSure: () => operateModal(set, "roomInfoItem", MODAL_ACTION.OPEN),
    closeDiscloSure: () =>
      operateModal(set, "roomInfoItem", MODAL_ACTION.CLOSE),
  },
  manageRoomItem: {
    isOpened: false,
    openDiscloSure: () =>
      operateModal(set, "manageRoomItem", MODAL_ACTION.OPEN),
    closeDiscloSure: () =>
      operateModal(set, "manageRoomItem", MODAL_ACTION.CLOSE),
  },
}));

export default useDisclosureStore;
