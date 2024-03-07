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
    primaryColor: isOpponentMessage ? "#26344a" : "#157ae8",
    secondaryColor: isOpponentMessage ? "#5a6373" : "#adcdf0",
    messageColor: isOpponentMessage ? "#838b91" : "#d9dadb",
  };

  return (
    <div
      className={`flex flex-col gap-1 rounded-sm border-l-4 px-2`}
      style={{
        borderColor: colors.secondaryColor,
        color: colors.secondaryColor,
        backgroundColor: colors.primaryColor,
      }}
    >
      <p className="text-sm font-bold">{author}</p>
      <p className="text-xxs" style={{ color: colors.messageColor }}>
        {normalizeTextLength(message, 50)}
      </p>
    </div>
  );
};

export default RepliedMessageBar;
