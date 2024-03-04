import { FC } from "react";

interface Props {
  handleOpenRoomCreation: () => void;
  areRoomsLoading: boolean;
}

const AddNewChat: FC<Props> = ({ handleOpenRoomCreation, areRoomsLoading }) => {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-bold">Chats</h1>
      <button
        className="button bg-blue-500"
        onClick={handleOpenRoomCreation}
        disabled={areRoomsLoading}
      >
        New chat +
      </button>
    </div>
  );
};

export default AddNewChat;
