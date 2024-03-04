import { Avatar } from "../../shared/Avatar";
import { FC, ReactNode } from "react";
import { USER_STATUS } from "../../../../types/PublicTypes";
import { Skeleton } from "@mantine/core";
import { Selected } from "../Selected";

interface Props {
  name: string;
  avatar: string;
  status?: USER_STATUS;
  additionalInfo?: string;
  loadingState?: boolean;
  children?: ReactNode;
  avatarSize?: number;
  selected?: boolean;
}

const AvatarWithName: FC<Props> = ({
  name,
  avatar,
  status,
  additionalInfo,
  loadingState,
  children,
  avatarSize,
  selected,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Skeleton
        visible={!!loadingState}
        circle
        className="h-fit w-fit"
        style={{ minWidth: `${avatarSize ? avatarSize : "43"}px` }}
      >
        <Selected selected={!!selected} avatarSize={avatarSize}>
          <Avatar
            name={name}
            avatar={avatar}
            status={status}
            avatarSize={avatarSize}
          />
        </Selected>
      </Skeleton>

      <div>{children}</div>

      <Skeleton visible={!!loadingState}>
        <p
          className="transition-colors duration-300"
          style={{ color: selected ? "#3B82F6" : "#FFFFFF" }}
        >
          {name}
        </p>
        {additionalInfo && (
          <p className="text-sm text-slate-500">{additionalInfo}</p>
        )}
      </Skeleton>
    </div>
  );
};

export default AvatarWithName;
