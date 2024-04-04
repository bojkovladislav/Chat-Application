import { ChangeEvent, FC, MutableRefObject, useState } from "react";
import { PencilFill, Repeat, ReplyFill, X } from "react-bootstrap-icons";
import { Message, OperatedMessage } from "../../../../types/Messages";
import { normalizeTextLength } from "../../../utils/normalizeTextLength";
import { Image } from "../../shared/Image";
import { SelectedImage, SetState } from "../../../../types/PublicTypes";

interface Props {
  operation: "edit" | "reply";
  handleCloseBar: () => void;
  setOperatedMessage: SetState<OperatedMessage>;
  message: Message;
  didMessageChange: MutableRefObject<boolean>;
  handleOpenImageInFullScreen: (image: SelectedImage) => void;
  handleImageUpdate: (
    e: ChangeEvent<HTMLInputElement>,
    currentImageId: string,
  ) => Promise<{ currentImageId: string; updatedImage: SelectedImage } | null>;
}

const MessageOperationBar: FC<Props> = ({
  operation,
  handleCloseBar,
  message,
  handleOpenImageInFullScreen,
  handleImageUpdate,
  didMessageChange,
  setOperatedMessage,
}) => {
  const content = message.images
    ? "Photo"
    : normalizeTextLength(message.content, 90);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  return (
    <div className="flex max-h-20 items-center justify-between bg-transparent">
      <div className="flex items-center gap-5">
        {operation === "edit" ? (
          <PencilFill className="text-blue-500" />
        ) : (
          <ReplyFill className="text-blue-500" />
        )}

        {message &&
          message.images &&
          message.images.map((image) => (
            <div
              key={image.id}
              onMouseOver={() =>
                operation === "edit" && setHoveredImageId(image.id)
              }
              onMouseLeave={() => setHoveredImageId(null)}
              onClick={() =>
                operation === "reply" && handleOpenImageInFullScreen(image)
              }
              className="relative"
            >
              <label
                htmlFor={`fileInput-${image.id}`}
                className="cursor-pointer"
              >
                <div
                  className="duration-300"
                  style={{
                    opacity: hoveredImageId === image.id ? 0.5 : 1,
                  }}
                >
                  <Image image={image} size={40} />
                </div>
                <Repeat
                  className="absolute left-[50%] top-[50%] h-[20px] w-[20px] translate-x-[-50%] translate-y-[-50%] transform duration-300"
                  style={{
                    opacity: hoveredImageId === image.id ? 1 : 0,
                  }}
                />
              </label>
              {operation === "edit" && (
                <input
                  id={`fileInput-${image.id}`}
                  type="file"
                  accept=".png, .jpeg, .jpg"
                  className="hidden"
                  onChange={async (e) => {
                    didMessageChange.current = true;

                    const updatedInfo = await handleImageUpdate(e, image.id);

                    if (updatedInfo) {
                      setOperatedMessage((prevMessage) => {
                        const updatedImages = (
                          prevMessage.message?.images || []
                        ).map((img) =>
                          img.id === updatedInfo.currentImageId
                            ? updatedInfo.updatedImage
                            : img,
                        );

                        return {
                          ...prevMessage,
                          message: prevMessage.message
                            ? {
                                ...prevMessage.message,
                                images: updatedImages,
                              }
                            : null,
                        };
                      });
                    }
                  }}
                />
              )}
            </div>
          ))}

        <div>
          <h2 className="text-blue-500">
            {operation === "edit"
              ? "Edit message"
              : `Reply to ${message.authorName}`}
          </h2>
          <p className="text-sm">{content}</p>
        </div>
      </div>

      <X
        onClick={handleCloseBar}
        className="cursor-pointer text-gray-400 transition-colors duration-300 hover:text-blue-500"
        size={25}
      />
    </div>
  );
};

export default MessageOperationBar;
