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
  PrivateRooms,
  RoomType,
  RoomsType,
} from "../../../../types/Rooms";
import { NewMessageNotification } from "../NewMessageNotification";
import { ScrollToBottomArrow } from "../../shared/ScrollToBottomArrow";
import { socket } from "../../../adapters/socket";
import useDisclosureStore from "../../../store/useRoomDisclosureStore";
import { ChatHeader } from "../ChatHeader";
import { ChatSettingsModals } from "../ChatSettingsModals";
import useGroupOperations from "../../../hooks/useGroupOperations";

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
  const [
    isMembersModalOpened,
    { open: openMembersModal, close: closeMembersModal },
  ] = useDisclosure(false);
  const [
    isAddMembersToNewGroupModalOpened,
    { open: openAddMembersToGroupModal, close: closeAddMembersToGroupModal },
  ] = useDisclosure(false);
  const [
    isAdministratorsModalOpened,
    { open: openAdministratorsModal, close: closeAdministratorsModal },
  ] = useDisclosure(false);
  const [addedGroupMembers, setAddedGroupMembers] = useState<PrivateRooms>([]);
  const [membersForMembersModal, setMembersForMembersModal] =
    useState<PrivateRooms>([]);
  const { addMember, removeMember } = useGroupOperations(setRooms, setRoom);

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

  const handleSendDirectMessage = async (member: PrivateRoom) => {
    closeRoomUserModal();
    closeRoomInfoModal();
    closeAddMembersToGroupModal();
    closeAdministratorsModal();
    closeMembersModal();

    const foundRoom = rooms.find((room) => room.name === member.name);

    if (foundRoom) {
      setRoom(foundRoom);

      await new Promise((resolve) =>
        setTimeout(() => resolve(scrollChatToBottom()), 300),
      );

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

  console.log(room && (room as Group).members);

  useEffect(() => {
    socket.on("send_updated_group_members", (groupId: ID, memberId: ID) => {
      addMember(groupId, memberId);
    });

    socket.on("member_removed", (groupId: ID, memberId: ID) => {
      removeMember(groupId, memberId);

      setMembersForMembersModal(
        (prevMembers) =>
          prevMembers && prevMembers.filter((member) => member.id !== memberId),
      );
    });

    return () => {
      socket.off("member_removed");
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
              openRoomUserModal={openRoomUserModal}
              user={user}
              setNewMessageFromOpponentId={setNewMessageFromOpponentId}
              isMessagesLoading={isMessagesLoading}
              messages={messages}
              setMessages={setMessages}
              setSelectedMember={setSelectedMember}
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

      <ChatSettingsModals
        addedGroupMembers={addedGroupMembers}
        filteredChats={filteredChats}
        handleSendDirectMessage={handleSendDirectMessage}
        membersForMembersModal={membersForMembersModal}
        room={room}
        rooms={rooms}
        user={user}
        selectedMember={selectedMember}
        setAddedGroupMembers={setAddedGroupMembers}
        setFilteredChats={setFilteredChats}
        setMembersForMembersModal={setMembersForMembersModal}
        setRoom={setRoom}
        setRooms={setRooms}
        setSelectedMember={setSelectedMember}
        isUserModalOpened={isUserModalOpened}
        openRoomUserModal={openRoomUserModal}
        closeRoomUserModal={closeRoomUserModal}
        isMembersModalOpened={isMembersModalOpened}
        openMembersModal={openMembersModal}
        closeMembersModal={closeMembersModal}
        isAdministratorsModalOpened={isAdministratorsModalOpened}
        openAdministratorsModal={openAdministratorsModal}
        closeAdministratorsModal={closeAdministratorsModal}
        isAddMembersToNewGroupModalOpened={isAddMembersToNewGroupModalOpened}
        openAddMembersToGroupModal={openAddMembersToGroupModal}
        closeAddMembersToGroupModal={closeAddMembersToGroupModal}
      />
    </div>
  );
};
// eslint-disable-next-line
export default memo(Chat);
