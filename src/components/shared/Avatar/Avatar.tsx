import { FC, ReactNode, useMemo } from "react";
import { USER_STATUS } from "../../../../types/PublicTypes";

interface Props {
  name?: string;
  avatar: string;
  status?: USER_STATUS;
  avatarSize?: number;
  icon?: ReactNode;
  hover?: boolean;
}

const Avatar: FC<Props> = ({
  name,
  avatar,
  status,
  avatarSize,
  icon,
  hover,
}) => {
  const size = useMemo(() => avatarSize || 40, [avatarSize]);

  const handleGetLogo = () => {
    if (!name) return;

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
    <>
      {avatar.includes("http") ? (
        <img
          src={avatar}
          alt="Avatar"
          className="rounded-full"
          style={{
            height: `${size}px`,
            width: `${size}px`,
          }}
        />
      ) : (
        <div
          className={`relative flex items-center justify-center rounded-full text-center font-semibold ${
            hover && "cursor-pointer opacity-70 hover:opacity-100"
          }`}
          style={{
            backgroundColor: avatar || "transparent",
            height: `${size}px`,
            width: `${size}px`,
            fontSize: `${size / 2}px`,
          }}
        >
          {icon ? icon : handleGetLogo()}
          {status && (
            <div
              className={`${handleGetStatusColor()} absolute bottom-0 right-0 h-3 w-3 rounded-lg border-2 border-white`}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Avatar;
