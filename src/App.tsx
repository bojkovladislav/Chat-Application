import { useEffect, useState } from "react";
import { Chat } from "./components/core/Chat";
import Auth from "./components/core/Auth/Auth.tsx";
import {
  getItemFromLS,
  removeItemFromLS,
  setItemToLS,
} from "./utils/localStorage.ts";
import SideBar from "./components/core/SideBar/SideBar.tsx";
import { Group, PrivateRoom, RoomType, RoomsType } from "../types/Rooms.ts";
import { User } from "../types/Users.ts";
import { socket } from "./adapters/socket.ts";
import { useMediaQuery } from "@mantine/hooks";
import { Messages } from "../types/Messages.ts";
import { BoxArrowRight } from "react-bootstrap-icons";

import { useResizable } from "react-resizable-layout";
import { SplitterForResize } from "./components/shared/SplitterForResize";
import { ID, SelectedImage } from "../types/PublicTypes.ts";
import useEmojiPickerStore from "./store/useEmojiPickerStore.ts";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<RoomsType>([]);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [messages, setMessages] = useState<Messages | null>(null);
  const matches = useMediaQuery("(max-width: 765px)");
  const [areMessagesLoading, setAreMessagesLoading] = useState(false);
  const [areRoomsLoading, setAreRoomsLoading] = useState(true);
  const [filteredChats, setFilteredChats] = useState<RoomsType | null>(null);
  const [addedRoomId, setAddedRoomId] = useState<ID | null>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const userFromLS: User = getItemFromLS("user");
  const { currentEmojiId, closeEmojiPicker } = useEmojiPickerStore();

  const {
    isDragging: isLeftBarDragging,
    position: leftBarCurrentWidth,
    splitterProps: leftBarDragBarProps,
  } = useResizable({
    axis: "x",
    initial: 500,
    min: 315,
    max: 500,
  });

  const createUser = (name: string) => {
    const updateUserData = (data: User) => {
      setUser(data);
      setItemToLS("user", data);
    };

    const handleUserCreation = (newUser: User) => {
      updateUserData(newUser);
    };

    const handleUserExists = (user: User) => {
      updateUserData(user);
    };

    const handleUserCreationFailed = (message: string) => {
      console.log("User creation failed!: ", message);
    };

    socket.emit("create_user", name);
    socket.on("user_created", handleUserCreation);
    socket.on("user_exists", handleUserExists);
    socket.on("user_creation_failed", handleUserCreationFailed);
  };

  const updateUser = () => {
    socket.emit("get_user", userFromLS.id);

    socket.on("user_got", (newUser) => {
      setUser(newUser);
      setItemToLS("user", newUser);
    });
  };

  const loadMessages = () => {
    if (room) {
      socket.emit(
        "get_messages",
        (room as Group).members ? room.id : (room as PrivateRoom).commonId,
      );

      socket.on("messages_got", (messages) => {
        setAreMessagesLoading(false);
        setMessages(messages);
      });
    }
  };

  const handleLogOut = () => {
    socket.emit("user_disconnect", user?.id);

    setUser(null);
    removeItemFromLS("user");
    setMessages(null);
    setRoom(null);
    setRooms([]);
  };

  const fetchAllRooms = (roomIds: ID[]) => {
    socket.emit("get_rooms", roomIds);

    socket.on("rooms_got", (rooms) => {
      setAreRoomsLoading(false);
      setRooms(rooms);
    });
  };

  const joinRoom = (id: ID | string) => {
    if (!id) return;

    socket.emit("join_room", id);
  };

  const handleAddRoomLocally = (room: RoomType) => {
    setAddedRoomId(room.id);
    setRooms((prevRooms) =>
      !prevRooms.some((r) => r.id === room.id)
        ? [room, ...prevRooms]
        : prevRooms,
    );
  };

  const handleEndRoomCreation = (room: RoomType) => {
    setRoom(room);
    setAreMessagesLoading(false);

    setAddedRoomId(null);
  };

  const handleRoomDeleteLocally = (id: ID) => {
    if (room && id === room.id) {
      setRoom(null);
    }

    setRooms((prevRooms) => {
      return prevRooms.filter((room: RoomType) => room.id !== id);
    });
    setRoom(null);
  };

  useEffect(() => {
    if (userFromLS) updateUser();

    setAreRoomsLoading(true);

    socket.on("send_group", handleAddRoomLocally);

    socket.on("group_created", (group: Group) => {
      if (user && group.creators[0] === user.id) {
        handleEndRoomCreation(group);
        joinRoom(group.id);

        return;
      }

      setAreMessagesLoading(false);
      setAddedRoomId(null);
    });

    socket.on("send_private-room_to_opponent", (newPrivateRoom) => {
      setRooms((prevRooms) => [newPrivateRoom, ...prevRooms]);
      setFilteredChats(
        (prevChats) => prevChats && [...prevChats, newPrivateRoom],
      );
    });

    socket.on("private-room_created", handleEndRoomCreation);

    socket.on("group_deleted", handleRoomDeleteLocally);

    socket.on("group_credentials_updated", (updatedGroupCredentials) => {
      setRoom(
        (prevRoom) =>
          prevRoom && {
            ...prevRoom,
            ...updatedGroupCredentials,
            id: prevRoom.id,
          },
      );

      setRooms((prevRooms) => {
        return prevRooms.map((room) => {
          if (room.id === updatedGroupCredentials.id) {
            return {
              ...room,
              ...updatedGroupCredentials,
              id: room.id,
            };
          }

          return room;
        });
      });
    });

    return () => {
      socket.off("send_group");
      socket.off("update_group_credentials");
      socket.off("private-room_created");
      socket.off("group_deleted");
      socket.off("group_credentials_updated");
      socket.off("send_private-room_to_opponent");
      socket.off("group_created");
      socket.off("create_user");
      socket.off("user_created");
      socket.off("user_exists");
      socket.off("user_creation_failed");
      socket.off("get_user");
      socket.off("failed_get_messages");
    };
    // eslint-disable-next-line
  }, [socket]);

  useEffect(() => {
    loadMessages();

    socket.on("failed_get_messages", () => {
      setAreMessagesLoading(false);
      setMessages(null);
    });

    return () => {
      socket.off("failed_get_messages");
    };
    // eslint-disable-next-line
  }, [room]);

  useEffect(() => {
    if (user) fetchAllRooms(user?.rooms);
  }, [user]);

  return (
    <div
      className={`flex md:pb-10 ${
        !user && "items-center justify-center"
      } h-screen flex-col`}
    >
      {!userFromLS ? (
        <Auth createUser={createUser} />
      ) : (
        <>
          {user ? (
            <>
              <header
                className={`flex items-center justify-between border-b-2 border-slate-600 bg-slate-800 p-5 md:px-52 md:py-5 ${
                  matches && room ? "hidden" : "block"
                }`}
              >
                <h1 className="text-xl font-bold">Chat App</h1>
                <BoxArrowRight
                  onClick={handleLogOut}
                  className="cursor-pointer text-xl"
                />
              </header>
              <main
                className={`flex h-full flex-col ${
                  user && "md:min-h-[500px] md:px-52"
                }`}
              >
                <div className="flex h-full md:rounded-md md:rounded-tl-none md:rounded-tr-none md:border-b-2 md:border-l-2 md:border-r-2 md:border-slate-600">
                  {matches ? (
                    !room ? (
                      <SideBar
                        user={user}
                        addedRoomId={addedRoomId}
                        setAddedRoomId={setAddedRoomId}
                        setSelectedImages={setSelectedImages}
                        areRoomsLoading={areRoomsLoading}
                        setRooms={setRooms}
                        setAreMessagesLoading={setAreMessagesLoading}
                        rooms={rooms}
                        room={room}
                        setRoom={setRoom}
                        filteredChats={filteredChats}
                        setFilteredChats={setFilteredChats}
                      />
                    ) : (
                      <Chat
                        user={user}
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        messages={messages}
                        areMessagesLoading={areMessagesLoading}
                        setMessages={setMessages}
                        room={room}
                        setRoom={setRoom}
                        setRooms={setRooms}
                        filteredChats={filteredChats}
                        setFilteredChats={setFilteredChats}
                        setAreMessagesLoading={setAreMessagesLoading}
                        rooms={rooms}
                      />
                    )
                  ) : (
                    <>
                      <div
                        style={{
                          width: leftBarCurrentWidth,
                          overflow: "auto",
                        }}
                      >
                        <SideBar
                          user={user}
                          setSelectedImages={setSelectedImages}
                          setRooms={setRooms}
                          addedRoomId={addedRoomId}
                          setAddedRoomId={setAddedRoomId}
                          setAreMessagesLoading={setAreMessagesLoading}
                          rooms={rooms}
                          room={room}
                          areRoomsLoading={areRoomsLoading}
                          setRoom={setRoom}
                          filteredChats={filteredChats}
                          setFilteredChats={setFilteredChats}
                        />
                      </div>
                      <SplitterForResize
                        isDragging={isLeftBarDragging}
                        {...leftBarDragBarProps}
                      />
                      <Chat
                        user={user}
                        messages={messages}
                        areMessagesLoading={areMessagesLoading}
                        setMessages={setMessages}
                        room={room}
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        setRoom={setRoom}
                        setRooms={setRooms}
                        filteredChats={filteredChats}
                        setFilteredChats={setFilteredChats}
                        setAreMessagesLoading={setAreMessagesLoading}
                        rooms={rooms}
                      />
                    </>
                  )}
                </div>

                {currentEmojiId && (
                  <div
                    className="fixed left-0 top-0 h-full w-full"
                    onClick={closeEmojiPicker}
                  />
                )}
              </main>
            </>
          ) : (
            <div className="flex flex-col gap-5">
              <h1>The Chat Is Loading...</h1>
              <p className="max-w-sm text-sm">
                <span className="text-yellow-300">Note:</span> Initial loading
                time may be slightly longer than usual due to the limitations of
                my server, which is hosted for free.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

// TODO:
// images


// FEATURES
// - add a profile page.
