import { SetState } from "../../../../types/PublicTypes";
import { Group, RoomType, RoomsType } from "../../../../types/Rooms";
import { FC, useEffect, useState } from "react";
import { User } from "../../../../types/Users";
import { socket } from "../../../adapters/socket";
import { ModalButton } from "../../shared/ModalButton";

interface Props {
  setRooms: SetState<RoomsType>;
  currentRoom: RoomType | null;
  user: User;
  setRoom: SetState<RoomType | null>;
  filteredChats: RoomsType | null;
  setFilteredChats: SetState<RoomsType | null>;
  title: string;
  closeModal: () => void;
  roomType: "private-room" | "group";
  room: RoomType | null;
}

const DeleteRoomForm: FC<Props> = ({
  setRooms,
  title,
  currentRoom,
  closeModal,
  setRoom,
  roomType,
  filteredChats,
  setFilteredChats,
  user,
  room,
}) => {
  const [deleteForEveryone, setDeleteForEveryone] = useState(false);

  const handleDeleteRoomLocally = () => {
    setRooms((rooms) =>
      rooms.filter((room: RoomType) => room.id !== currentRoom?.id),
    );

    closeModal();
    setRoom(null);
  };

  const handleRoomDelete = () => {
    if (!room) return;

    handleDeleteRoomLocally();

    if (roomType === "private-room" && filteredChats) {
      setFilteredChats((prevChats) => {
        const updatedChats =
          prevChats &&
          prevChats.map((chat) =>
            chat.id === currentRoom?.id ? { ...chat, creators: [] } : chat,
          );
        return (
          updatedChats &&
          updatedChats.filter((chat) => chat.id !== currentRoom?.id)
        );
      });
    }

    socket.emit(`delete_${roomType}`, currentRoom, user.id, deleteForEveryone);

    socket.on(`failed_delete_${roomType}`, console.log);
  };

  useEffect(() => {
    return () => {
      socket.off("delete_private-room");
      socket.off("delete_group");
      socket.off("failed_delete_private-room");
      socket.off("failed_delete_group");
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 px-2">
      <h1>Are you sure you want to delete this room?</h1>

      {room?.creators?.includes(user.id) && (room as Group).members && (
        <label htmlFor="deleteForEveryone" className="flex w-fit gap-2">
          Delete for everyone
          <input
            type="checkbox"
            id="deleteForEveryone"
            name="deleteForEveryone"
            checked={deleteForEveryone}
            onChange={() => setDeleteForEveryone((prevState) => !prevState)}
          />
        </label>
      )}

      <div className="flex gap-3 self-end">
        <ModalButton title="Cancel" onClick={closeModal} />
        <ModalButton
          title={`Delete "${title}" room`}
          danger
          onClick={handleRoomDelete}
        />
      </div>
    </div>
  );
};

export default DeleteRoomForm;
