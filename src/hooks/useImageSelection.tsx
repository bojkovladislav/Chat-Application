import { ChangeEvent, useState } from "react";
import { SetState } from "../../types/PublicTypes";

const useImageSelection = (): [
  { name: string; src: string } | null,
  SetState<{ name: string; src: string } | null>,
  (e: ChangeEvent<HTMLInputElement>) => void,
] => {
  const [selectedImageForAvatar, setSelectedImageForAvatar] = useState<{
    name: string;
    src: string;
  } | null>(null);

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const newImage = e.target.files && e.target.files[0];

    if (!newImage) return null;

    const imageUrl = URL.createObjectURL(newImage);

    setSelectedImageForAvatar({
      name: newImage.name,
      src: imageUrl,
    });
  };

  return [selectedImageForAvatar, setSelectedImageForAvatar, selectFile];
};

export default useImageSelection;
