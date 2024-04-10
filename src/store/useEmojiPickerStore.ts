import { create, StoreApi, UseBoundStore } from "zustand";
import { ID } from "../../types/PublicTypes";

interface useEmojiPickerStoreType {
  currentEmojiId: ID | null;
  openEmojiPicker: (emojiId: ID) => void;
  closeEmojiPicker: () => void;
}

const useEmojiPickerStore: UseBoundStore<StoreApi<useEmojiPickerStoreType>> =
  create((set) => ({
    currentEmojiId: null,
    openEmojiPicker: (emojiId) => set({ currentEmojiId: emojiId }),
    closeEmojiPicker: () => set({ currentEmojiId: null }),
  }));

export default useEmojiPickerStore;
