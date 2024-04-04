import { FC } from "react";
import { SelectedImage } from "../../../../types/PublicTypes";

interface Props {
  image: SelectedImage;
  handleSelectedImageClick?: (image: SelectedImage) => void;
  size?: number;
}

const Image: FC<Props> = ({ image, handleSelectedImageClick, size }) => {
  return (
    <img
      src={image.src}
      key={image.id}
      className="rounded-md border-[1px] transition-all duration-300"
      style={{
        height: size ? `${size}px` : "60px",
        width: size ? `${size}px` : "60px",
      }}
      onClick={() =>
        handleSelectedImageClick ? handleSelectedImageClick(image) : () => {}
      }
    />
  );
};

export default Image;
