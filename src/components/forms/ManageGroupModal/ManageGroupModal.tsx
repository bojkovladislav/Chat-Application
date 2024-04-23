import { ChangeEvent, FC, FormEvent, useEffect, useRef, useState } from "react";
import { GroupInfo } from "../../../../types/GroupInfo";
import { Group } from "../../../../types/Rooms";
import { useDisclosure } from "@mantine/hooks";
import { People, Sliders, Star } from "react-bootstrap-icons";
import { ModalButton } from "../../shared/ModalButton";
import { socket } from "../../../adapters/socket";
import { User } from "../../../../types/Users";
import { AvatarEditorModal } from "../../shared/AvatarEditorModal";
import { SelectedImage } from "../../../../types/PublicTypes";
import { AvatarToUpdate } from "../../shared/AvatarToUpdate";
import useImageSelection from "../../../hooks/useImageSelection";
import { SettingsItems } from "../../core/SettingsItems";
import useTextAreaAdjustment from "../../../hooks/useTextAreaAdjustment";
import { DescriptionInput } from "../../shared/DescriptionInput";

interface Props {
  group: Group;
  closeManageGroupModal: () => void;
  openMembersModal: () => void;
  openAdminModal: () => void;
  user: User;
}

const ManageGroupModal: FC<Props> = ({
  group,
  openMembersModal,
  closeManageGroupModal,
  openAdminModal,
  user,
}) => {
  const [groupInfo, setGroupInfo] = useState<GroupInfo>({
    name: group.name,
    description: group.description || "",
    isPublic: group.isPublic,
    avatar: group.avatar,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImageForAvatar, setSelectedImageForAvatar, selectFile] =
    useImageSelection();
  const [
    isAvatarEditorModalOpened,
    { open: openAvatarEditorModal, close: closeAvatarEditorModal },
  ] = useDisclosure(false);
  const [description, handleTextareaChange, textareaRef] =
    useTextAreaAdjustment(group.description);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTitleChange = (currentValue: string) => {
    setGroupInfo((prevGroupInfo) => ({
      ...prevGroupInfo,
      name: currentValue,
    }));
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    closeManageGroupModal();

    console.log(
      group.id,
      group.members,
      {
        name: group.name,
        description: group.description,
        isPublic: group.isPublic,
        avatar: group.avatar,
      },
      groupInfo,
    );

    if (
      group.description !== groupInfo.description.trim() ||
      group.name !== groupInfo.name.trim() ||
      group.isPublic !== groupInfo.isPublic ||
      (typeof groupInfo.avatar !== "string"
        ? group.avatar !== groupInfo.avatar.src
        : group.avatar !== groupInfo.avatar)
    ) {
      const originalGroupCred = {
        name: group.name,
        description: group.description,
        isPublic: group.isPublic,
        avatar: group.avatar,
      };

      socket.emit(
        "update_group_credentials",
        group.id,
        group.members,
        originalGroupCred,
        groupInfo,
      );
    }
  };

  const itemsAllowedToAnybody = [
    {
      title: "Members",
      clickEvent: openMembersModal,
      icon: <People />,
      value: group.members.length.toString(),
    },
    {
      title: "Administrators",
      clickEvent: openAdminModal,
      icon: <Star />,
      value: group.creators.length.toString(),
    },
  ];

  const items = group.creators.includes(user.id)
    ? itemsAllowedToAnybody.concat([
        {
          title: "Group Info",
          clickEvent: () =>
            setGroupInfo((prevGroupInfo) => ({
              ...prevGroupInfo,
              isPublic: !prevGroupInfo.isPublic,
            })),
          icon: <Sliders />,
          value: groupInfo.isPublic ? "public" : "private",
        },
      ])
    : itemsAllowedToAnybody;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectFile(e);
    openAvatarEditorModal();
  };

  const handleSubmitAvatar = async (newImage: SelectedImage) => {
    setGroupInfo((prevGroupInfo) => ({
      ...prevGroupInfo,
      avatar: newImage,
    }));
  };

  useEffect(() => {
    setGroupInfo((prevGroupInfo) => ({ ...prevGroupInfo, description }));
  }, [description]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex flex-col gap-5 px-3 pb-4">
        <div className="flex gap-5">
          <AvatarToUpdate
            initialAvatar={group.avatar}
            selectedAvatar={groupInfo.avatar}
            handleFileChange={handleFileChange}
          />

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

          <div className="flex flex-col">
            <label htmlFor="group-name" className="text-blue-400">
              Group name
            </label>
            <input
              type="text"
              id="group-name"
              ref={inputRef}
              value={groupInfo.name}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-md border-b-[1px] border-slate-600 bg-transparent p-1 outline-none transition-all duration-300 focus:border-blue-400"
            />
          </div>
        </div>
        <DescriptionInput
          handleTextareaChange={handleTextareaChange}
          placeholder="Description (optional)"
          textareaRef={textareaRef}
          value={groupInfo.description}
        />
      </div>

      <div className="h-2 bg-slate-700" />

      <div className="flex flex-col gap-12 pt-2">
        <SettingsItems items={items} user={user} />
        <div className="self-end px-3">
          <ModalButton title="Save" />
        </div>
      </div>
    </form>
  );
};

export default ManageGroupModal;
