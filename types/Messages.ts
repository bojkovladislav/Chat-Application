import { ID, SelectedImage } from "./PublicTypes";

export type Reaction = {
  reaction: string;
  authorId: ID;
  id: ID;
  messageId: ID;
};

export type Message = {
  id: ID;
  authorName: ID;
  authorId: ID;
  avatar: string;
  content: string;
  date: string;
  repliedMessage: {
    author: string;
    message: string;
    images: SelectedImage[] | null;
    id: ID;
  } | null;
  images: SelectedImage[] | null;
  reactions: Reaction[] | null;
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
