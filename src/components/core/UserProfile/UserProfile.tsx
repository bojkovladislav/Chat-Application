import { ChangeEvent, FC, FormEvent, useRef, useState } from "react";
import { User } from "../../../../types/Users";
import { AvatarToUpdate } from "../../shared/AvatarToUpdate";
import { useDisclosure } from "@mantine/hooks";
import useImageSelection from "../../../hooks/useImageSelection";
import { AvatarEditorModal } from "../../shared/AvatarEditorModal";
import {
  SelectedImage,
  SetState,
  USER_STATUS,
} from "../../../../types/PublicTypes";
import { SettingsItems } from "../SettingsItems";
import { SettingsItem } from "../../../../types/SettingsItems";
import { Activity, Person } from "react-bootstrap-icons";
import { DescriptionInput } from "../../shared/DescriptionInput";
import useTextAreaAdjustment from "../../../hooks/useTextAreaAdjustment";
import { socket } from "../../../adapters/socket";
import { Modal } from "../../shared/Modal";
import { EditUserNameModal } from "../../forms/EditUserNameModal";
import { UserInfoType } from "../../../../types/UserInfoType";

interface Props {
  user: User;
  handleLogOut: () => void;
  closeUserProfileModal: () => void;
  setUser: SetState<User | null>;
}

const UserProfile: FC<Props> = ({
  user,
  handleLogOut,
  closeUserProfileModal,
  setUser,
}) => {
  const { avatar, name, status, bio, id } = user;
  const [
    isAvatarEditorModalOpened,
    { open: openAvatarEditorModal, close: closeAvatarEditorModal },
  ] = useDisclosure(false);
  const [
    isUserNameEditingModalOpened,
    { open: openUserNameEditingModal, close: closeUserNameEditingModal },
  ] = useDisclosure(false);
  const [selectedImageForAvatar, setSelectedImageForAvatar, selectFile] =
    useImageSelection();
  const [biography, handleTextareaChange, textareaRef] =
    useTextAreaAdjustment(bio);
  const [currentBio, setCurrentBio] = useState("");
  const bioChanged = useRef(false);
  const [userInfo, setUserInfo] = useState<UserInfoType>({
    name,
    status,
  });
  const items: SettingsItem[] = [
    {
      title: "Name",
      clickEvent: openUserNameEditingModal,
      icon: <Person />,
      value: name,
    },
    {
      title: "Status",
      clickEvent: () => {},
      icon: <Activity />,
      value: status,
    },
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectFile(e);
    openAvatarEditorModal();
  };

  const handleBioChange = (value: string) => {
    bioChanged.current = false;
    setCurrentBio(value);
    handleTextareaChange(value);
  };

  const handleSubmitAvatar = async (newImage: SelectedImage) => {
    setUser((prevUser) => prevUser && { ...prevUser, avatar: newImage.src });

    socket.emit("user_update_avatar", id, newImage);
  };

  const handleEditName = (value: string) => {
    setUserInfo((prevUserInfo) => ({ ...prevUserInfo, name: value }));
  };

  const handleSaveNewName = (e: FormEvent) => {
    e.preventDefault();
    closeUserNameEditingModal();

    setUser((prevUser) => prevUser && { ...prevUser, name: userInfo.name });
    socket.emit("user_update_field", id, "name", userInfo.name);
  };

  return (
    <div className="flex min-w-[250px] flex-col gap-10">
      <div className=" flex flex-col gap-2">
        <div className="flex flex-col items-center px-3">
          <AvatarToUpdate
            initialAvatar={avatar}
            selectedAvatar={avatar}
            handleFileChange={handleFileChange}
            avatarSize={90}
          />
          <p>{name}</p>
          <div className="flex items-center gap-1">
            <span
              className="h-[9px] w-[9px] rounded-full border-[1px]"
              style={{
                backgroundColor:
                  status === USER_STATUS.ONLINE ? "green" : "transparent",
              }}
            />
            <p className="text-[12px] text-slate-400">{status}</p>
          </div>
        </div>

        <div className="px-3">
          <DescriptionInput
            placeholder="Bio"
            handleTextareaChange={handleBioChange}
            value={biography}
            textareaRef={textareaRef}
            maxLength={100}
          />
        </div>

        <button
          className="transition-all duration-300"
          style={{
            opacity: currentBio.length > 0 ? 1 : 0,
            pointerEvents: currentBio.length > 0 ? "all" : "none",
          }}
          onClick={(e) => {
            e.preventDefault();

            bioChanged.current = true;

            setUser(
              (prevUser) => prevUser && { ...prevUser, bio: biography.trim() },
            );
            socket.emit("user_update_field", id, "bio", biography.trim());
          }}
        >
          {`${bioChanged.current ? "Saved" : "Save"}`}
        </button>

        <SettingsItems items={items} user={user} setUser={setUser} />
      </div>

      <button
        onClick={() => {
          closeUserProfileModal();
          handleLogOut();
        }}
        className="self-end px-3 text-sm text-red-500"
      >
        Log out
      </button>

      {selectedImageForAvatar && (
        <AvatarEditorModal
          close={() => {
            closeAvatarEditorModal();
            setSelectedImageForAvatar(null);
          }}
          opened={isAvatarEditorModalOpened}
          handleSubmitAvatar={handleSubmitAvatar}
          selectedImage={selectedImageForAvatar}
        />
      )}

      {isUserNameEditingModalOpened && (
        <Modal
          close={() => {
            closeUserNameEditingModal();
            setUserInfo((prevUserInfo) => ({ ...prevUserInfo, name }));
          }}
          opened={isUserNameEditingModalOpened}
          title="Edit your name"
        >
          <EditUserNameModal
            handleEditName={handleEditName}
            handleSaveNewName={handleSaveNewName}
            value={userInfo.name}
          />
        </Modal>
      )}
    </div>
  );
};

export default UserProfile;
