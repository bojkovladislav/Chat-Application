import { ChangeEvent, FC, useState } from "react";
import { Repeat, X } from "react-bootstrap-icons";
import { useMediaQuery } from "@mantine/hooks";
import {
  SelectedImage as SelectedImageType,
  SetState,
} from "../../../../types/PublicTypes";
import { Image } from "../Image";

interface Props {
  image: SelectedImageType;
  setSelectedImages: SetState<SelectedImageType[]>;
  handleSelectedImageClick: (selectedImage: SelectedImageType) => void;
  handleImageUpdate: (
    e: ChangeEvent<HTMLInputElement>,
    currentImageId: string,
  ) => Promise<{
    currentImageId: string;
    updatedImage: SelectedImageType;
  } | null>;
}

const SelectedImage: FC<Props> = ({
  image,
  setSelectedImages,
  handleSelectedImageClick,
  handleImageUpdate,
}) => {
  const matches = useMediaQuery("(max-width: 765px)");
  const [isHovered, setIsHovered] = useState(false);

  const handleRemoveImage = (currentImage: string) => {
    setSelectedImages(
      (prevImages) =>
        prevImages &&
        prevImages?.filter((prevImage) => prevImage.src !== currentImage),
    );
  };

  return (
    <div
      className="relative cursor-pointer "
      onMouseLeave={() => setIsHovered(false)}
      onMouseOver={() => setIsHovered(true)}
    >
      <div style={{ opacity: isHovered && !matches ? 0.5 : 1 }}>
        <Image
          handleSelectedImageClick={handleSelectedImageClick}
          image={image}
        />
      </div>

      <div>
        <label htmlFor={`fileInput-${image.id}`} className="cursor-pointer">
          <Repeat
            className="absolute left-[-10px] top-[-10px] rounded-full border-[1px] p-[3px] transition-all duration-300 hover:bg-green-700"
            size={23}
            style={{
              opacity: isHovered || matches ? 1 : 0,
              pointerEvents: isHovered || matches ? "all" : "none",
              backgroundColor: matches ? "#15803d" : "",
            }}
          />
        </label>

        <input
          id={`fileInput-${image.id}`}
          type="file"
          accept=".png, .jpeg, .jpg"
          className="hidden"
          onChange={async (e) => {
            const updatedInfo = await handleImageUpdate(e, image.id);

            setSelectedImages((prevImages) =>
              prevImages.map((prevImg) => {
                if (prevImg.id === updatedInfo?.currentImageId) {
                  return updatedInfo.updatedImage;
                }

                return prevImg;
              }),
            );
          }}
        />
      </div>

      <X
        className="absolute right-[-10px] top-[-10px] rounded-full border-[1px] p-[1px] transition-all duration-300 hover:bg-red-700"
        size={23}
        style={{
          opacity: isHovered || matches ? 1 : 0,
          pointerEvents: isHovered || matches ? "all" : "none",
          backgroundColor: matches ? "#b91c1c" : "",
        }}
        onClick={() => handleRemoveImage(image.src)}
      />
    </div>
  );
};

export default SelectedImage;
