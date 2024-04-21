import { FC, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { RoomType } from "../../../../types/Rooms";
import { Avatar } from "../../shared/Avatar";
import { User } from "../../../../types/Users";

interface Props {
  room: RoomType | null;
  user: User;
  openUserProfileModal: () => void;
}

const AppHeader: FC<Props> = ({ room, user, openUserProfileModal }) => {
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const matches = useMediaQuery("(max-width: 765px)");
  const { avatar, name } = user;

  return (
    <header
      className={`flex items-center justify-between border-b-2 border-slate-600 bg-slate-800 p-5 md:px-52 md:py-2 ${
        matches && room ? "hidden" : "block"
      }`}
    >
      <h1 className="text-xl font-bold">Chat App</h1>
      <div
        className="flex cursor-pointer flex-col items-center "
        onMouseOver={() => setIsProfileHovered(true)}
        onMouseLeave={() => setIsProfileHovered(false)}
        onClick={openUserProfileModal}
      >
        <Avatar avatar={avatar} name={name} />
        <p
          className="text-[12px] transition-colors duration-300"
          style={{
            color: isProfileHovered ? "#ffffff" : "#94a3b8",
          }}
        >
          Profile
        </p>
      </div>
    </header>
  );
};

export default AppHeader;
