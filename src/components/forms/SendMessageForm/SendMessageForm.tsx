import {
  FC,
  FormEvent,
  useState,
  useRef,
  useEffect,
  KeyboardEventHandler,
  memo,
  ChangeEvent,
  MutableRefObject,
} from "react";
import { CheckLg, EmojiSmile, Image, Send } from "react-bootstrap-icons";
import { socket } from "../../../adapters/socket";
import { User } from "../../../../types/Users";
import { ID, SelectedImage, SetState } from "../../../../types/PublicTypes";
import { Message, Messages, OperatedMessage } from "../../../../types/Messages";
import { PrivateRoom, RoomType } from "../../../../types/Rooms";
import { MessageOperationBar } from "../../core/MessageOperationBar";
import EmojiPicker, { Theme } from "emoji-picker-react";
import useEmojiPickerStore from "../../../store/useEmojiPickerStore";

interface Props {
  setSentMessageId: SetState<ID | null>;
  isMessagesLoading: boolean;
  user: User;
  room: RoomType;
  setMessages: SetState<Messages | null>;
  setImageToEdit: SetState<SelectedImage | null>;
  operatedMessage: OperatedMessage;
  setOperatedMessage: SetState<OperatedMessage>;
  didMessageChange: MutableRefObject<boolean>;
  imageToEdit: SelectedImage | null;
  setSelectedImages: SetState<SelectedImage[]>;
  handleOpenImageInFullScreen: (image: SelectedImage) => void;
  handleImageUpdate: (
    e: ChangeEvent<HTMLInputElement>,
    currentImageId: string,
  ) => Promise<{ currentImageId: string; updatedImage: SelectedImage } | null>;
  selectedImages: SelectedImage[];
  messages: Message[] | null;
}

