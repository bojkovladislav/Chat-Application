import { FC } from "react";
import { normalizeTextLength } from "../../../utils/normalizeTextLength";

interface Props {
  author: string;
  message: string;
  isOpponentMessage: boolean;
}

const RepliedMessageBar: FC<Props> = ({
  author,
  message,
  isOpponentMessage,
}) => {
  const colors = {
    primaryColor: isOpponentMessage ? "slate-600" : "blue-600",
    secondaryColor: isOpponentMessage ? "slate-400" : "blue-300",
    messageColor: isOpponentMessage ? "slate-300" : "gray-200",
  } as const;

  return (
    <div
      className={`flex flex-col gap-1 rounded-sm border-l-4 px-2 border-${colors.secondaryColor} bg-${colors.primaryColor}`}
    >
      <p className={`text-sm font-bold text-${colors.secondaryColor}`}>
        {author}
      </p>
      <p className={`text-xxs text-${colors.messageColor}`}>
        {normalizeTextLength(message, 50)}
      </p>
    </div>
  );
};

export default RepliedMessageBar;
