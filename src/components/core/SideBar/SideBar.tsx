import {
  useEffect,
  useState,
  FormEvent,
  MouseEvent,
  useMemo,
  useCallback,
  memo,
  useRef,
  FC,
} from "react";
import { v4 as uuid } from "uuid";
import { socket } from "../../../adapters/socket";
import { User } from "../../../../types/Users";
import {
  RoomType,
  RoomsType,
  PrivateRooms,
  PrivateRoom,
  Group,
  AddedGroupInfo,
} from "../../../../types/Rooms";
import {
  ID,
  SelectedImage,
  SetState,
  USER_STATUS,
} from "../../../../types/PublicTypes";
import { AddNewChat } from "../../forms/AddNewChat";
import { SearchBar } from "../SearchBar";
import { Rooms } from "../Rooms";
import { useDisclosure } from "@mantine/hooks";
import "@mantine/core/styles.css";
import { validateNewGroupName } from "../../../utils/validateNewGroupName";
import { AddNewGroupModals } from "../AddNewGroupModals";

interface Props {
  rooms: RoomsType;
  setRooms: SetState<RoomsType>;
  room: RoomType | null;
  setRoom: SetState<RoomType | null>;
  setAreMessagesLoading: SetState<boolean>;
  leftBarCurrentWidth?: number;
  areRoomsLoading: boolean;
  user: User;
  filteredChats: RoomsType | null;
  setFilteredChats: SetState<RoomsType | null>;
  addedRoomId: ID | null;
  setSelectedImages: SetState<SelectedImage[]>;
  setAddedRoomId: SetState<ID | null>;
}
// eslint-disable-next-line
const SideBar: FC<Props> = ({
  rooms,
  setRooms,
  room,
  setRoom,
  user,
  setAreMessagesLoading: setAreMessagesLoading,
  areRoomsLoading: areRoomsLoading,
  filteredChats,
  setFilteredChats,
  addedRoomId,
  setAddedRoomId,
  setSelectedImages,
}) => {
  const [inputError, setInputError] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<PrivateRooms>(null);
  const [addedGroupInfo, setAddedGroupInfo] = useState<AddedGroupInfo>({
    name: "",
    members: null,
  });
  const [isFilteredRoomsLoading, setIsFilteredRoomsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const doesOpponentExist = useRef(false);
  const [
    isNewGroupPreviewOpened,
    { open: openNewGroupPreviewModal, close: closeNewGroupPreviewModal },
  ] = useDisclosure(false);
  const [
    isAddMembersToNewGroupModalOpened,
    {
      open: openAddMembersToNewGroupModal,
      close: closeAddMembersToNewGroupModal,
    },
  ] = useDisclosure(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PrivateRoom | null>(null);

  const handleAddRoomLocally = (room: RoomType) => {
    setAddedRoomId(room.id);
    setRooms((prevRooms) =>
      !prevRooms.some((r) => r.id === room.id)
        ? [room, ...prevRooms]
        : prevRooms,
    );
  };

  const handleAddPrivateRoomLocally = (room: RoomType) => {
    handleAddRoomLocally(room);

    setFilteredChats((prevChats) =>
      prevChats && prevChats.every((chat) => chat.id !== room.id)
        ? [...prevChats, room]
        : prevChats,
    );
  };

  const handleRoomDeleteLocally = (id: ID) => {
    if (room && id === room.id) {
      setRoom(null);
    }

    setRooms((prevRooms) => {
      return prevRooms.filter((room: RoomType) => room.id !== id);
    });
    setRoom(null);
  };

  const handleRoomDelete = (
    roomType: "group" | "private-room",
    e: MouseEvent,
    currentRoom: RoomType,
  ) => {
    e.stopPropagation();

    handleRoomDeleteLocally(currentRoom.id);

    if (roomType === "private-room" && filteredChats) {
      setFilteredChats((prevChats) => {
        const updatedChats =
          prevChats &&
          prevChats.map((chat) =>
            chat.id === currentRoom.id ? { ...chat, creators: [] } : chat,
          );
        return (
          updatedChats &&
          updatedChats.filter((chat) => chat.id !== currentRoom.id)
        );
      });
    }

    if (user) {
      socket.emit(`delete_${roomType}`, currentRoom, user.id, true);
    }

    socket.on(`failed_delete_${roomType}`, console.log);
  };

  const handleOpenNextModal = () => {
    closeNewGroupPreviewModal();
    openAddMembersToNewGroupModal();
  };

  const handleGetBackToThePreviousModal = () => {
    closeAddMembersToNewGroupModal();
    openNewGroupPreviewModal();
  };

  const handleCloseNewGroupPreview = () => {
    setInputError("");
    closeNewGroupPreviewModal();
    setAddedGroupInfo({ name: "", members: null });
  };

  const handleCloseAddedGroupInfo = () => {
    closeAddMembersToNewGroupModal();
    handleCloseNewGroupPreview();
  };

  const submitNewGroupCreationForm = (e: FormEvent) => {
    e.preventDefault();

    const errorAfterValidation = validateNewGroupName(
      addedGroupInfo.name,
      rooms,
    );

    if (errorAfterValidation) {
      setInputError(errorAfterValidation);

      return;
    }

    closeNewGroupPreviewModal();
    setInputError("");
    handleOpenNextModal();
  };

  const handleCreateGroup = (e: FormEvent) => {
    e.preventDefault();

    const { name, members } = addedGroupInfo;
    const memberIds = [user.id, ...(members?.map((member) => member.id) || [])];

    socket.emit("create_group", name, [user.id], memberIds, true);
    socket.on("group_creation_failed", console.log);

    handleCloseAddedGroupInfo();
  };

  const joinRoom = (id: ID | string) => {
    if (!id) return;

    socket.emit("join_room", id);
  };

  const handleInputChange = (value: string) => {
    setAddedGroupInfo((prevGroup) =>
      prevGroup
        ? { ...prevGroup, name: value }
        : { members: null, name: value },
    );
    setInputError("");
  };

  const handleOpenRoomCreation = () => {
    openNewGroupPreviewModal();
  };

  const handleRoomEnterLocally = (currentRoom: PrivateRoom) => {
    if (currentRoom.id === room?.id) return;

    setRoom(currentRoom);
    joinRoom(currentRoom.commonId);
  };

  const handleRoomEnter = (currentRoom: RoomType) => {
    if (currentRoom.id === room?.id) return;

    setSelectedImages([]);

    const isGroup = !!(currentRoom as Group).members;
    let roomToUpdate = currentRoom;

    if (rooms.every((room) => room.id !== currentRoom.id)) {
      setRooms((prevRooms) => [...prevRooms, currentRoom]);

      socket.emit("user_update_roomIds", user.id, currentRoom.id);
    }

    if (isGroup && !(currentRoom as Group).members.includes(user.id)) {
      const newRoom = {
        ...currentRoom,
        members: [...(currentRoom as Group).members, user.id],
      };

      roomToUpdate = newRoom;

      socket.emit("update_group_members", currentRoom.id, user.id);
      socket.on("failed_update_members", console.log);
    }

    setAreMessagesLoading(true);
    setRoom(roomToUpdate);
    joinRoom(isGroup ? currentRoom.id : (currentRoom as PrivateRoom).commonId);
  };

  const handleEndRoomCreation = (room: RoomType) => {
    setRoom(room);
    setAreMessagesLoading(false);

    setAddedRoomId(null);
  };

  const handlePrivateRoomEnter = async (currentRoom: PrivateRoom) => {
    setSelectedUser(currentRoom);
    setIsUserInfoModalOpen(true);
  };

  const handleSendDirectMessage = async (currentRoom: PrivateRoom) => {
    setIsUserInfoModalOpen(false);

    const foundChat = filteredChats?.find(
      (chat) => chat.name === currentRoom.name,
    );

    if (foundChat) {
      handleRoomEnter(foundChat);

      return;
    }

    if (!currentRoom.opponentRoomId) {
      socket.emit("check_for_existing_opponent_room", currentRoom, user);

      await new Promise<void>((resolve) => {
        socket.on("opponent_room_not_exist", () => {
          doesOpponentExist.current = false;
          resolve();
        });

        socket.on("send_private-room", (newPrivateRoom) => {
          doesOpponentExist.current = true;
          handleAddPrivateRoomLocally(newPrivateRoom);
          setAreMessagesLoading(true);
          resolve();
        });
      });

      if (doesOpponentExist.current) return;
    }

    const newLocalRoom: PrivateRoom = {
      ...currentRoom,
      id: uuid() as ID,
      commonId: uuid() as ID,
      creators: [user.id, currentRoom.id],
    };

    handleAddPrivateRoomLocally(newLocalRoom);
    handleEndRoomCreation(newLocalRoom);
  };

  const renderFilteredRooms = useCallback(
    (rooms: RoomsType | null, roomsType: "chats" | "users") =>
      rooms && !!rooms.length ? (
        <Rooms
          rooms={rooms}
          handleRoomEnter={
            roomsType === "users" ? handlePrivateRoomEnter : handleRoomEnter
          }
          addedRoomId={addedRoomId}
          roomId={room?.id}
          user={user}
          areRoomsLoading={areRoomsLoading}
        />
      ) : (
        <p className="ml-5 text-sm">{`Nothing was found in ${roomsType}`}</p>
      ),
    // eslint-disable-next-line
    [
      user.rooms,
      handleRoomDelete,
      handleRoomEnter,
      handlePrivateRoomEnter,
      addedRoomId,
      room?.id,
      areRoomsLoading,
    ],
  );

  useEffect(() => {
    if (addedRoomId) {
      const brandNewRoom = rooms.find((room) => room.id === addedRoomId);

      if (brandNewRoom && (brandNewRoom as PrivateRoom).commonId) {
        handleRoomEnterLocally(brandNewRoom as PrivateRoom);
      }
    }
    // eslint-disable-next-line
  }, [rooms]);

  useEffect(() => {
    return () => {
      socket.off("send_private-room");
      socket.off("rooms_got");
      socket.off("get_rooms");
      socket.off("join_room");
      socket.off("send_private-room");
      socket.off("check_for_existing_opponent_room");
      socket.off("opponent_room_not_exist");
      socket.off("create_group");
      socket.off("update_group_members");
      socket.off("failed_update_members");
      socket.off("group_creation_failed");
      socket.off("delete_group");
      socket.off("user_update_roomIds");
    };
  }, []);

  const skeletonRooms: RoomsType = useMemo(() => {
    return areRoomsLoading
      ? Array.from({ length: user.rooms.length }).map(() => {
          return {
            id: uuid() as ID,
            commonId: uuid() as ID,
            opponentRoomId: uuid() as ID,
            opponentUserId: uuid() as ID,
            name: "Fake name",
            creators: [user.id],
            description: "",
            avatar: "",
            status: USER_STATUS.OFFLINE,
          };
        })
      : rooms;
    // eslint-disable-next-line
  }, [rooms]);

  return (
    <div className={`flex w-full flex-col gap-5 pb-3 pt-3`}>
      <div className="mx-5 flex flex-col gap-7">
        <SearchBar
          query={query}
          setQuery={setQuery}
          setFilteredUsers={setFilteredUsers}
          setFilteredChats={setFilteredChats}
          setIsFilteredRoomsLoading={setIsFilteredRoomsLoading}
          rooms={rooms}
        />

        {!query.length && (
          <AddNewChat
            handleOpenRoomCreation={handleOpenRoomCreation}
            areRoomsLoading={areRoomsLoading}
          />
        )}
      </div>

      {query.length ? (
        <div className="flex flex-col gap-3">
          {["chats", "users"].map((roomType, i) => (
            <div key={i} className="flex flex-col gap-1">
              <h1 className="ml-5 text-lg">
                {roomType.charAt(0).toUpperCase() + roomType.slice(1)}
              </h1>
              {isFilteredRoomsLoading ? (
                <p className="ml-5 text-sm text-slate-500">{`Loading ${roomType}...`}</p>
              ) : (
                renderFilteredRooms(
                  roomType === "chats" ? filteredChats : filteredUsers,
                  roomType as "chats" | "users",
                )
              )}
            </div>
          ))}
        </div>
      ) : (
        <Rooms
          rooms={skeletonRooms}
          handleRoomEnter={handleRoomEnter}
          addedRoomId={addedRoomId}
          roomId={room?.id}
          user={user}
          areRoomsLoading={areRoomsLoading}
        />
      )}

      <AddNewGroupModals
        addedGroupInfo={addedGroupInfo}
        handleCloseAddedGroupInfo={handleCloseAddedGroupInfo}
        handleCloseNewGroupPreview={handleCloseNewGroupPreview}
        handleCloseUserInfoModal={() => setIsUserInfoModalOpen(false)}
        handleCreateGroup={handleCreateGroup}
        handleGetBackToThePreviousModal={handleGetBackToThePreviousModal}
        handleInputChange={handleInputChange}
        handleSendDirectMessage={handleSendDirectMessage}
        inputError={inputError}
        isAddMembersToNewGroupModalOpened={isAddMembersToNewGroupModalOpened}
        isNewGroupPreviewOpened={isNewGroupPreviewOpened}
        isUserInfoModalOpen={isUserInfoModalOpen}
        rooms={rooms}
        selectedUser={selectedUser}
        setAddedGroupInfo={setAddedGroupInfo}
        submitNewGroupCreationForm={submitNewGroupCreationForm}
        user={user}
      />
    </div>
  );
};
// eslint-disable-next-line
export default memo(SideBar);
