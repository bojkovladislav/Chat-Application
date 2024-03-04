import { UUID } from 'crypto';
import { Dispatch, SetStateAction } from 'react';

export enum USER_STATUS {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export type ID = UUID;

export type SetState<T> = Dispatch<SetStateAction<T>>;
