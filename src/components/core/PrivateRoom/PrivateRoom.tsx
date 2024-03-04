import { FC } from "react";
import { PrivateRoom as PrivateRoomType } from "../../../../types/Rooms";
import { AvatarWithName } from "../../shared/AvatarWithName";

interface Props {
  currentRoom: PrivateRoomType;
  isRoomsLoading: boolean;
  loading: boolean;
}

const PrivateRoom: FC<Props> = ({ currentRoom, isRoomsLoading, loading }) => {
  const { name, status, avatar } = currentRoom;

  return (
    <AvatarWithName
      avatar={avatar}
      name={name}
      status={status}
      loadingState={loading || isRoomsLoading}
    />
  );
};

export default PrivateRoom;
