import { FC, useEffect } from "react";
import { Search as SearchIcon } from "react-bootstrap-icons";
import { SetState } from "../../../../types/PublicTypes";
import _debounce from "lodash/debounce";
import { PrivateRooms, RoomsType } from "../../../../types/Rooms";
import { getFilteredChats, getFilteredUsers } from "../../../adapters/api";

interface Props {
  setFilteredUsers: SetState<PrivateRooms>;
  setFilteredChats: SetState<RoomsType | null>;
  setIsFilteredRoomsLoading: SetState<boolean>;
  query: string;
  setQuery: SetState<string>;
  rooms: RoomsType;
}

const SearchBar: FC<Props> = ({
  setFilteredUsers,
  setFilteredChats,
  setIsFilteredRoomsLoading,
  query,
  rooms,
  setQuery,
}) => {
  const handleGetRooms = async () => {
    try {
      setIsFilteredRoomsLoading(true);

      const [filteredPrivateRooms, filteredChats] = await Promise.all([
        getFilteredUsers(query),
        getFilteredChats(
          rooms.map((room) => room.id),
          query,
        ),
      ]);

      const filteredRooms = filteredPrivateRooms.data.filteredPrivateRooms;

      setFilteredChats(filteredChats.data.filteredRooms);
      if (filteredRooms) {
        setFilteredUsers(
          filteredRooms.filter(
            (privateRoom) => !rooms.some((room) => room.id === privateRoom.id),
          ),
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsFilteredRoomsLoading(false);
    }
  };

  const debouncedGetRooms = _debounce(handleGetRooms, 500);

  useEffect(() => {
    if (!query) return;

    debouncedGetRooms();

    return () => {
      debouncedGetRooms.cancel();
    };
    // eslint-disable-next-line
  }, [query]);

  return (
    <div className="flex items-center gap-3 rounded-md border-transparent bg-slate-600 pl-2">
      <SearchIcon />
      <input
        type="text"
        placeholder="Search"
        className="w-full bg-transparent p-2 outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
