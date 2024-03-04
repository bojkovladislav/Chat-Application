import { FC, useEffect, useMemo } from "react";
import {
  Message as MessageType,
  Messages,
  OperatedMessage,
} from "../../../../types/Messages";
import { User } from "../../../../types/Users";
import { socket } from "../../../adapters/socket";
import { ID, SetState } from "../../../../types/PublicTypes";
import { v4 as uuid } from "uuid";
import { generateRandomParagraph } from "../../../utils/generateRandomParagraph";
import { RoomType } from "../../../../types/Rooms";
import { Message } from "../Message";
import "@mantine/core/styles.css";
import _debounce from "lodash/debounce";

interface Props {
  user: User;
  messages: Messages | null;
  sentMessageId: ID | null;
  isMessagesLoading: boolean;
  setMessages: SetState<Messages | null>;
  room: RoomType;
  setNewMessageFromOpponentId: SetState<null | ID>;
  setCurrentTypingUserName: SetState<string | null>;
  setOperatedMessage: SetState<OperatedMessage>;
}

const MessageField: FC<Props> = ({
  user,
  messages,
  setMessages,
  isMessagesLoading,
  setNewMessageFromOpponentId,
  sentMessageId,
  setCurrentTypingUserName,
  setOperatedMessage,
  room,
}) => {
  const handleReceiveMessage = (newMessage: MessageType) => {
    setMessages((prevMessages) => {
      if (!prevMessages) return prevMessages; // || prevMessages.roomId !== roomId not sure

      setNewMessageFromOpponentId(newMessage.id);

      return {
        ...prevMessages,
        messages: [...prevMessages.messages, newMessage],
      };
    });
  };

  useEffect(() => {
    socket.on("receive_message", (newMessage) => {
      handleReceiveMessage(newMessage);
    });

    socket.on("receive_deleted_message-id", (messageId) => {
      setMessages((prevMessages) => {
        if (!prevMessages) return prevMessages;

        return {
          ...prevMessages,
          messages: prevMessages?.messages.filter(
            (msg) => msg.id !== messageId,
          ),
        };
      });
    });

    socket.on("receive_updated_message", (messageId, updatedContent) => {
      setMessages((prevMessages) => {
        if (!prevMessages) return prevMessages;

        const updatedMessages = prevMessages?.messages.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              content: updatedContent,
            };
          }

          return msg;
        });

        return {
          ...prevMessages,
          messages: updatedMessages,
        };
      });
    });

    const debouncedResetUserName = _debounce(
      () => setCurrentTypingUserName(""),
      500,
    );

    socket.on("typing_receive", (userName) => {
      setCurrentTypingUserName(userName);

      debouncedResetUserName();
    });

    return () => {
      socket.off("receive_message");
      socket.off("get_messages");
      socket.off("messages_got");
      socket.off("message_created");
      socket.off("typing_receive");

      debouncedResetUserName.cancel();
    };
    // eslint-disable-next-line
  }, []);

  const messagesData: MessageType[] = useMemo(
    () =>
      isMessagesLoading
        ? (Array.from({ length: 5 }).map((_, i) => {
            return {
              id: uuid(),
              authorName: i % 2 !== 0 ? "Friend" : user.name,
              authorId: i % 2 !== 0 ? "123-123-123-123-123" : user.id,
              content: generateRandomParagraph(),
              date: "13:37",
              avatar: "",
            };
          }) as MessageType[])
        : (messages?.messages as MessageType[]),
        // eslint-disable-next-line
    [isMessagesLoading, messages],
  );

  return (
    <div className="flex flex-col p-5">
      {messagesData &&
        messagesData.map((message, index, arr) => (
          <Message
            key={message.id}
            room={room}
            setMessages={setMessages}
            setOperatedMessage={setOperatedMessage}
            message={message}
            messages={arr}
            index={index}
            isMessagesLoading={isMessagesLoading}
            sentMessageId={sentMessageId}
            userId={user.id}
          />
        ))}
    </div>
  );
};

export default MessageField;
