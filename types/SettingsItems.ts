import { ReactNode } from "react";

export interface SettingsItem {
  icon: ReactNode;
  title: string;
  value: string;
  clickEvent: () => void;
}
