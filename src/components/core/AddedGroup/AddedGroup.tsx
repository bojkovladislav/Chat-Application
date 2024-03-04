import { X } from "react-bootstrap-icons";
import { Avatar } from "../../shared/Avatar";
import { useMediaQuery } from "@mantine/hooks";
import { FC, useState } from "react";
import { ID } from "../../../../types/PublicTypes";

interface Props {
  avatar: string;
  name: string;
  id: ID;
  handleDeleteMember: (id: ID) => void;
}

const AddedGroup: FC<Props> = ({ name, avatar, id, handleDeleteMember }) => {
  const [isHovered, setIsHovered] = useState(false);
  const matches = useMediaQuery("(max-width: 765px)");

  return (
    <div
      className="relative flex items-center gap-2 rounded-full bg-slate-700 pr-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: "background-color 0.3s ease",
      }}
    >
      <X
        onClick={() => handleDeleteMember(id)}
        className="absolute h-[33px] w-[33px] cursor-pointer rounded-full bg-blue-500 transition-opacity duration-300"
        style={{
          opacity: isHovered || matches ? 1 : 0,
          zIndex: isHovered || matches ? 2 : 0,
        }}
      />
      <div
        style={{
          transition: "opacity 0.3s ease",
          opacity: isHovered ? 0 : 1,
        }}
      >
        <Avatar avatar={avatar} name={name} avatarSize={33} />
      </div>
      <p className="text-sm">{name}</p>
    </div>
  );
};

export default AddedGroup;
