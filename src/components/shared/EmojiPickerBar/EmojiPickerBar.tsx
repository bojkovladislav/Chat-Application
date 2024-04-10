import { FC } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface Props {
  handleEmojiSelection: (emoji: EmojiClickData) => void;
  // isSendMessageBarBiggerThanUsual?: boolean;
  // closePicker: () => void;
}

const EmojiPickerBar: FC<Props> = ({
  handleEmojiSelection,
  // closePicker,
  // isSendMessageBarBiggerThanUsual,
}) => {
  return (
    // fixed left-0 top-0 h-full w-full
    // <div className="fixed left-0 top-0 h-full w-full" onClick={closePicker}>
      // <div
      //   className={`absolute left-[600px] z-50 ${
      //     isSendMessageBarBiggerThanUsual
      //       ? isSendMessageBarBiggerThanUsual
      //         ? "top-[70px]"
      //         : "top-[140px]"
      //       : ""
      //   }`}
      //   onClick={(e) => e.stopPropagation()}
      // >
        <EmojiPicker
          theme={Theme.DARK}
          lazyLoadEmojis
          onEmojiClick={handleEmojiSelection}
        />
      // {/* </div> */}
    // </div>
  );
};

export default EmojiPickerBar;
