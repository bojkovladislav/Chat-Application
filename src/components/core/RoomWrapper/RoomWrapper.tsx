import { FC, ReactNode, useEffect, useState } from "react";
import { PrivateRoom, RoomType } from "../../../../types/Rooms";

interface Props {
  children: ReactNode;
  active: boolean;
  isRoomsLoading: boolean;
  deleteRoomCondition: boolean;
  isNewLocalRoomCreating?: boolean;
  currentRoom: RoomType;
  handleRoomEnter:
    | ((currentRoom: PrivateRoom) => Promise<void>)
    | ((currentRoom: RoomType) => void);
}

const RoomWrapper: FC<Props> = ({
  children,
  active,
  deleteRoomCondition,
  isRoomsLoading,
  handleRoomEnter,
  currentRoom,
}) => {
  const [isNewLocalRoomCreating, setNewLocalRoomCreating] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
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
      className={`flex items-center border-b border-slate-600 p-3 ${
        active && "bg-slate-700"
      } ${isRoomsLoading && "pointer-events-none"}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export default RoomWrapper;
