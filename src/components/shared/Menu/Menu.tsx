import { Menu as MenuUI } from "@mantine/core";
import React, { FC, ReactNode } from "react";
import { MenuList } from "../../../../types/Menu";

interface Props {
  children: ReactNode;
  menuList: MenuList;
}

const Menu: FC<Props> = ({ children: TargetButton, menuList }) => {
  return (
    <MenuUI shadow="md" width={170} position="bottom-end">
      <MenuUI.Target>{TargetButton}</MenuUI.Target>

      <MenuUI.Dropdown className="bg-[#0f174a]">
        {menuList.map((label, index) => (
          <React.Fragment key={label.name}>
            <MenuUI.Label className="text-slate-400">{label.name}</MenuUI.Label>

            {label.items.map((item) => (
              <MenuUI.Item
                key={item.name}
                color={item.color}
                leftSection={item.icon}
                className="hover:bg-[#69696940]"
                onClick={item.handleClick}
              >
                {item.name}
              </MenuUI.Item>
            ))}
            {index < menuList.length - 1 && <MenuUI.Divider />}
          </React.Fragment>
        ))}
      </MenuUI.Dropdown>
    </MenuUI>
  );
};

export default Menu;
