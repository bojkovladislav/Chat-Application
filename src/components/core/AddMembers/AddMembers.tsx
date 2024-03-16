import { FC, useEffect, useState } from "react";
import { PrivateRoom, PrivateRooms, RoomsType } from "../../../../types/Rooms";
import { ID } from "../../../../types/PublicTypes";
import { AddedGroup } from "../AddedGroup";
import { Members } from "../../shared/Members";
import useSkeletonRooms from "../../../hooks/useSkeletonRooms";
import { getFriends } from "../../../adapters/api";

interface Props {
  addedMembers: PrivateRooms;
  handleDeleteMember: (id: ID) => void;
  handleMemberClick: (member: PrivateRoom) => void;
  rooms: RoomsType;
  userId: ID;
  currentMembers?: ID[];
}

const AddMembers: FC<Props> = ({
  addedMembers,
  handleDeleteMember,
  handleMemberClick,
  rooms,
  userId,
  currentMembers,
}) => {
  const [loading, setLoading] = useState(true);
  const [availableMembers, setAvailableMembers] = useState<PrivateRooms | null>(
    null,
  );
  const skeletonMembers = useSkeletonRooms(2);

  const handleFetchFriends = async () => {
    try {
      setLoading(true);
      const roomIds = rooms.map((room) => room.id);
      const friendsFromTheServer = await getFriends(roomIds, userId);

      const friends = friendsFromTheServer.data.friends;

      const preparedFriends = currentMembers
        ? friends?.filter((friend) => !currentMembers?.includes(friend.id)) ||
          null
        : friends;

      setAvailableMembers(preparedFriends);
    } catch (error) {
      console.log("Error fetching friends!", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchFriends();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3 px-3">
        {addedMembers &&
          addedMembers.map(({ name, id, avatar }) => (
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
        addedMembers={addedMembers}
        loading={loading}
        members={availableMembers}
        skeletonMembers={skeletonMembers}
      />
    </div>
  );
};

export default AddMembers;
