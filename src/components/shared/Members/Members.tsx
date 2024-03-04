import { FC, memo } from "react";
import { AvatarWithName } from "../../shared/AvatarWithName";
import { PrivateRoom, PrivateRooms } from "../../../../types/Rooms";

interface Props {
  members: PrivateRooms | PrivateRooms & { selected: boolean };
  handleMemberClick: (member: PrivateRoom) => void;
  loading: boolean;
  skeletonMembers: PrivateRoom[];
  addedMembers?: PrivateRooms;
}

// eslint-disable-next-line
const Members: FC<Props> = ({
  members,
  handleMemberClick,
  loading,
  skeletonMembers,
  addedMembers,
}) => {
  return (
    <div className="flex flex-col">
      {loading
        ? skeletonMembers.map((member, index) => (
            <div
              className="w-full cursor-pointer p-2 transition-all duration-300 hover:bg-slate-700"
              key={index}
              onClick={() => handleMemberClick(member)}
            >
              <AvatarWithName
                avatar={member.avatar}
                name={member.name}
                loadingState={loading}
                additionalInfo={member.status}
              />
            </div>
          ))
        : members?.map((member) => (
            <div
              className="w-full cursor-pointer p-2 transition-all duration-300 hover:bg-slate-700"
              key={member.id}
              onClick={() => handleMemberClick(member)}
            >
              <AvatarWithName
                avatar={member.avatar}
                name={member.name}
                loadingState={loading}
                additionalInfo={member.status}
                selected={addedMembers?.includes(member)}
              />
            </div>
          ))}
    </div>
  );
};

// eslint-disable-next-line
export default memo(Members);
