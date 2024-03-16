import { FC, memo } from "react";
import { AvatarWithName } from "../../shared/AvatarWithName";
import { PrivateRoom, PrivateRooms } from "../../../../types/Rooms";
import { ID } from "../../../../types/PublicTypes";

interface Props {
  members: PrivateRooms | (PrivateRooms & { selected: boolean });
  handleMemberClick: (member: PrivateRoom) => void;
  loading: boolean;
  skeletonMembers: PrivateRoom[];
  addedMembers?: PrivateRooms;
  removeMember?: (id: ID) => void;
  userId?: ID;
}

// eslint-disable-next-line
const Members: FC<Props> = ({
  members,
  handleMemberClick,
  loading,
  skeletonMembers,
  removeMember,
  addedMembers,
  userId,
}) => {
  const renderMembers = () =>
    members && !members.length ? (
      <div className="px-3">No members to display!</div>
    ) : (
      members?.map((member) => (
        <div
          className="flex w-full cursor-pointer items-center justify-between p-2 transition-all duration-300 hover:bg-slate-700"
          key={member.id}
        >
          <div className="flex-1" onClick={() => handleMemberClick(member)}>
            <AvatarWithName
              avatar={member.avatar}
              name={member.name}
              loadingState={loading}
              additionalInfo={member.status}
              selected={addedMembers?.includes(member)}
            />
          </div>

          {removeMember && member.id !== userId && (
            <p
              className="z-10 p-2 text-sm text-blue-500 underline"
              onClick={() => removeMember(member.id)}
            >
              Remove
            </p>
          )}
        </div>
      ))
    );

  return (
    <div className="flex max-h-[250px] flex-col overflow-y-auto">
      {loading
        ? skeletonMembers.map((member, index) => (
            <div
              className="w-full cursor-pointer p-2 transition-all duration-300 hover:bg-slate-700"
              key={index}
            >
              <AvatarWithName
                avatar={member.avatar}
                name={member.name}
                loadingState={loading}
                additionalInfo={member.status}
              />
            </div>
          ))
        : renderMembers()}
    </div>
  );
};

// eslint-disable-next-line
export default memo(Members);
