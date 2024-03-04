import { FC } from "react";
import { ArrowDown } from "react-bootstrap-icons";

interface Props {
  scrollChatToBottom: (smooth?: boolean) => void;
  isNewMessagesVisible: boolean;
}

const NewMessageNotification: FC<Props> = ({
  scrollChatToBottom,
  isNewMessagesVisible,
}) => {
  return (
    <div
      className={`absolute bottom-14 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform cursor-pointer items-center gap-3 rounded-lg border-2 border-slate-600 bg-slate-900 p-3 transition-opacity`}
      onClick={() => scrollChatToBottom(true)}
      style={{
        opacity: Number(isNewMessagesVisible),
        display: isNewMessagesVisible ? "flex" : "none",
      }}
    >
      <p>New messages</p>
      <ArrowDown />
    </div>
  );
};

export default NewMessageNotification;
