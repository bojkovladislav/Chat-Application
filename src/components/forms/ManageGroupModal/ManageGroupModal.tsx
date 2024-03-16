import { FC, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { GroupInfo } from "../../../../types/GroupInfo";
import { Group } from "../../../../types/Rooms";
import { Avatar } from "../../shared/Avatar";
import { People, Sliders, Star } from "react-bootstrap-icons";
import { ModalButton } from "../../shared/ModalButton";
import { socket } from "../../../adapters/socket";
import { User } from "../../../../types/Users";

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
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      group.isPublic !== groupInfo.isPublic
    ) {
      const originalGroupCred = {
        name: group.name,
        description: group.description,
        isPublic: group.isPublic,
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

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex flex-col gap-5 px-3 pb-4">
        <div className="flex gap-5">
          <Avatar avatar={group.avatar} name={group.name} avatarSize={60} />
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
