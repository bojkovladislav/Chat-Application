import { FC, FormEvent, memo } from "react";
import { Modal } from "../../shared/Modal";
import { NewGroupPreview } from "../../forms/NewGroupPreview";
import { AddMembersOnGroupCreation } from "../../forms/AddMembersOnGroupCreation";
import { UserModal } from "../../shared/UserModal";
import {
  AddedGroupInfo,
  PrivateRoom,
  RoomsType,
} from "../../../../types/Rooms";
import { User } from "../../../../types/Users";
import { SetState } from "../../../../types/PublicTypes";

interface Props {
  isNewGroupPreviewOpened: boolean;
  handleCloseNewGroupPreview: () => void;
  handleInputChange: (value: string) => void;
  inputError: string;
  addedGroupInfo: AddedGroupInfo;
  user: User;
  submitNewGroupCreationForm: (e: FormEvent) => void;
  handleCloseAddedGroupInfo: () => void;
  isAddMembersToNewGroupModalOpened: boolean;
  handleGetBackToThePreviousModal: () => void;
  rooms: RoomsType;
  handleCreateGroup: (e: FormEvent) => void;
  selectedUser: PrivateRoom | null;
  setAddedGroupInfo: SetState<AddedGroupInfo>;
  isUserInfoModalOpen: boolean;
  handleCloseUserInfoModal: () => void;
  handleSendDirectMessage: (currentRoom: PrivateRoom) => Promise<void>;
}

// eslint-disable-next-line
const AddNewGroupModals: FC<Props> = ({
  isNewGroupPreviewOpened,
  handleCloseNewGroupPreview,
  handleInputChange,
  inputError,
  addedGroupInfo,
  user,
  submitNewGroupCreationForm,
  selectedUser,
  handleCloseAddedGroupInfo,
  isAddMembersToNewGroupModalOpened,
  handleGetBackToThePreviousModal,
  handleCreateGroup,
  handleCloseUserInfoModal,
  rooms,
  setAddedGroupInfo,
  handleSendDirectMessage,
  isUserInfoModalOpen,
}) => {
  return (
    <>
      <Modal
        opened={isNewGroupPreviewOpened}
        close={handleCloseNewGroupPreview}
        title="New Group Preview"
        isFormSubmitted={inputError.length === 0}
      >
        <NewGroupPreview
          handleInputChange={handleInputChange}
          inputError={inputError}
          roomName={addedGroupInfo.name}
          submitNewGroupCreationForm={submitNewGroupCreationForm}
        />
      </Modal>

      <Modal
        close={handleCloseAddedGroupInfo}
        opened={isAddMembersToNewGroupModalOpened}
        title="Add members"
        subModal
        subModalClose={handleGetBackToThePreviousModal}
        isFormSubmitted={true}
      >
        <AddMembersOnGroupCreation
          userId={user.id}
          rooms={rooms}
          setAddedGroupInfo={setAddedGroupInfo}
          addedGroupInfo={addedGroupInfo}
          handleCreateGroup={handleCreateGroup}
        />
      </Modal>

      <UserModal
        // close={() => setIsUserInfoModalOpen(false)}
        close={handleCloseUserInfoModal}
        currentUser={selectedUser}
        handleSendDirectMessage={handleSendDirectMessage}
        opened={isUserInfoModalOpen}
        user={user}
      />
    </>
  );
};
// eslint-disable-next-line
export default memo(AddNewGroupModals);
