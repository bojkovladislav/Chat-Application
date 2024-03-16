import { FC, useEffect } from "react";
import { Members } from "../../shared/Members";
import { PrivateRoom, PrivateRooms } from "../../../../types/Rooms";
import { ID } from "../../../../types/PublicTypes";
import useSkeletonRooms from "../../../hooks/useSkeletonRooms";
import { ModalButton } from "../../shared/ModalButton";

interface Props {
  members: PrivateRooms;
  loading: boolean;
  openUserInfoModal: () => void;
  closeMembersModal: () => void;
  setSelectedMember: (member: PrivateRoom) => void;
  openAddMembers: () => void;
  removeMember?: (id: ID) => void;
  userId?: ID;
  handleFetchMembers: () => void;
}

const MembersModal: FC<Props> = ({
  members,
  loading,
  openUserInfoModal,
  setSelectedMember,
  closeMembersModal,
  openAddMembers,
  handleFetchMembers,
  removeMember,
  userId,
}) => {
  const skeletonMembers = useSkeletonRooms(members ? members.length : 2);

  useEffect(() => {
    handleFetchMembers();
    // eslint-disable-next-line
  }, []);

  const handleMemberClick = (member: PrivateRoom) => {
    setSelectedMember(member);
    openUserInfoModal();
  };

  return (
    <div className="flex min-h-[300px] min-w-[300px] flex-col justify-between">
      <Members
        loading={loading}
        members={members}
        skeletonMembers={skeletonMembers}
        handleMemberClick={handleMemberClick}
        removeMember={removeMember}
        userId={userId}
      />

      <div className="flex justify-between px-3">
        <ModalButton title="Add members" onClick={openAddMembers} />
        <ModalButton title="Close" onClick={closeMembersModal} />
      </div>
    </div>
  );
};

export default MembersModal;
