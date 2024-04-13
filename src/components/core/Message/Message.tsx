import { FC, MutableRefObject, memo } from "react";
import {
  Message as MessageType,
  Messages,
  OperatedMessage,
  Reaction,
} from "../../../../types/Messages";
import { Skeleton } from "@mantine/core";
import { Group, PrivateRoom, RoomType } from "../../../../types/Rooms";
import { v4 as uuid } from "uuid";
import {
  Clock,
  PencilFill,
  ReplyFill,
  Clipboard,
  Trash,
  EmojiSmileFill,
} from "react-bootstrap-icons";
import {
  ID,
  SelectedImage,
  SetState,
  USER_STATUS,
} from "../../../../types/PublicTypes";
import { Avatar } from "../../shared/Avatar";
import { useMediaQuery } from "@mantine/hooks";
import { useContextMenu } from "mantine-contextmenu";
import { copyToClipBoard } from "../../../utils/copyToClipBoard";
import { socket } from "../../../adapters/socket";
import { RepliedMessageBar } from "../RepliedMessageBar";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { User } from "../../../../types/Users";
import { Reactions } from "../../shared/Reactions";
import useEmojiPickerStore from "../../../store/useEmojiPickerStore";

interface Props {
  messages: MessageType[];
  message: MessageType;
  setOperatedMessage: SetState<OperatedMessage>;
  setMessages: SetState<Messages | null>;
  index: number;
  openRoomUserModal: () => void;
  setSelectedMember: SetState<PrivateRoom | null>;
  handleSelectedImageClick: (image: SelectedImage) => void;
  userId: ID;
  handleReactionClick: (
    reaction: Reaction,
    currentRoomType: "private-room" | "group",
    currentRoomId: ID,
  ) => void;
  handleAddNewReaction: (
    newReaction: Reaction,
    currentMessage: MessageType,
    currentRoomType: "private-room" | "group",
    currentRoomId: ID,
  ) => void;
  room: RoomType;
  isMessagesLoading: boolean;
  handleHighlightMessage: (messageId: ID) => void;
  highlightedMessageId: ID | null;
  sentMessageId: ID | null;
  setSelectedImages: SetState<SelectedImage[]>;
  clickCountRef: MutableRefObject<number>;
  setImageToEdit: SetState<SelectedImage | null>;
  user: User;
  hoveredMessageId: ID | null;
  handleMessageHoverStart: (messageId: ID) => void;
  handleMessageHoverEnd: () => void;
}

