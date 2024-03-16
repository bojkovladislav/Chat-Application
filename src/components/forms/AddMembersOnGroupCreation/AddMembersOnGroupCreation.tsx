import { FC, FormEvent } from "react";
import { ModalButton } from "../../shared/ModalButton";
import {
  AddedGroupInfo,
  PrivateRoom,
  RoomsType,
} from "../../../../types/Rooms";
import { ID, SetState } from "../../../../types/PublicTypes";
import { AddMembers } from "../../core/AddMembers";

interface Props {
  rooms: RoomsType;
  userId: ID;
  setAddedGroupInfo: SetState<AddedGroupInfo>;
  addedGroupInfo: AddedGroupInfo;
  handleCreateGroup: (e: FormEvent) => void;
}

const AddMembersOnGroupCreation: FC<Props> = ({
  setAddedGroupInfo,
  addedGroupInfo,
  rooms,
  userId,
  handleCreateGroup,
}) => {
  const handleMemberClick = (member: PrivateRoom) => {
    setAddedGroupInfo((prevGroup) => {
      if (!prevGroup) return prevGroup;

      let updatedMembers;

      if (prevGroup.members && prevGroup.members.includes(member)) {
        updatedMembers = prevGroup.members.filter(
          (memb) => memb.id !== member.id,
        );
      } else {
        updatedMembers = [...(prevGroup.members || []), member];
      }

      return {
        ...prevGroup,
        members: updatedMembers,
      };
    });
  };

  const handleDeleteMember = (id: ID) => {
    setAddedGroupInfo((prevGroup) => ({
      ...prevGroup,
      members:
        prevGroup.members?.filter((member) => member.id !== id) ||
        prevGroup.members,
    }));
  };

  return (
    <form
      className="flex w-[300px] flex-col gap-3"
      onSubmit={handleCreateGroup}
    >
      <AddMembers
        rooms={rooms}
        userId={userId}
        addedMembers={addedGroupInfo.members}
        handleDeleteMember={handleDeleteMember}
        handleMemberClick={handleMemberClick}
      />

      <div className="w-fit self-end px-3">
        <ModalButton title="Create" />
      </div>
    </form>
  );
};

export default AddMembersOnGroupCreation;
