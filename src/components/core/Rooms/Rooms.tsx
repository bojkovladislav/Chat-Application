import { FC, MouseEvent } from "react";
import {
  RoomType,
  Group as GroupType,
  RoomsType,
  PrivateRoom as PrivateRoomType,
} from "../../../../types/Rooms";
import { Group } from "../Group";
import { RoomWrapper } from "../RoomWrapper";
import { ID, SetState } from "../../../../types/PublicTypes";
import { User } from "../../../../types/Users";
import { PrivateRoom } from "../PrivateRoom";

interface Props {
  rooms: RoomsType;
  handleRoomEnter:
    | ((currentRoom: PrivateRoomType) => Promise<void>)
    | ((currentRoom: RoomType) => void);
  handleRoomDelete: (
    roomType: "group" | "private-room",
    e: MouseEvent,
    currentRoom: RoomType,
  ) => void;
  roomId?: ID;
  user: User;
  addedRoomId: ID | null;
  areRoomsLoading: boolean;
  setIsUserInfoModalOpen?: SetState<boolean>;
}

const Rooms: FC<Props> = ({
  rooms,
  handleRoomEnter,
  handleRoomDelete,
  roomId,
  user,
  addedRoomId,
  areRoomsLoading,
}) => {
  return (
    <div className="flex flex-col">
      {rooms.map((currentRoom: RoomType) => {
        const { id, name, creators, avatar } = currentRoom;
        return (currentRoom as GroupType).members !== undefined ? (
          <RoomWrapper
            key={id}
            handleRoomEnter={handleRoomEnter}
            handleRoomDelete={handleRoomDelete}
            active={roomId === currentRoom.id}
            currentRoom={currentRoom}
            deleteRoomCondition={addedRoomId !== currentRoom.id}
            showDeleteButton={creators.includes(user.id)}
            isRoomsLoading={areRoomsLoading}
          >
            <Group
              avatar={avatar}
              loading={addedRoomId === currentRoom.id}
              name={name}
              isRoomsLoading={areRoomsLoading}
            />
          </RoomWrapper>
        ) : (
          <RoomWrapper
            key={id}
            handleRoomEnter={handleRoomEnter}
            handleRoomDelete={handleRoomDelete}
            active={roomId === currentRoom.id}
            currentRoom={currentRoom}
            deleteRoomCondition={addedRoomId !== currentRoom.id}
            showDeleteButton={creators.includes(user.id)}
            isRoomsLoading={areRoomsLoading}
          >
            <PrivateRoom
              currentRoom={currentRoom as PrivateRoomType}
              loading={addedRoomId === currentRoom.id}
              isRoomsLoading={areRoomsLoading}
            />
          </RoomWrapper>
        );
      })}
    </div>
  );
};

export default Rooms;
