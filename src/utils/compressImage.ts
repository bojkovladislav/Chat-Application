import { compress, EImageType } from "image-conversion";

export const compressImage = async (blobbedImage: Blob) => {
  const compressedImageBlob = await compress(blobbedImage, {
    quality: 0.1,
    type: EImageType.JPEG,
  });

  return await compressedImageBlob.arrayBuffer();
};
