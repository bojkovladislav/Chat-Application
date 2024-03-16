import { FC, memo, useEffect, useState } from "react";
import { Modal } from "../../shared/Modal";
import { DeleteGroupForm } from "../DeleteRoomModal";
import { ViewRoomInfo } from "../ViewRoomInfoModal";
import { ManageGroupModal } from "../../forms/ManageGroupModal";
import { MembersModal } from "../../forms/MembersModal";
import { AddMembersModal } from "../../forms/AddMembersModal";
import { AdministratorsModal } from "../../forms/AdministratorsModal";
import { UserModal } from "../../shared/UserModal";
import useDisclosureStore from "../../../store/useRoomDisclosureStore";
import {
  Group,
  PrivateRoom,
  PrivateRooms,
  RoomType,
  RoomsType,
} from "../../../../types/Rooms";
import { User } from "../../../../types/Users";
import { ID, SetState } from "../../../../types/PublicTypes";
import { getGroupMembers } from "../../../adapters/api";
import { socket } from "../../../adapters/socket";

interface Props {
  room: RoomType | null;
  user: User;
  setRooms: SetState<RoomsType>;
  setRoom: SetState<RoomType | null>;
  filteredChats: RoomsType | null;
  setFilteredChats: SetState<RoomsType | null>;
  setSelectedMember: SetState<PrivateRoom | null>;
  membersForMembersModal: PrivateRooms;
  setMembersForMembersModal: SetState<PrivateRooms>;
  addedGroupMembers: PrivateRooms;
  setAddedGroupMembers: SetState<PrivateRooms>;
  rooms: RoomsType;
  handleSendDirectMessage: (currentMember: PrivateRoom) => Promise<void>;
  selectedMember: PrivateRoom | null;
  isUserModalOpened: boolean;
  openRoomUserModal: () => void;
  closeRoomUserModal: () => void;
  isMembersModalOpened: boolean;
  openMembersModal: () => void;
  closeMembersModal: () => void;
  isAdministratorsModalOpened: boolean;
  openAdministratorsModal: () => void;
  closeAdministratorsModal: () => void;
  isAddMembersToNewGroupModalOpened: boolean;
  openAddMembersToGroupModal: () => void;
  closeAddMembersToGroupModal: () => void;
}

