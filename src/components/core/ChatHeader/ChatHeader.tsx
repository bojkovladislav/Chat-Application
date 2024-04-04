import { FC } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { ArrowLeft } from "react-bootstrap-icons";
import { SetState } from "../../../../types/PublicTypes";
import { Group, RoomType } from "../../../../types/Rooms";
import { Messages } from "../../../../types/Messages";
import { User } from "../../../../types/Users";
import { handlePlural } from "../../../utils/handlePlural";
import { RoomSettingsMenu } from "../RoomSettingsMenu";

interface Props {
  room: RoomType | null;
  user: User;
  setRoom: SetState<RoomType | null>;
  setMessages: SetState<Messages | null>;
  openRoomInfoModal: () => void;
  currentTypingUserName: string | null;
}

const ChatHeader: FC<Props> = ({
  room,
  user,
  setRoom,
  setMessages,
  openRoomInfoModal,
  currentTypingUserName,
}) => {
  const matches = useMediaQuery("(max-width: 765px)");

  return (
    <div className="flex items-center justify-between border-b-2 border-slate-700 bg-slate-900 p-3">
      <div className="flex items-center gap-3">
        {matches && (
          <ArrowLeft
            onClick={() => {
              setRoom(null);
              setMessages(null);
            }}
          />
        )}
        <div
          className="flex-column cursor-pointer gap-5"
          onClick={openRoomInfoModal}
        >
          <h1 className="text-lg">{room?.name}</h1>
          <p
            className={`text-xxs ${
              currentTypingUserName ? "text-blue-500" : "text-slate-500"
            }`}
          >
            {currentTypingUserName
              ? `${currentTypingUserName} is typing...`
              : (room as Group)?.members
                ? `${(room as Group)?.members.length} member${handlePlural(
                    (room as Group)?.members.length,
                  )}`
                : user.status}
          </p>
        </div>
      </div>

      <RoomSettingsMenu
        roomType={(room as Group).members ? "group" : "private-room"}
      />
    </div>
  );
};

export default ChatHeader;
