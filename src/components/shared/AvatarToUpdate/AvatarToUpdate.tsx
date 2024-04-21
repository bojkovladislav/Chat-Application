import { ChangeEvent, FC, useState } from "react";
import { SelectedImage } from "../../../../types/PublicTypes";
import Avatar from "../Avatar/Avatar";
import { Camera } from "react-bootstrap-icons";
import { v4 as uuid } from "uuid";

interface Props {
  initialAvatar: string;
  selectedAvatar: string | SelectedImage;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  avatarSize?: number;
}

const AvatarToUpdate: FC<Props> = ({
  initialAvatar,
  selectedAvatar,
  handleFileChange,
  avatarSize,
}) => {
  const [isAvatarImageHovered, setIsAvatarImageHovered] = useState(false);
  const inputId = uuid();

  return (
    <>
      <label htmlFor={inputId}>
        {(typeof selectedAvatar === "string" &&
          selectedAvatar.includes("http")) ||
        typeof selectedAvatar !== "string" ? (
          <div
            className="relative h-fit w-fit cursor-pointer"
            onMouseEnter={() => setIsAvatarImageHovered(true)}
            onMouseLeave={() => setIsAvatarImageHovered(false)}
          >
            <Avatar
              avatar={
                typeof selectedAvatar !== "string"
                  ? selectedAvatar.src
                  : selectedAvatar
              }
              avatarSize={avatarSize || 70}
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
            avatar={initialAvatar}
            icon={<Camera />}
            avatarSize={avatarSize || 70}
            hover
          />
        )}
      </label>

      <input
        id={inputId}
        type="file"
        accept=".png, .jpeg, .jpg"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default AvatarToUpdate;
