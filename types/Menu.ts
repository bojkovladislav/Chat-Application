import { MenuItemProps } from '@mantine/core';
import { ReactNode } from 'react';

interface MenuItem {
  name: string;
  icon?: ReactNode;
  color?: MenuItemProps['color'];
  handleClick: () => void; 
}

interface Label {
  name: string;
  items: MenuItem[];
}

export type MenuList = Label[];