//eslint-disable-next-line
const Message: FC<Props> = ({
  messages,
  index,
  user,
  userId,
  hoveredMessageId,
  handleMessageHoverEnd,
  clickCountRef,
  handleAddNewReaction,
  handleMessageHoverStart,
  message,
  room,
  openRoomUserModal,
  setSelectedMember,
  setImageToEdit,
  isMessagesLoading,
  handleReactionClick,
  setMessages,
  sentMessageId,
  setOperatedMessage,
  handleSelectedImageClick,
  highlightedMessageId,
  handleHighlightMessage,
  setSelectedImages,
}) => {
  const { showContextMenu } = useContextMenu();
  const { openEmojiPicker, currentEmojiId, closeEmojiPicker } =
    useEmojiPickerStore();
  const { authorName, authorId, content, date, id, avatar, images, reactions } =
    message;
  const reactionsWithoutDuplicates = reactions?.reduce(
    (acc: Reaction[], { reaction, ...rest }) => {
      if (!acc.some((item) => item.reaction === reaction)) {
        acc.push({ reaction, ...rest });
      }
      return acc;
    },
    [],
  );

  const isMyMessage = authorId === userId;
  const matches = useMediaQuery("(max-width: 765px)");
  const gapClass =
    messages[index].authorId === messages[index + 1]?.authorId
      ? "mb-1"
      : "mb-5";

  const contentForMenu = (imageToEdit?: SelectedImage) => {
    const Items = {
      reply: {
        key: "reply",
        onClick: replyMessage,
        title: "Reply",
        icon: <ReplyFill size={16} />,
      },
      copy: {
        key: "copy",
        title: "Copy To Clipboard",
        icon: <Clipboard size={16} />,
        onClick: () => copyToClipBoard(imageToEdit ? imageToEdit.src : content),
      },
      edit: {
        key: "edit",
        onClick: () => (imageToEdit ? edit(imageToEdit) : edit()),
        title: "Edit",
        icon: <PencilFill size={16} />,
      },
      delete: {
        key: "delete",
        onClick: deleteMessage,
        title: "Delete",
        icon: <Trash size={16} />,
      },
    };

    const commonOptions = [Items.reply, Items.copy];

    if (userId === authorId) {
      return [...commonOptions, Items.edit, Items.delete];
    }

    return commonOptions;
  };

  const handleSendReaction = (newReaction: Reaction, currentMessageId: ID) => {
    const currentMessage = messages.find((msg) => msg.id === currentMessageId);

    if (currentMessage) {
      handleAddNewReaction(
        newReaction,
        currentMessage,
        (room as PrivateRoom).commonId ? "private-room" : "group",
        (room as PrivateRoom).commonId
          ? (room as PrivateRoom).commonId
          : room.id,
      );
    }
  };

  const handleDoubleClickOnMobile = (
    _e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    currentMessageId: ID,
  ) => {
    if (isMyMessage) return;

    const heartReaction = {
      authorId: user.id,
      reaction: "❤️",
      id: uuid() as ID,
      messageId: currentMessageId,
    };

    handleSendReaction(heartReaction, currentMessageId);
  };

  const replyMessage = () => {
    setOperatedMessage((prevMessage) => ({
      ...prevMessage,
      message,
      replied: true,
    }));

    setSelectedImages([]);
  };

  const edit = (imageToEdit?: SelectedImage) => {
    if (imageToEdit) {
      setImageToEdit(imageToEdit);
    }

    setOperatedMessage((prevMessage) => ({
      ...prevMessage,
      message: imageToEdit ? { ...message, images: [imageToEdit] } : message,
      edited: true,
    }));

    setSelectedImages([]);
  };

  const deleteMessage = () => {
    setMessages((prevMessages) => {
      if (!prevMessages) return prevMessages;

      return {
        ...prevMessages,
        messages: prevMessages?.messages.filter((msg) => msg.id !== id),
      };
    });

    socket.emit(
      "delete_message",
      (room as PrivateRoom).commonId ? (room as PrivateRoom).commonId : room.id,
      id,
    );
  };

  const handleShowMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    imageToEdit?: SelectedImage,
  ) =>
    showContextMenu(contentForMenu(imageToEdit), {
      style: { backgroundColor: "#0f174a" },
    })(e);

  const handleClickOnAvatar = () => {
    setSelectedMember({
      avatar,
      name: authorName,
      id: authorId,
      commonId: "123-123-123-123-123",
      creators: [authorId],
      description: "",
      opponentRoomId: "123-123-123-123-123",
      status: USER_STATUS.ONLINE,
    });

    openRoomUserModal();
  };

  return (
    <div
      className={`flex w-fit max-w-full flex-col items-end gap-1 md:max-w-md ${gapClass} scroll-mt-36 px-5 transition-all duration-500
      ${isMyMessage ? "self-end" : "self-start"} relative`}
      style={{
        backgroundColor:
          id === highlightedMessageId ? "#157be8a2" : "transparent",
        width: id === highlightedMessageId ? "100%" : "initial",
      }}
      onContextMenu={(e) => !images && !matches && handleShowMenu(e)}
      id={id}
      onClick={async (e) => {
        if (!matches) return;

        clickCountRef.current++;

        setTimeout(() => {
          const clickCount = clickCountRef.current;

          if (clickCount === 1) {
            handleShowMenu(e);
          } else if (clickCount === 2) {
            handleDoubleClickOnMobile(e, id);
          }

          clickCountRef.current = 0;
        }, 500);
      }}
      onMouseEnter={() => handleMessageHoverStart(id)}
      onMouseLeave={handleMessageHoverEnd}
    >
      <div
        className="flex gap-2"
        style={{
          alignSelf: !isMyMessage ? "start" : "end",
        }}
      >
        {userId !== authorId && (room as Group).members && (
          <Skeleton
            visible={isMessagesLoading}
            circle
            className="h-fit w-fit cursor-pointer"
            onClick={handleClickOnAvatar}
          >
            <Avatar name={authorName} avatar={avatar} />
          </Skeleton>
        )}

        <div className={`flex max-w-[250px] flex-col gap-1 md:max-w-md`}>
          <Skeleton visible={isMessagesLoading}>
            <div
              className={`flex flex-col gap-2 rounded-lg border-2 border-transparent p-2 text-sm ${
                isMyMessage ? "bg-blue-500" : "bg-slate-800"
              }`}
            >
              {(room as Group).members && userId !== authorId && (
                <p
                  className="cursor-pointer text-sm font-bold text-blue-500"
                  onClick={handleClickOnAvatar}
                >
                  {authorName}
                </p>
              )}

              {message.repliedMessage && (
                <RepliedMessageBar
                  handleHighlightMessage={handleHighlightMessage}
                  messageId={message.repliedMessage.id}
                  author={message.repliedMessage.author}
                  message={message.repliedMessage.message}
                  images={message.repliedMessage.images}
                  isOpponentMessage={userId !== authorId}
                />
              )}

              {!!content.length && (
                <pre className="whitespace-pre-line break-words">{content}</pre>
              )}

              {reactionsWithoutDuplicates &&
                reactions &&
                !!reactions.length && (
                  <Reactions
                    currentRoomId={
                      (room as PrivateRoom).commonId
                        ? (room as PrivateRoom).commonId
                        : room.id
                    }
                    handleReactionClick={handleReactionClick}
                    isGroup={!!(room as Group).members}
                    isPrivateRoom={!!(room as PrivateRoom).commonId}
                    isMyMessage={isMyMessage}
                    reactions={reactions}
                    reactionsToShow={reactionsWithoutDuplicates}
                    userId={user.id}
                  />
                )}

              {images && (
                <div className="flex flex-wrap gap-2">
                  {images.map((image, index) => (
                    <img
                      className="h-[200px] cursor-pointer object-cover"
                      src={image.src}
                      style={{
                        maxWidth:
                          images.length > 1 && index !== 2 && index !== 4
                            ? "200px"
                            : "100%",
                      }}
                      key={image.id}
                      alt={image.name}
                      onClick={() =>
                        !matches && handleSelectedImageClick(image)
                      }
                      onContextMenu={(e) => handleShowMenu(e, image)}
                    />
                  ))}
                </div>
              )}
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

      {!matches && (
        <EmojiSmileFill
          className="absolute top-[-10px] z-10 h-5 w-5 cursor-pointer text-[#3b82f6] transition-all duration-300"
          style={{
            opacity:
              hoveredMessageId === id &&
              ((room as Group).members ||
                ((room as PrivateRoom).commonId && authorId !== user.id))
                ? "1"
                : "0",
            pointerEvents:
              hoveredMessageId === id &&
              ((room as Group).members ||
                ((room as PrivateRoom).commonId && authorId !== user.id))
                ? "all"
                : "none",
            left: userId === authorId ? "-5px" : "initial",
            right: userId !== authorId ? "-5px" : "initial",
          }}
          onClick={() =>
            currentEmojiId && currentEmojiId !== "1234-1234-1234-1234-1234"
              ? closeEmojiPicker()
              : openEmojiPicker(id)
          }
        />
      )}

      {currentEmojiId === id && (
        <div
          className="absolute top-[10px] z-50 transition-all duration-300"
          style={{
            left: userId === authorId ? "-350px" : "initial",
            right: userId !== authorId ? "-350px" : "initial",
          }}
        >
          <EmojiPicker
            theme={Theme.DARK}
            lazyLoadEmojis
            onEmojiClick={(emoji) => {
              const newReaction: Reaction = {
                authorId: user.id,
                reaction: emoji.emoji,
                id: uuid() as ID,
                messageId: currentEmojiId,
              };

              handleSendReaction(newReaction, currentEmojiId);
              handleMessageHoverEnd();
              closeEmojiPicker();
            }}
          />
        </div>
      )}
    </div>
  );
};

// eslint-disable-next-line
export default memo(Message);
