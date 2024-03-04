import { FC, useMemo } from "react";
import { USER_STATUS } from "../../../../types/PublicTypes";

interface Props {
  name: string;
  avatar: string;
  status?: USER_STATUS;
  avatarSize?: number;
}

const Avatar: FC<Props> = ({ name, avatar, status, avatarSize }) => {
  const size = useMemo(() => avatarSize || 40, [avatarSize]);

  const handleGetLogo = () => {
    const words = name.split(" ");
    const capitalizeFirstLetter = (word: string) =>
      word.charAt(0).toUpperCase();

    if (words.length >= 2) {
      return words.map(capitalizeFirstLetter).join("").slice(0, 2);
    }

    return capitalizeFirstLetter(name);
  };

  const handleGetStatusColor = () => {
    const ONLINE_COLOR = "bg-green-400";
    const OFFLINE_COLOR = "bg-slate-400";

    switch (status) {
      case USER_STATUS.ONLINE: {
        return ONLINE_COLOR;
      }
      case USER_STATUS.OFFLINE: {
        return OFFLINE_COLOR;
      }
      default: {
        return OFFLINE_COLOR;
      }
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-full text-center font-semibold`}
      style={{
        backgroundColor: avatar || "transparent",
        height: `${size}px`,
        width: `${size}px`,
        fontSize: `${size / 2}px`,
      }}
    >
      {handleGetLogo()}
      {status && (
        <div
          className={`${handleGetStatusColor()} absolute bottom-0 right-0 h-3 w-3 rounded-lg border-2 border-white`}
        />
      )}
    </div>
  );
};

export default Avatar;
