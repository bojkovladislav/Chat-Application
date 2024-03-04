import { RoomType, RoomsType } from "../../types/Rooms";

export const validateNewGroupName = (name: string, rooms: RoomsType) => {
  if (!name.length) {
    return "name of the chat is required";
  }

  if (rooms.some((room: RoomType) => room.name === name)) {
    return `The room with name "${name}" already exists`;
  }
};
