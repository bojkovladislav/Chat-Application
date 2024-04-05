import { SelectedImage } from "./PublicTypes";

export type GroupInfo = {
  name: string;
  description: string;
  isPublic: boolean;
  avatar: string | SelectedImage;
};
