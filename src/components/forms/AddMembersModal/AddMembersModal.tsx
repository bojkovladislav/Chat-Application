import { FC, FormEvent, useEffect } from "react";
import {
  Group,
  PrivateRoom,
  PrivateRooms,
  RoomsType,
} from "../../../../types/Rooms";
import { ID, SetState } from "../../../../types/PublicTypes";
import { AddMembers } from "../../core/AddMembers";
import { ModalButton } from "../../shared/ModalButton";
import { socket } from "../../../adapters/socket";

interface Props {
  addedMembers: PrivateRooms;
  setAddedMembers: SetState<PrivateRooms>;
  handleDeleteMember: (id: ID) => void;
  handleMemberClick: (member: PrivateRoom) => void;
  rooms: RoomsType;
  userId: ID;
  closeAddMembersModal: () => void;
  group: Group;
}

const AddMembersModal: FC<Props> = ({
  rooms,
  handleDeleteMember,
  handleMemberClick,
  userId,
  addedMembers,
  setAddedMembers,
  closeAddMembersModal,
  group,
}) => {
  const handleAddMembers = async (e: FormEvent) => {
    e.preventDefault();

    if (addedMembers && addedMembers.length > 0) {
      closeAddMembersModal();
      setAddedMembers([]);

      const addedMemberIds = addedMembers.map((member) => member.id);

      socket.emit("add_members", group, addedMemberIds);
    }
  };

  useEffect(() => {
    return () => {
      socket.off("add_members");
    };
  }, []);

  return (
    <form
      className="flex min-h-[300px] min-w-[300px] flex-col justify-between"
      onSubmit={handleAddMembers}
    >
      <AddMembers
        rooms={rooms}
        userId={userId}
        addedMembers={addedMembers}
        handleDeleteMember={handleDeleteMember}
        handleMemberClick={handleMemberClick}
        currentMembers={group.members}
      />

      <div className="self-end px-3">
        <ModalButton title="Add" />
      </div>
    </form>
  );
};

export default AddMembersModal;