// eslint-disable-next-line
const ChatSettingsModals: FC<Props> = ({
  room,
  user,
  setRooms,
  setRoom,
  filteredChats,
  setFilteredChats,
  setSelectedMember,
  setMembersForMembersModal,
  membersForMembersModal,
  setAddedGroupMembers,
  rooms,
  addedGroupMembers,
  selectedMember,
  handleSendDirectMessage,
  isUserModalOpened,
  openRoomUserModal,
  closeRoomUserModal,
  isMembersModalOpened,
  openMembersModal,
  closeMembersModal,
  openAdministratorsModal,
  openAddMembersToGroupModal,
  closeAddMembersToGroupModal,
  isAddMembersToNewGroupModalOpened,
  closeAdministratorsModal,
  isAdministratorsModalOpened,
}) => {
  const {
    isOpened: isDeleteRoomModalOpened,
    closeDiscloSure: closeDeleteRoomModal,
  } = useDisclosureStore().deleteRoomItem;
  const { isOpened: isRoomInfoModalOpen, closeDiscloSure: closeRoomInfoModal } =
    useDisclosureStore().roomInfoItem;
  const {
    closeDiscloSure: closeManageGroupModal,
    openDiscloSure: openManageGroupModal,
    isOpened: isManageGroupModalOpened,
  } = useDisclosureStore().manageRoomItem;
  const [
    areMembersForMembersModalLoading,
    setAreMembersForMembersModalLoading,
  ] = useState(true);

  const handleCloseMembersSubModal = () => {
    closeMembersModal();
    openManageGroupModal();
  };

  const handleFetchMembers = async () => {
    if (!(room as Group).members) return;

    try {
      setAreMembersForMembersModalLoading(true);
      const membersFromServer = await getGroupMembers((room as Group).members);

      setMembersForMembersModal(membersFromServer.data.groupMembers);
    } catch (error) {
      setMembersForMembersModal(null);
      throw Error("Failed to fetch members!");
    } finally {
      setAreMembersForMembersModalLoading(false);
    }
  };

  const handleRemoveMember = (id: ID) => {
    socket.emit("remove_member", room?.id, id);
  };

  const handleDeleteMember = (id: ID) => {
    setAddedGroupMembers(
      (prevMembers) =>
        prevMembers && prevMembers.filter((member) => member.id !== id),
    );
  };

  const handleMemberClick = (member: PrivateRoom) => {
    setAddedGroupMembers((prevMembers) => {
      if (!prevMembers) return prevMembers;

      if (prevMembers.includes(member)) {
        return prevMembers.filter((m) => m.id !== member.id);
      } else {
        return [...prevMembers, member];
      }
    });
  };

  useEffect(() => {
    return () => {
      socket.off("remove_member");
    };
  }, []);

  return (
    <>
      <Modal
        title="Delete Chat"
        close={closeDeleteRoomModal}
        opened={isDeleteRoomModalOpened}
      >
        <DeleteGroupForm
          title={room?.name || ""}
          room={room}
          setRooms={setRooms}
          roomType={room && (room as Group).members ? "group" : "private-room"}
          user={user}
          filteredChats={filteredChats}
          setFilteredChats={setFilteredChats}
          currentRoom={room}
          closeModal={closeDeleteRoomModal}
          setRoom={setRoom}
        />
      </Modal>

      <Modal
        title="Room Info"
        opened={isRoomInfoModalOpen}
        close={closeRoomInfoModal}
      >
        <ViewRoomInfo
          currentRoom={room as Group}
          openRoomUserModal={openRoomUserModal}
          setSelectedMember={setSelectedMember}
        />
      </Modal>

      <Modal
        opened={isManageGroupModalOpened}
        close={closeManageGroupModal}
        title="Manage a group"
      >
        <ManageGroupModal
          group={room as Group}
          openMembersModal={() => {
            openMembersModal();
            closeManageGroupModal();
          }}
          openAdminModal={() => {
            closeManageGroupModal();
            openAdministratorsModal();
          }}
          closeManageGroupModal={closeManageGroupModal}
          user={user}
        />
      </Modal>

      <Modal
        opened={isMembersModalOpened}
        close={() => {
          closeMembersModal();
          closeManageGroupModal();
        }}
        subModal
        subModalClose={handleCloseMembersSubModal}
        title="Members"
      >
        <MembersModal
          members={membersForMembersModal}
          loading={areMembersForMembersModalLoading}
          closeMembersModal={handleCloseMembersSubModal}
          setSelectedMember={setSelectedMember}
          openUserInfoModal={openRoomUserModal}
          openAddMembers={() => {
            openAddMembersToGroupModal();
            closeMembersModal();
          }}
          handleFetchMembers={handleFetchMembers}
          userId={user.id}
          removeMember={
            room?.creators.includes(user.id) ? handleRemoveMember : undefined
          }
        />
      </Modal>

      <Modal
        opened={isAddMembersToNewGroupModalOpened}
        close={() => {
          closeAddMembersToGroupModal();
          setAddedGroupMembers([]);
        }}
        title="Add members"
        subModal
        subModalClose={() => {
          closeAddMembersToGroupModal();
          openMembersModal();
          setAddedGroupMembers([]);
        }}
      >
        <AddMembersModal
          rooms={rooms}
          userId={user.id}
          addedMembers={addedGroupMembers}
          handleDeleteMember={handleDeleteMember}
          group={room as Group}
          handleMemberClick={handleMemberClick}
          closeAddMembersModal={closeAddMembersToGroupModal}
          setAddedMembers={setAddedGroupMembers}
        />
      </Modal>

      <Modal
        subModal
        subModalClose={() => {
          closeAdministratorsModal();
          openManageGroupModal();
        }}
        title="Administrators"
        close={() => {
          closeAdministratorsModal();
          closeManageGroupModal();
        }}
        opened={isAdministratorsModalOpened}
      >
        <AdministratorsModal
          administrators={
            membersForMembersModal?.filter(
              (member) => room?.creators.includes(member.id),
            ) as PrivateRooms
          }
          isCurrentUserAdmin={(room as Group)?.creators.includes(user.id)}
          handleFetchMembers={handleFetchMembers}
        />
      </Modal>

      <UserModal
        close={closeRoomUserModal}
        currentUser={selectedMember}
        handleSendDirectMessage={handleSendDirectMessage}
        opened={isUserModalOpened}
        user={user}
      />
    </>
  );
};
// eslint-disable-next-line
export default memo(ChatSettingsModals);
