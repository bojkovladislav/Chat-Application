import { ID, USER_STATUS } from './PublicTypes';

export type PrivateRoom = {
  id: ID;
  commonId: ID;
  opponentRoomId: ID;
  avatar: string;
  status: USER_STATUS;
  name: string;
  creators: ID[];
  description: string;
};

export type Group = Omit<
  PrivateRoom,
  'status' | 'commonId' | 'opponentRoomId'
> & {
  members: ID[];
  public: boolean;
};

export type Groups = Group[] | null;
export type PrivateRooms = PrivateRoom[] | null;

export type RoomType = PrivateRoom | Group;

export type RoomsType = RoomType[];

export type AddedGroupInfo = {
  name: string,
  members: PrivateRooms,
}
