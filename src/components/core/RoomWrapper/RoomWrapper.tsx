import { FC, MouseEvent, ReactNode, useEffect, useState } from "react";
import { Group, PrivateRoom, RoomType } from "../../../../types/Rooms";
import { Trash } from "react-bootstrap-icons";
import { Skeleton } from "@mantine/core";

interface Props {
  children: ReactNode;
  showDeleteButton: boolean;
  active: boolean;
  isRoomsLoading: boolean;
  deleteRoomCondition: boolean;
  isNewLocalRoomCreating?: boolean;
  currentRoom: RoomType;
  handleRoomEnter:
    | ((currentRoom: PrivateRoom) => Promise<void>)
    | ((currentRoom: RoomType) => void);
  handleRoomDelete: (
    roomType: "group" | "private-room",
    e: MouseEvent,
    currentRoom: RoomType,
  ) => void;
}

const RoomWrapper: FC<Props> = ({
  children,
  showDeleteButton,
  active,
  deleteRoomCondition,
  isRoomsLoading,
  handleRoomDelete,
  handleRoomEnter,
  currentRoom,
}) => {
  const [isNewLocalRoomCreating, setNewLocalRoomCreating] = useState(false);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setNewLocalRoomCreating(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isNewLocalRoomCreating]);

  const handleClick = () => {
    !isNewLocalRoomCreating &&
      deleteRoomCondition &&
      handleRoomEnter(currentRoom as PrivateRoom);

    setNewLocalRoomCreating(true);
  };

  return (
    <div
      className={`flex items-center justify-between border-b border-slate-600 p-3 ${
        active && "bg-slate-700"
      } ${isRoomsLoading && "pointer-events-none"}`}
      onClick={handleClick}
    >
      {children}

      {showDeleteButton && (
        <Skeleton
          visible={isRoomsLoading}
          id="skeleton-light"
          className="w-fit"
        >
          <Trash
            className="cursor-pointer"
            onClick={(e) => {
              handleRoomDelete(
                (currentRoom as Group).members ? "group" : "private-room",
                e,
                currentRoom,
              );
            }}
          />
        </Skeleton>
      )}
    </div>
  );
};

export default RoomWrapper;
