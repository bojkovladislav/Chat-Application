import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  Message as MessageType,
  Messages,
  OperatedMessage,
  Reaction,
} from "../../../../types/Messages";
import { User } from "../../../../types/Users";
import { socket } from "../../../adapters/socket";
import { ID, SelectedImage, SetState } from "../../../../types/PublicTypes";
import { v4 as uuid } from "uuid";
import { generateRandomParagraph } from "../../../utils/generateRandomParagraph";
import { PrivateRoom, RoomType } from "../../../../types/Rooms";
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
  setSelectedImages: SetState<SelectedImage[]>;
  setCurrentTypingUserName: SetState<string | null>;
  operatedMessage: OperatedMessage;
  setOperatedMessage: SetState<OperatedMessage>;
  setSelectedMember: SetState<PrivateRoom | null>;
  handleSelectedImageClick: (image: SelectedImage) => void;
  openRoomUserModal: () => void;
  setImageToEdit: SetState<SelectedImage | null>;
}

const MessageField: FC<Props> = ({
  user,
  messages,
  setMessages,
  isMessagesLoading,
  setImageToEdit,
  setNewMessageFromOpponentId,
  sentMessageId,
  setCurrentTypingUserName,
  handleSelectedImageClick,
  setSelectedImages,
  setOperatedMessage,
  setSelectedMember,
  openRoomUserModal,
  room,
}) => {
  const [highlightedMessageId, setHighlightedMessageId] = useState<ID | null>(
    null,
  );
  const [hoveredMessageId, setHoveredMessageId] = useState<ID | null>(null);
  const clickCountRef = useRef(0);

  const handleMessageHoverStart = (currentMessageId: ID) =>
    setHoveredMessageId(currentMessageId);

  const handleMessageHoverEnd = () => setHoveredMessageId(null);

  const handleHighlightMessage = (messageId: ID) => {
    setHighlightedMessageId(messageId);
  };

  const handleReceiveMessage = (newMessage: MessageType) => {
    setMessages((prevMessages) => {
      if (!prevMessages) return prevMessages;

      setNewMessageFromOpponentId(newMessage.id);

      return {
        ...prevMessages,
        messages: [...prevMessages.messages, newMessage],
      };
    });
  };

  const filteredReactions = (reactions: Reaction[], newReaction: Reaction) => {
    const currentReaction = newReaction.reaction;

    const reactionToDelete = reactions.find(
      (reaction) =>
        reaction.authorId === user.id && reaction.reaction === currentReaction,
    );

    if (reactionToDelete) {
      return reactions.filter(
        (reaction) => reaction.id !== reactionToDelete.id,
      );
    }

    return [...reactions, newReaction];
  };

  const handleAddNewReaction = (
    newReaction: Reaction,
    currentMessage: MessageType,
    currentRoomType: "private-room" | "group",
    currentRoomId: ID,
  ) => {
    setMessages((prevMessages) =>
      prevMessages
        ? {
            ...prevMessages,
            messages: prevMessages.messages.map((msg) => {
              let reactions;

              const getUpdatedReactions = () => {
                if (currentRoomType === "private-room") {
                  return [newReaction];
                }

                return msg.reactions
                  ? [...msg.reactions, newReaction]
                  : [newReaction];
              };

              if (msg.id === currentMessage.id) {
                if (
                  msg.reactions?.some(
                    (r) => r.reaction === newReaction.reaction,
                  )
                ) {
                  if (currentRoomType === "private-room") {
                    reactions = msg.reactions ? [] : null;
                  } else {
                    reactions = msg.reactions.filter(
                      (reaction) => reaction.authorId !== newReaction.authorId,
                    );
                  }
                }
                reactions = getUpdatedReactions();

                socket.emit(
                  "message_update_reactions",
                  currentRoomId,
                  currentMessage.id,
                  reactions,
                );

                return {
                  ...msg,
                  reactions,
                };
              }

              return msg;
            }),
          }
        : null,
    );
  };

  const handleChangeReactions = (messageId: ID, newReactions: Reaction[]) => {
    setMessages((prevMessages) =>
      prevMessages
        ? {
            ...prevMessages,
            messages:
              prevMessages.messages &&
              prevMessages.messages.map((msg) => {
                if (messageId === msg.id) {
                  return {
                    ...msg,
                    reactions: newReactions,
                  };
                }

                return msg;
              }),
          }
        : null,
    );
  };

  const handleReactionClick = (
    newReaction: Reaction,
    currentRoomType: "private-room" | "group",
    currentRoomId: ID,
  ) => {
    if (currentRoomType === "private-room") {
      socket.emit(
        "message_update_reactions",
        currentRoomId,
        newReaction.messageId,
        null,
      );
    } else {
      const currentReactions = messages?.messages.find(
        (msg) => msg.id === newReaction.messageId,
      )?.reactions;

      if (!currentReactions) return;

      const updatedReactions = filteredReactions(currentReactions, newReaction);

      socket.emit(
        "message_update_reactions",
        currentRoomId,
        newReaction.messageId,
        updatedReactions,
      );
    }
  };

  useEffect(() => {
    socket.on("receive_message", handleReceiveMessage);

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
              ...updatedContent,
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

    socket.on("send_added_reaction", handleAddNewReaction);

    socket.on("message_updated_reactions", handleChangeReactions);

    return () => {
      socket.off("receive_message");
      socket.off("get_messages");
      socket.off("send_added_reaction");
      socket.off("message_add_reaction");
      socket.off("messages_got");
      socket.off("message_created");
      socket.off("message_update_reactions");
      socket.off("message_updated_reactions");
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

  useEffect(() => {
    if (!highlightedMessageId) return;

    const timeout = setTimeout(() => {
      setHighlightedMessageId(null);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [highlightedMessageId]);

  return (
    <div className="flex flex-col pt-5">
      {messagesData &&
        messagesData.map((message, index, arr) => (
          <Message
            key={message.id}
            clickCountRef={clickCountRef}
            room={room}
            setSelectedImages={setSelectedImages}
            setMessages={setMessages}
            handleAddNewReaction={handleAddNewReaction}
            user={user}
            hoveredMessageId={hoveredMessageId}
            handleMessageHoverStart={handleMessageHoverStart}
            handleMessageHoverEnd={handleMessageHoverEnd}
            highlightedMessageId={highlightedMessageId}
            handleHighlightMessage={handleHighlightMessage}
            handleReactionClick={handleReactionClick}
            setImageToEdit={setImageToEdit}
            setOperatedMessage={setOperatedMessage}
            openRoomUserModal={openRoomUserModal}
            message={message}
            setSelectedMember={setSelectedMember}
            messages={arr}
            index={index}
            handleSelectedImageClick={handleSelectedImageClick}
            isMessagesLoading={isMessagesLoading}
            sentMessageId={sentMessageId}
            userId={user.id}
          />
        ))}
    </div>
  );
};

export default MessageField;
