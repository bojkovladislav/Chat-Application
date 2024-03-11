import { useEffect, useRef, useState, memo, FC } from "react";
import { MessageField } from "../MessageField";
import { SendMessageForm } from "../../forms/SendMessageForm";
import { useDisclosure } from "@mantine/hooks";
import { User } from "../../../../types/Users";
import { v4 as uuid } from "uuid";
import { Messages, OperatedMessage } from "../../../../types/Messages";
import { ID, SetState } from "../../../../types/PublicTypes";
import {
  Group,
  PrivateRoom,
  RoomType,
  RoomsType,
} from "../../../../types/Rooms";
import { NewMessageNotification } from "../NewMessageNotification";
import { ScrollToBottomArrow } from "../../shared/ScrollToBottomArrow";
import { socket } from "../../../adapters/socket";
import { Modal } from "../../shared/Modal";
import useDisclosureStore from "../../../store/useRoomDisclosureStore";
import { DeleteGroupForm } from "../DeleteRoomModal";
import { ViewRoomInfo } from "../ViewRoomInfoModal";
import { UserInfo } from "../UserInfo";
import { ChatHeader } from "../ChatHeader";

interface Props {
  messages: Messages | null;
  setMessages: SetState<Messages | null>;
  areMessagesLoading: boolean;
  user: User;
  room: RoomType | null;
  setRoom: SetState<RoomType | null>;
  setRooms: SetState<RoomsType>;
  filteredChats: RoomsType | null;
  setFilteredChats: SetState<RoomsType | null>;
  setAreMessagesLoading: SetState<boolean>;
  rooms: RoomsType;
}
// eslint-disable-next-line
const Chat: FC<Props> = ({
  user,
  room,
  setMessages,
  messages,
  setRoom,
  areMessagesLoading: isMessagesLoading,
  setRooms,
  filteredChats,
  setFilteredChats,
  setAreMessagesLoading,
  rooms,
}) => {
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [sentMessageId, setSentMessageId] = useState<ID | null>(null);
  const [newMessageFromOpponentId, setNewMessageFromOpponentId] =
    useState<ID | null>(null);
  const [isNewMessagesVisible, setIsNewMessagesVisible] = useState(false);
  const [isUserScrollingUp, setIsUserScrollingUp] = useState(false);
  const [currentTypingUserName, setCurrentTypingUserName] = useState<
    string | null
  >(null);
  const [operatedMessage, setOperatedMessage] = useState<OperatedMessage>({
    message: null,
    edited: false,
    replied: false,
  });
  const isUserNearBottom = useRef<boolean>(false);
  const isOverflowTriggered = useRef<boolean>(false);
  const {
    isOpened: isDeleteRoomModalOpened,
    closeDiscloSure: closeDeleteRoomModal,
  } = useDisclosureStore().deleteRoomItem;
  const {
    isOpened: isRoomInfoModalOpen,
    openDiscloSure: openRoomInfoModal,
    closeDiscloSure: closeRoomInfoModal,
  } = useDisclosureStore().roomInfoItem;
  const [
    isUserModalOpened,
    { open: openRoomUserModal, close: closeRoomUserModal },
  ] = useDisclosure(false);
  const [selectedMember, setSelectedMember] = useState<PrivateRoom | null>(
    null,
  );

  const scrollChatToBottom = (smooth: boolean = false) => {
    if (chatWindowRef.current && !isMessagesLoading) {
      const chatWindow = chatWindowRef.current;

      chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });

      setNewMessageFromOpponentId(null);
    }
  };

  const handleScroll = () => {
    if (chatWindowRef.current) {
      const chatWindow = chatWindowRef.current;
      const threshold = 100;
      const isBottomNearViewportBottom =
        chatWindow.scrollTop + chatWindow.clientHeight >=
        chatWindow.scrollHeight - threshold;
      const isOverflowScrolling =
        chatWindow.scrollHeight > chatWindow.clientHeight;

      isUserNearBottom.current = isBottomNearViewportBottom;
      isOverflowTriggered.current = isOverflowScrolling;

      if (isBottomNearViewportBottom || !isOverflowScrolling) {
        setIsNewMessagesVisible(false);
        setIsUserScrollingUp(false);
      } else {
        setIsUserScrollingUp(true);
      }
    }
  };

  const handleCloseViewRoomInfoModal = () => {
    closeRoomUserModal();
    openRoomInfoModal();
  };

  const handleSendDirectMessage = async (member: PrivateRoom) => {
    closeRoomUserModal();

    const foundRoom = rooms.find((room) => room.name === member.name);

    if (foundRoom) {
      setRoom(foundRoom);

      return;
    }

    let doesOpponentExist = false;

    if (!member.opponentRoomId) {
      socket.emit("check_for_existing_opponent_room", member, user);

      await new Promise<void>((resolve) => {
        socket.on("opponent_room_not_exist", () => {
          doesOpponentExist = false;
          resolve();
        });

        socket.on("send_private-room", (newPrivateRoom) => {
          setRooms((prevRooms) => [newPrivateRoom, ...prevRooms]);
          setAreMessagesLoading(true);
          resolve();
        });
      });

      if (doesOpponentExist) return;
    }

    const newLocalRoom: PrivateRoom = {
      ...member,
      id: uuid() as ID,
      commonId: uuid() as ID,
      creators: [user.id, member.id],
    };

    setRooms((prevRooms) => [newLocalRoom, ...prevRooms]);
    setRoom(newLocalRoom);
    setAreMessagesLoading(false);
  };

  useEffect(() => {
    scrollChatToBottom();
    // eslint-disable-next-line
  }, [isMessagesLoading, sentMessageId]);

  useEffect(() => {
    if (newMessageFromOpponentId && isOverflowTriggered.current) {
      isUserNearBottom.current
        ? scrollChatToBottom(true)
        : setIsNewMessagesVisible(true);
    }
    // eslint-disable-next-line
  }, [newMessageFromOpponentId, isUserNearBottom]);

  useEffect(() => {
    socket.on("send_updated_group_members", (userId: ID) => {
      setRoom((prevRoom) => {
        if (!prevRoom) return prevRoom;

        if ("members" in prevRoom) {
          const updatedRoom: Group = {
            ...prevRoom,
            members: [...prevRoom.members, userId],
          };

          return updatedRoom;
        }

        return prevRoom;
      });
    });

    return () => {
      socket.off("send_updated_group_members");
      socket.off("check_for_existing_opponent_room");
      socket.off("opponent_room_not_exist");
      socket.off("send_private-room");
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className={`relative flex h-full w-full flex-col ${
        !room && "flex items-center justify-center"
      } overflow-y-hidden border-slate-700 `}
    >
      {room ? (
        <>
          <ChatHeader
            room={room}
            user={user}
            setRoom={setRoom}
            currentTypingUserName={currentTypingUserName}
            openRoomInfoModal={openRoomInfoModal}
            setMessages={setMessages}
          />

          <div
            ref={chatWindowRef}
            className={`${
              isMessagesLoading && "overflow-y-hidden"
            } flex-1 overflow-x-hidden ${
              !room && "flex items-center justify-center"
            }`}
            onScroll={handleScroll}
          >
            <MessageField
              sentMessageId={sentMessageId}
              user={user}
              setNewMessageFromOpponentId={setNewMessageFromOpponentId}
              isMessagesLoading={isMessagesLoading}
              messages={messages}
              setMessages={setMessages}
              room={room}
              setCurrentTypingUserName={setCurrentTypingUserName}
              setOperatedMessage={setOperatedMessage}
            />
          </div>

          <SendMessageForm
            setSentMessageId={setSentMessageId}
            operatedMessage={operatedMessage}
            setOperatedMessage={setOperatedMessage}
            user={user}
            room={room}
            isMessagesLoading={isMessagesLoading}
            setMessages={setMessages}
          />
        </>
      ) : (
        <h1>Please, select a room to start messaging</h1>
      )}

      {room && (
        <>
          <NewMessageNotification
            isNewMessagesVisible={isNewMessagesVisible}
            scrollChatToBottom={scrollChatToBottom}
          />

          <ScrollToBottomArrow
            isUserScrollingUp={isUserScrollingUp}
            scrollChatToBottom={scrollChatToBottom}
          />
        </>
      )}

      <Modal
        title="Delete Chat"
        close={closeDeleteRoomModal}
        opened={isDeleteRoomModalOpened}
      >
        <DeleteGroupForm
          title={room?.name || ""}
          room={room}
          setRooms={setRooms}
          roomType={room && (room as Group).members ? "group" : "private-room"}
          user={user}
          filteredChats={filteredChats}
          setFilteredChats={setFilteredChats}
          currentRoom={room}
          closeModal={closeDeleteRoomModal}
          setRoom={setRoom}
        />
      </Modal>

      <Modal
        title="Room Info"
        opened={isRoomInfoModalOpen}
        close={closeRoomInfoModal}
      >
        <ViewRoomInfo
          currentRoom={room as Group}
          openRoomUserModal={openRoomUserModal}
          closeRoomInfoModal={closeRoomInfoModal}
          setSelectedMember={setSelectedMember}
        />
      </Modal>

      <Modal
        title="User Modal"
        opened={isUserModalOpened}
        close={closeRoomUserModal}
        subModal
        subModalClose={handleCloseViewRoomInfoModal}
      >
        <UserInfo
          user={user}
          currentUser={selectedMember}
          handleSendDirectMessage={handleSendDirectMessage}
        />
      </Modal>
    </div>
  );
};
// eslint-disable-next-line
export default memo(Chat);
