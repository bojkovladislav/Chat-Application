import { ID, USER_STATUS } from './PublicTypes';

export type User = {
  id: ID;
  name: string;
  rooms: ID[];
  avatar: string; 
  status: USER_STATUS;
};

export type Users = User[] | null;
