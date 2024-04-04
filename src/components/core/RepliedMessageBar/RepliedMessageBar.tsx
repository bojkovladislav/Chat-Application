import { FC } from "react";
import { normalizeTextLength } from "../../../utils/normalizeTextLength";
import { ID, SelectedImage } from "../../../../types/PublicTypes";
import { Image } from "../../shared/Image";

interface Props {
  author: string;
  message: string;
  messageId: ID;
  images: SelectedImage[] | null;
  isOpponentMessage: boolean;
  handleHighlightMessage: (messageId: ID) => void;
}

const RepliedMessageBar: FC<Props> = ({
  author,
  message,
  messageId,
  images,
  isOpponentMessage,
  handleHighlightMessage,
}) => {
  const colors = {
    primaryColor: isOpponentMessage ? "#26344a" : "#157ae8",
    secondaryColor: isOpponentMessage ? "#5a6373" : "#adcdf0",
    messageColor: isOpponentMessage ? "#838b91" : "#d9dadb",
  };

  return (
    <a
      className="flex items-center gap-5 rounded-sm border-l-4 px-2"
      style={{
        borderColor: colors.secondaryColor,
        color: colors.secondaryColor,
        backgroundColor: colors.primaryColor,
      }}
      href={`#${messageId}`}
      onClick={(e) => {
        e.stopPropagation();
        handleHighlightMessage(messageId);
      }}
    >
      {images && <Image image={images[0]} size={40} />}

      <div className={`flex flex-col gap-1 `}>
        <p className="text-sm font-bold">{author}</p>
        <p className="text-xxs" style={{ color: colors.messageColor }}>
          {normalizeTextLength(!message.length ? "Photo" : message, 50)}
        </p>
      </div>
    </a>
  );
};

export default RepliedMessageBar;
