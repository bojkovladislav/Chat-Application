import { FC } from "react";
import { PencilFill, ReplyFill, X } from "react-bootstrap-icons";
import { Message } from "../../../../types/Messages";
import { normalizeTextLength } from "../../../utils/normalizeTextLength";

interface Props {
  operation: "edit" | "reply";
  message: Message;
  handleCloseBar: () => void;
}

const MessageOperationBar: FC<Props> = ({
  operation,
  message,
  handleCloseBar,
}) => {
  return (
    <div className="flex max-h-20 items-center justify-between bg-transparent">
      <div className="flex items-center gap-5">
        {operation === "edit" ? (
          <PencilFill className="text-blue-500" />
        ) : (
          <ReplyFill className="text-blue-500" />
        )}

        <div>
          <h2 className="text-blue-500">
            {operation === "edit"
              ? "Edit message"
              : `Reply to ${message.authorName}`}
          </h2>
          <p className="text-sm">{normalizeTextLength(message.content, 90)}</p>
        </div>
      </div>

      <X
        onClick={handleCloseBar}
        className="cursor-pointer text-gray-400 transition-colors duration-300 hover:text-blue-500"
        size={25}
      />
    </div>
  );
};

export default MessageOperationBar;
