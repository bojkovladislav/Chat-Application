import { FC } from "react";
import { SettingsItem } from "../../../../types/SettingsItems";
import { Menu as StatusMenu } from "@mantine/core";
import { SetState, USER_STATUS } from "../../../../types/PublicTypes";
import { User } from "../../../../types/Users";
import { socket } from "../../../adapters/socket";

interface Props {
  items: SettingsItem[];
  user: User;
  setUser?: SetState<User | null>;
}

const Item: FC<SettingsItem> = ({ icon, title, value, clickEvent }) => {
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

const SettingsItems: FC<Props> = ({ items, user, setUser }) => {
  return (
    <div>
      {items.map(({ title, clickEvent, icon, value }) =>
        title === "Status" && setUser ? (
          <StatusMenu position="right" withArrow key={title}>
            <StatusMenu.Target>
              <div>
                <Item
                  title={title}
                  clickEvent={clickEvent}
                  icon={icon}
                  value={value}
                />
              </div>
            </StatusMenu.Target>
            <StatusMenu.Dropdown className="bg-slate-800">
              {Object.values(USER_STATUS).map((status) => (
                <StatusMenu.Item
                  color={user.status === status ? "blue" : "white"}
                  onClick={() => {
                    setUser(
                      (prevUserInfo) =>
                        prevUserInfo && { ...prevUserInfo, status },
                    );

                    socket.emit("user_update_field", user.id, "status", status);
                  }}
                >
                  {status}
                </StatusMenu.Item>
              ))}
            </StatusMenu.Dropdown>
          </StatusMenu>
        ) : (
          <Item
            title={title}
            clickEvent={clickEvent}
            icon={icon}
            value={value}
            key={title}
          />
        ),
      )}
    </div>
  );
};

export default SettingsItems;
