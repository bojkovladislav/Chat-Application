import { FC } from "react";
import { People } from "react-bootstrap-icons";
import { AvatarWithName } from "../../shared/AvatarWithName";

interface Props {
  loading: boolean;
  name: string;
  isRoomsLoading: boolean;
  avatar:
    | string
    | {
        src: string;
        data: ArrayBuffer | null;
      };
}

const Group: FC<Props> = ({ loading, name, avatar, isRoomsLoading }) => {
  return (
    <div className="flex items-center gap-2">
      <AvatarWithName
        avatar={typeof avatar === "string" ? avatar : avatar.src}
        name={name}
        loadingState={loading || isRoomsLoading}
      >
        <People />
      </AvatarWithName>
    </div>
  );
};

export default Group;
