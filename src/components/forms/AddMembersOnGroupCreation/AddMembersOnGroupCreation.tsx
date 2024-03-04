import { FC, FormEvent, useEffect, useState } from "react";
import { ModalButton } from "../../shared/ModalButton";
import {
  AddedGroupInfo,
  PrivateRoom,
  PrivateRooms,
  RoomsType,
} from "../../../../types/Rooms";
import { Members } from "../../shared/Members";
import { ID, SetState } from "../../../../types/PublicTypes";
import { getFriends } from "../../../adapters/api";
import { AddedGroup } from "../../core/AddedGroup";
import useSkeletonRooms from "../../../hooks/useSkeletonRooms";

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
  const [availableMembers, setAvailableMembers] = useState<PrivateRooms | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const skeletonMembers = useSkeletonRooms(2);

  const handleMemberClick = (member: PrivateRoom) => {
    if (loading) return;

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

  const handleFetchFriends = async () => {
    try {
      setLoading(true);
      const roomIds = rooms.map((room) => room.id);
      const friendsFromTheServer = await getFriends(roomIds, userId);

      setAvailableMembers(friendsFromTheServer.data.friends);
    } catch (error) {
      console.log("Error fetching friends!", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = (id: ID) => {
    setAddedGroupInfo((prevGroup) => ({
      ...prevGroup,
      members:
        prevGroup.members?.filter((member) => member.id !== id) ||
        prevGroup.members,
    }));
  };

  useEffect(() => {
    handleFetchFriends();
    // eslint-disable-next-line
  }, []);

  return (
    <form
      className="flex w-[300px] flex-col gap-3"
      onSubmit={handleCreateGroup}
    >
      <div className="flex flex-wrap gap-3 px-3">
        {addedGroupInfo?.members &&
          addedGroupInfo?.members.map(({ name, id, avatar }) => (
            <AddedGroup
              name={name}
              avatar={avatar}
              key={id}
              id={id}
              handleDeleteMember={handleDeleteMember}
            />
          ))}
      </div>

      <Members
        handleMemberClick={handleMemberClick}
        addedMembers={addedGroupInfo.members}
        loading={loading}
        members={availableMembers}
        skeletonMembers={skeletonMembers}
      />

      <div className="w-fit self-end px-3">
        <ModalButton title="Create" />
      </div>
    </form>
  );
};

export default AddMembersOnGroupCreation;
