import { FC, useEffect, useMemo, useState } from "react";
import {
  Group,
  PrivateRoom,
  PrivateRooms,
  RoomType,
} from "../../../../types/Rooms";
import { handlePlural } from "../../../helpers";
import { Members } from "../../shared/Members";
import { useMediaQuery } from "@mantine/hooks";
import { AvatarWithName } from "../../shared/AvatarWithName";
import { SetState } from "../../../../types/PublicTypes";
import { getGroupMembers } from "../../../adapters/api";
import useSkeletonRooms from "../../../hooks/useSkeletonRooms";

interface Props {
  currentRoom: RoomType;
  openRoomUserModal: () => void;
  closeRoomInfoModal: () => void;
  isUserModalOpened: boolean;
  setSelectedMember: SetState<PrivateRoom | null>;
}

const ViewRoomInfo: FC<Props> = ({
  currentRoom,
  openRoomUserModal,
  closeRoomInfoModal,
  setSelectedMember,
}) => {
  const { name, avatar, description } = currentRoom;
  const status = (currentRoom as PrivateRoom).status;
  const memberIds = (currentRoom as Group).members;
  const matches = useMediaQuery("(max-width: 765px)");
  const numMembersString = useMemo(
    () =>
      memberIds
        ? `${memberIds.length} member${handlePlural(memberIds.length)}`
        : "",
    [memberIds],
  );
  const [members, setMembers] = useState<PrivateRooms>([]);
  const [loading, setLoading] = useState(true);
  const skeletonMembers = useSkeletonRooms(memberIds ? memberIds.length : 0, [
    memberIds,
  ]);

  const handleFetchMembers = async () => {
    try {
      setLoading(true);
      const membersFromServer = await getGroupMembers(memberIds);

      setMembers(membersFromServer.data.groupMembers);
    } catch (error) {
      setMembers(null);
      console.log(error);
      throw Error("Failed to fetch members!");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (member: PrivateRoom) => {
    if (loading) return;

    openRoomUserModal();
    closeRoomInfoModal();
    setSelectedMember(member);
  };

  useEffect(() => {
    if (memberIds) handleFetchMembers();
    // eslint-disable-next-line
  }, [memberIds]);

  return (
    <div
      className="flex min-w-[300px] flex-col gap-10"
      style={{ maxWidth: matches ? "300px" : "400px" }}
    >
      <div className="flex flex-col gap-2 px-3">
        <AvatarWithName
          avatarSize={60}
          avatar={avatar}
          name={name}
          additionalInfo={!memberIds ? status : numMembersString}
        />

        {description && (
          <div>
            <h3 className="text-md text-slate-300">Description</h3>
            <p className="text-sm">{description}</p>
          </div>
        )}
      </div>

      {memberIds && (
        <div className="flex flex-col gap-1">
          <h1 className="text-md px-3 uppercase text-white">
            {numMembersString}
          </h1>

          <Members
            handleMemberClick={handleMemberClick}
            loading={loading}
            members={members}
            skeletonMembers={skeletonMembers}
          />
        </div>
      )}
    </div>
  );
};

export default ViewRoomInfo;
