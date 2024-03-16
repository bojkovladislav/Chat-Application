import { ID, SetState } from "../../types/PublicTypes";
import { Group, RoomType, RoomsType } from "../../types/Rooms";

interface Props {
  setRooms: SetState<RoomsType>;
  setRoom: SetState<RoomType | null>;
}

interface ReturnValues {
  addMember: (groupId: ID, memberId: ID) => void;
  removeMember: (groupId: ID, memberId: ID) => void;
}

type UseGroupOperations = (
  setRooms: Props["setRooms"],
  setRoom: Props["setRoom"],
) => ReturnValues;

const useGroupOperations: UseGroupOperations = (setRooms, setRoom) => {
  const updateRoomMembers = (
    roomId: ID,
    newMembers: ID[],
    prevRooms: RoomType[],
  ): RoomType[] => {
    return prevRooms.map((room) => {
      if (room.id === roomId) {
        return {
          ...room,
          members: newMembers,
        };
      }
      return room;
    });
  };

  const addMember: ReturnValues["addMember"] = (groupId: ID, memberId: ID) => {
    setRoom((prevRoom) => {
      if (!prevRoom) return prevRoom;

      const updatedMembers = [
        ...((prevRoom as Group)?.members || []),
        memberId,
      ];

      return { ...prevRoom, members: updatedMembers };
    });

    setRooms((prevRooms) =>
      updateRoomMembers(
        groupId,
        [
          ...((prevRooms.find((r) => r.id === groupId) as Group)?.members ||
            []),
          memberId,
        ],
        prevRooms,
      ),
    );
  };

  const removeMember: ReturnValues["removeMember"] = (
    groupId: ID,
    memberId: ID,
  ) => {
    setRoom((prevRoom) => {
      if (!prevRoom) return prevRoom;

      const updatedMembers = (prevRoom as Group)?.members.filter(
        (mId) => mId !== memberId,
      );
      return { ...prevRoom, members: updatedMembers };
    });

    setRooms((prevRooms) =>
      updateRoomMembers(
        groupId,
        (prevRooms.find((r) => r.id === groupId) as Group)?.members.filter(
          (mId) => mId !== memberId,
        ),
        prevRooms,
      ),
    );
  };

  return { addMember, removeMember };
};

export default useGroupOperations;