const SendMessageForm: FC<Props> = memo(
  ({
    user,
    room,
    setMessages,
    handleOpenImageInFullScreen,
    setSentMessageId,
    imageToEdit,
    isMessagesLoading,
    operatedMessage,
    handleImageUpdate,
    setImageToEdit,
    setOperatedMessage,
    didMessageChange,
    selectedImages,
    setSelectedImages,
    messages,
  }) => {
    const [isEmojiClicked, setIsEmojiClicked] = useState(false);
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const { currentEmojiId, openEmojiPicker, closeEmojiPicker } =
      useEmojiPickerStore();

    const getDate = () => {
      const currentDate = new Date(Date.now());

      const padZero = (value: number) =>
        value < 10 ? `0${value}` : `${value}`;

      const hours = padZero(currentDate.getHours());
      const minutes = padZero(currentDate.getMinutes());

      return `${hours}:${minutes}`;
    };

    const handleCloseBar = () => {
      setMessage("");

      setImageToEdit(null);

      didMessageChange.current = false;

      // eslint-disable-next-line
      if (!!selectedImages.length) {
        setSelectedImages([]);
      }

      setOperatedMessage({ message: null, edited: false, replied: false });
    };

    const handleUpdateMessage = (images?: SelectedImage[] | null) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages?.messages.map((msg) => {
          if (
            operatedMessage.message &&
            msg.id === operatedMessage.message.id
          ) {
            return {
              ...msg,
              content: message,
              images: images ? images : operatedMessage.message.images,
            };
          }

          return msg;
        });

        return {
          roomId: room.id,
          messages: updatedMessages || [],
        };
      });
    };

    const handleSetMessage = (newMessage: Message) => {
      setSentMessageId(newMessage.id);

      setMessages((prevMessages) => {
        return {
          roomId: room.id,
          messages: [...(prevMessages?.messages || []), newMessage],
        };
      });

      updateTextareaHeight();
    };

    const handleSendMessage = (e: FormEvent | KeyboardEvent) => {
      e.preventDefault();

      const isPhoto = !!selectedImages.length;

      if (message.trim() === "" && !isPhoto && !didMessageChange.current)
        return;

      if (operatedMessage.edited) {
        const foundMessage =
          messages &&
          messages.find(
            (img) =>
              operatedMessage.message && img.id === operatedMessage.message.id,
          );

        const images =
          foundMessage &&
          foundMessage.images &&
          foundMessage?.images.map((img) => {
            if (
              imageToEdit &&
              img.id === imageToEdit.id &&
              operatedMessage.message?.images
            ) {
              return operatedMessage.message?.images[0];
            }

            return img;
          });

        socket.emit(
          "update_message",
          (room as PrivateRoom).commonId
            ? (room as PrivateRoom).commonId
            : room.id,
          operatedMessage.message?.id,
          {
            content: message,
            images,
          },
        );

        handleUpdateMessage(images);
      } else if (isPhoto) {
        socket.emit(
          "create_message",
          room,
          user,
          message,
          getDate(),
          operatedMessage.replied && {
            author: operatedMessage.message?.authorName,
            message: operatedMessage.message?.content,
            id: operatedMessage.message?.id,
          },
          selectedImages,
        );

        console.log(selectedImages);
      } else if (message) {
        socket.emit(
          "create_message",
          room,
          user,
          message,
          getDate(),
          operatedMessage.replied && {
            author: operatedMessage.message?.authorName,
            message: operatedMessage.message?.content,
            id: operatedMessage.message?.id,
            images: operatedMessage.message?.images,
          },
        );
      }

      handleCloseBar();
    };

    const updateTextareaHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "32px";
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          200,
        )}px`;
      }
    };

    const handleInputChange = (value: string) => {
      setMessage(value);
      updateTextareaHeight();

      if (!operatedMessage.message) {
        socket.emit(
          "typing_trigger",
          user.name,
          (room as PrivateRoom).commonId || room.id,
        );
      }
    };

    const handleType: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
      if (e.key === "Enter" && !e.shiftKey) handleSendMessage(e);
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const updatedContent = await handleImageUpdate(e, "");

      if (updatedContent) {
        setSelectedImages((prevImages) => [
          ...prevImages,
          updatedContent.updatedImage,
        ]);
      }
    };

    useEffect(() => {
      socket.on("send_message", handleSetMessage);
      socket.on("message_created", () => {
        setSentMessageId(null);
      });
      return () => {
        socket.off("message_created");
        socket.off("send_message");
        socket.off("create_message");
        socket.off("typing_trigger");
      };
      // eslint-disable-next-line
    }, []);

    useEffect(() => {
      textareaRef.current && textareaRef.current.focus();

      if (operatedMessage.edited && operatedMessage.message) {
        setMessage(operatedMessage.message.content.trim());
      }

      // eslint-disable-next-line
    }, [operatedMessage.message]);

    return (
      <form
        className="z-10 flex flex-col gap-5 bg-slate-900"
        onSubmit={handleSendMessage}
      >
        {operatedMessage.message && (
          <MessageOperationBar
            handleImageUpdate={handleImageUpdate}
            message={operatedMessage.message}
            setOperatedMessage={setOperatedMessage}
            didMessageChange={didMessageChange}
            operation={operatedMessage.edited ? "edit" : "reply"}
            handleCloseBar={handleCloseBar}
            handleOpenImageInFullScreen={handleOpenImageInFullScreen}
          />
        )}

        <div className="flex w-full items-center gap-5">
          <div className="flex items-center gap-5">
            {!operatedMessage.message && (
              <div>
                <label htmlFor="fileInput">
                  <Image color="#3b82f6" size={20} cursor="pointer" />
                </label>
                {selectedImages.length < 5 && (
                  <input
                    id="fileInput"
                    type="file"
                    accept=".png, .jpeg, .jpg"
                    className="hidden"
                    onChange={async (e) => await handleFileChange(e)}
                  />
                )}
              </div>
            )}

            <EmojiSmile
              color="#3b82f6"
              size={20}
              cursor="pointer"
              onClick={() => {
                setIsEmojiClicked(!isEmojiClicked);
                if (
                  currentEmojiId &&
                  currentEmojiId === "1234-1234-1234-1234-1234"
                ) {
                  closeEmojiPicker();

                  return;
                }

                openEmojiPicker("1234-1234-1234-1234-1234");
              }}
            />
          </div>
          {currentEmojiId === "1234-1234-1234-1234-1234" && (
            <div
              className="bottom absolute z-50"
              style={{
                bottom:
                  !selectedImages.length && !operatedMessage.message
                    ? "4rem"
                    : "8rem",
              }}
            >
              <EmojiPicker
                theme={Theme.DARK}
                lazyLoadEmojis
                onEmojiClick={(emoji) =>
                  setMessage((prevMessage) => `${prevMessage}${emoji.emoji}`)
                }
              />
            </div>
          )}
          <textarea
            className="h-8 w-full resize-none rounded-md border-transparent bg-slate-700 p-1 text-sm outline-none"
            placeholder="Write a message..."
            ref={textareaRef}
            value={message}
            disabled={isMessagesLoading}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleType}
          />
          <button type="submit">
            {operatedMessage.message ? (
              <CheckLg
                color="#3b82f6"
                className="h-[20px] w-[20px]"
                cursor="pointer"
              />
            ) : (
              <Send
                color="#3b82f6"
                className="h-[20px] w-[20px]"
                cursor="pointer"
              />
            )}
          </button>
        </div>
      </form>
    );
  },
);
export default SendMessageForm;
