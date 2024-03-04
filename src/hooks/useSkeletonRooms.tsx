import { useMemo } from "react";
import { ID, USER_STATUS } from "../../types/PublicTypes";
import { PrivateRoom } from "../../types/Rooms";

type useSkeletonRoomsType = (
  length: number,
  // eslint-disable-next-line
  dependencyArray?: any,
) => PrivateRoom[];

const useSkeletonRooms: useSkeletonRoomsType = (length, dependencyArray) => {
  return useMemo(
    () =>
      Array.from({ length }).map(() => ({
        name: "Fake member",
        id: "Fake member-Fake member-Fake member-Fake member-Fake member" as ID,
        avatar: "#F87171",
        status: USER_STATUS.ONLINE,
        creators: [
          "Fake member-Fake member-Fake member-Fake member-Fake member",
        ],
        commonId: "Fake member-Fake member-Fake member-Fake member-Fake member",
        description: "asdasd",
        opponentRoomId:
          "Fake member-Fake member-Fake member-fake-member-Fake member",
      })),
    // eslint-disable-next-line
    dependencyArray || [],
  );
};

export default useSkeletonRooms;
