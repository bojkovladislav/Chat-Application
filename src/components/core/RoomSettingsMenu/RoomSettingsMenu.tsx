import { MenuList } from "../../../../types/Menu";
import useDisclosureStore from "../../../store/useRoomDisclosureStore";
import {
  Trash,
  InfoCircle,
  Sliders,
  ThreeDotsVertical,
} from "react-bootstrap-icons";
import { Menu } from "../../shared/Menu";
import { FC } from "react";

interface Props {
  roomType: "private-room" | "group";
}

const RoomSettingsMenu: FC<Props> = ({ roomType }) => {
  const { openDiscloSure: openDeleteRoomModal } =
    useDisclosureStore().deleteRoomItem;
  const { openDiscloSure: openRoomInfoModal } =
    useDisclosureStore().roomInfoItem;
  const { openDiscloSure: openManageRoomModal } =
    useDisclosureStore().manageRoomItem;

  const uniqueMenuItemsForGroup = [
    {
      name: "Manage group",
      icon: <Sliders />,
      handleClick: openManageRoomModal,
    },
  ];

  const menuList: MenuList = [
    {
      name: "Main",
      items: [
        {
          name: "View room info",
          icon: <InfoCircle />,
          handleClick: openRoomInfoModal,
        },
        ...(roomType === "group" ? [...uniqueMenuItemsForGroup] : []),
      ],
    },
    {
      name: "Additional",
      items: [
        {
          name: "Delete and leave",
          icon: <Trash />,
          color: "red",
          handleClick: openDeleteRoomModal,
        },
      ],
    },
  ];

  return (
    <Menu menuList={menuList}>
      <ThreeDotsVertical className="h-5 w-5 cursor-pointer" />
    </Menu>
  );
};

export default RoomSettingsMenu;
