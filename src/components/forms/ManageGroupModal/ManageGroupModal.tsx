import {
  ChangeEvent,
  FC,
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { GroupInfo } from "../../../../types/GroupInfo";
import { Group } from "../../../../types/Rooms";
import { useDisclosure } from "@mantine/hooks";
import { Avatar } from "../../shared/Avatar";
import { Camera, People, Sliders, Star } from "react-bootstrap-icons";
import { ModalButton } from "../../shared/ModalButton";
import { socket } from "../../../adapters/socket";
import { User } from "../../../../types/Users";
import { AvatarEditorModal } from "../../shared/AvatarEditorModal";
import { SelectedImage } from "../../../../types/PublicTypes";

interface Props {
  group: Group;
  closeManageGroupModal: () => void;
  openMembersModal: () => void;
  openAdminModal: () => void;
  user: User;
}

interface ItemProps {
  icon: ReactNode;
  title: string;
  value: string;
  clickEvent: () => void;
}

const Item: FC<ItemProps> = ({ icon, title, value, clickEvent }) => {
  return (
    <div
      className="flex cursor-pointer items-center justify-between p-2 transition-colors duration-300 hover:bg-slate-800"
      onClick={clickEvent}
    >
      <div className="flex items-center gap-4">
        <div>{icon}</div>
        <h3>{title}</h3>
      </div>
      <p className="text-sm text-blue-400">{value}</p>
    </div>
  );
};

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedImageForAvatar, setSelectedImageForAvatar] = useState<{
    name: string;
    src: string;
  } | null>(null);
  const [
    isAvatarEditorModalOpened,
    { open: openAvatarEditorModal, close: closeAvatarEditorModal },
  ] = useDisclosure(false);
  const [isAvatarImageHovered, setIsAvatarImageHovered] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const updateTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "20px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200,
      )}px`;
    }
  };

  const handleTitleChange = (currentValue: string) => {
    setGroupInfo((prevGroupInfo) => ({
      ...prevGroupInfo,
      name: currentValue,
    }));
  };

  const handleTextareaChange = (value: string) => {
    updateTextareaHeight();
    setGroupInfo((prevGroupInfo) => ({
      ...prevGroupInfo,
      description: value,
    }));
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    closeManageGroupModal();

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

  const items: ItemProps[] = group.creators.includes(user.id)
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
    const newImage = e.target.files && e.target.files[0];

    if (!newImage) return null;

    const imageUrl = URL.createObjectURL(newImage);

    setSelectedImageForAvatar({
      name: newImage.name,
      src: imageUrl,
    });
    openAvatarEditorModal();
  };

  const handleSubmitAvatar = async (newImage: SelectedImage) => {
    setGroupInfo((prevGroupInfo) => ({
      ...prevGroupInfo,
      avatar: newImage,
    }));
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex flex-col gap-5 px-3 pb-4">
        <div className="flex gap-5">
          <label htmlFor="selectFileInput">
            {(typeof groupInfo.avatar === "string" &&
              groupInfo.avatar.includes("http")) ||
            typeof groupInfo.avatar !== "string" ? (
              <div
                className="relative h-fit w-fit cursor-pointer"
                onMouseEnter={() => setIsAvatarImageHovered(true)}
                onMouseLeave={() => setIsAvatarImageHovered(false)}
              >
                <Avatar
                  avatar={
                    typeof groupInfo.avatar !== "string"
                      ? groupInfo.avatar.src
                      : groupInfo.avatar
                  }
                  avatarSize={70}
                  hover
                />
                <div
                  className="absolute bottom-0 flex h-full w-full items-center justify-center rounded-full bg-black"
                  style={{
                    opacity: isAvatarImageHovered ? "0.5" : "0",
                  }}
                >
                  <Camera className="h-6 w-6" />
                </div>
              </div>
            ) : (
              <Avatar
                avatar={group.avatar}
                icon={<Camera />}
                avatarSize={70}
                hover
              />
            )}
          </label>
          <input
            id="selectFileInput"
            type="file"
            accept=".png, .jpeg, .jpg"
            className="hidden"
            onChange={handleFileChange}
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
        <textarea
          rows={1}
          ref={textareaRef}
          maxLength={200}
          className="resize-none bg-transparent text-sm outline-none"
          value={groupInfo.description}
          placeholder="Description (optional)"
          onChange={(e) => handleTextareaChange(e.target.value)}
        />
      </div>

      <div className="h-2 bg-slate-700" />

      <div className="flex flex-col gap-12 pt-2">
        <div>
          {items.map(({ title, clickEvent, icon, value }) => (
            <Item
              title={title}
              clickEvent={clickEvent}
              icon={icon}
              value={value}
              key={title}
            />
          ))}
        </div>
        <div className="self-end px-3">
          <ModalButton title="Save" />
        </div>
      </div>
    </form>
  );
};

export default ManageGroupModal;
