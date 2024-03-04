import { FC } from "react";
import {
  Message as MessageType,
  Messages,
  OperatedMessage,
} from "../../../../types/Messages";
import { Skeleton } from "@mantine/core";
import { Group, RoomType } from "../../../../types/Rooms";
import {
  Clock,
  PencilFill,
  ReplyFill,
  Clipboard,
  Trash,
} from "react-bootstrap-icons";
import { ID, SetState } from "../../../../types/PublicTypes";
import { Avatar } from "../../shared/Avatar";
import { useMediaQuery } from "@mantine/hooks";
import { useContextMenu } from "mantine-contextmenu";
import { copyToClipBoard } from "../../../utils/copyToClipBoard";
import { socket } from "../../../adapters/socket";
import { RepliedMessageBar } from "../RepliedMessageBar";

interface Props {
  messages: MessageType[];
  message: MessageType;
  setOperatedMessage: SetState<OperatedMessage>;
  setMessages: SetState<Messages | null>;
  index: number;
  userId: ID;
  room: RoomType;
  isMessagesLoading: boolean;
  sentMessageId: ID | null;
}

const Message: FC<Props> = ({
  messages,
  index,
  userId,
  message,
  room,
  isMessagesLoading,
  setMessages,
  sentMessageId,
  setOperatedMessage,
}) => {
  const { showContextMenu } = useContextMenu();
  const { authorName, authorId, content, date, id, avatar } = message;
  const isMyMessage = authorId === userId;
  const matches = useMediaQuery("(max-width: 765px)");
  const gapClass =
    messages[index].authorId === messages[index + 1]?.authorId
      ? "mb-1"
      : "mb-5";

  const contentForMenu = () => {
    const commonOptions = [
      {
        key: "reply",
        onClick: replyMessage,
        title: "Reply",
        icon: <ReplyFill size={16} />,
      },
      {
        key: "copy",
        title: "Copy To Clipboard",
        icon: <Clipboard size={16} />,
        onClick: () => copyToClipBoard(content),
      },
    ];

    return userId === authorId
      ? [
          ...commonOptions,
          {
            key: "edit",
            onClick: editMessage,
            title: "Edit",
            icon: <PencilFill size={16} />,
          },
          {
            key: "delete",
            onClick: deleteMessage,
            title: "Delete",
            icon: <Trash size={16} />,
          },
        ]
      : commonOptions;
  };

  const replyMessage = () => {
    setOperatedMessage((prevMessage) => ({
      ...prevMessage,
      message,
      replied: true,
    }));
  };

  const editMessage = () => {
    setOperatedMessage((prevMessage) => ({
      ...prevMessage,
      message,
      edited: true,
    }));
  };

  const deleteMessage = () => {
    setMessages((prevMessages) => {
      if (!prevMessages) return prevMessages;

      return {
        ...prevMessages,
        messages: prevMessages?.messages.filter((msg) => msg.id !== id),
      };
    });

    socket.emit("delete_message", room.id, id);
  };

  const handleShowMenu = showContextMenu(contentForMenu(), {
    style: { backgroundColor: "#0f174a" },
  });

  return (
    <div
      className={`flex w-fit max-w-full flex-col gap-1 md:max-w-md ${gapClass}
      ${isMyMessage ? "self-end" : "self-start"}`}
      onContextMenu={handleShowMenu}
      onClick={(e) => matches && handleShowMenu(e)}
    >
      <div className="flex gap-2">
        {userId !== authorId && (room as Group).members && (
          <Skeleton visible={isMessagesLoading} circle className="h-fit w-fit">
            <Avatar name={authorName} avatar={avatar} />
          </Skeleton>
        )}

        <div className={`flex max-w-[250px] flex-col gap-1 md:max-w-md`}>
          <Skeleton visible={isMessagesLoading}>
            <div
              className={`flex flex-col gap-2 rounded-lg border-2 border-transparent p-2 text-sm ${
                authorId === userId ? "bg-blue-500" : "bg-slate-800"
              }`}
            >
              {(room as Group).members && userId !== authorId && (
                <p className="text-sm font-bold text-blue-500">{authorName}</p>
              )}

              {message.repliedMessage && (
                <RepliedMessageBar
                  author={message.repliedMessage.author}
                  message={message.repliedMessage.message}
                  isOpponentMessage={userId !== authorId}
                />
              )}
              <pre className="whitespace-pre-line break-words">{content}</pre>
            </div>
          </Skeleton>

          <div className="flex w-full justify-between">
            <Skeleton className="w-fit" visible={isMessagesLoading}>
              <p className="text-xxs text-slate-400">{date}</p>
            </Skeleton>
            {sentMessageId && sentMessageId === id && (
              <Clock className="text-xs text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
