import { FC } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { AvatarWithName } from "../../shared/AvatarWithName";
import { PrivateRoom } from "../../../../types/Rooms";
import { User } from "../../../../types/Users";

interface Props {
  user: User;
  currentUser: PrivateRoom | null;
  handleSendDirectMessage: (user: PrivateRoom) => void;
}

const UserInfo: FC<Props> = ({
  currentUser,
  handleSendDirectMessage,
  user,
}) => {
  const matches = useMediaQuery("(max-width: 765px)");

  return (
    <div
      className="flex min-w-[300px] flex-col gap-5"
      style={{ maxWidth: matches ? "300px" : "400px" }}
    >
      <div className="px-3">
        {currentUser && (
          <AvatarWithName
            avatar={currentUser.avatar}
            avatarSize={60}
            name={currentUser.name}
            additionalInfo={currentUser.status}
          />
        )}
      </div>

      {currentUser && currentUser.id !== user.id && (
        <button
          className="bg-slate-800 p-3 text-blue-500 transition-all duration-300 hover:bg-slate-700"
          onClick={() => currentUser && handleSendDirectMessage(currentUser)}
        >
          Send direct message
        </button>
      )}
    </div>
  );
};

export default UserInfo;
