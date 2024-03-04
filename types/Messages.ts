import { ID } from './PublicTypes';

export type Message = {
  id: ID;
  authorName: ID;
  authorId: ID;
  avatar: string;
  content: string;
  date: string;
  repliedMessage?: { author: string; message: string };
};

export type Messages = {
  roomId: ID;
  messages: Message[];
};

export type OperatedMessage = {
  message: Message | null;
  edited: boolean;
  replied: boolean;
};
