import {
  FC,
  FormEvent,
  useState,
  useRef,
  useEffect,
  KeyboardEventHandler,
  memo,
} from "react";
import { EmojiSmile, Send } from "react-bootstrap-icons";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { socket } from "../../../adapters/socket";
import { User } from "../../../../types/Users";
import { ID, SetState } from "../../../../types/PublicTypes";
import { Message, Messages, OperatedMessage } from "../../../../types/Messages";
import { PrivateRoom, RoomType } from "../../../../types/Rooms";
import { MessageOperationBar } from "../../core/MessageOperationBar";

interface Props {
  setSentMessageId: SetState<ID | null>;
  isMessagesLoading: boolean;
  user: User;
  room: RoomType;
  setMessages: SetState<Messages | null>;
  operatedMessage: OperatedMessage;
  setOperatedMessage: SetState<OperatedMessage>;
}

const SendMessageForm: FC<Props> = memo(
  ({
    user,
    room,
    setMessages,
    setSentMessageId,
    isMessagesLoading,
    operatedMessage,
    setOperatedMessage,
  }) => {
    const [isEmojiClicked, setIsEmojiClicked] = useState(false);
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

      setOperatedMessage({ message: null, edited: false, replied: false });
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

      if (message === "") return;

      setMessage("");

      handleCloseBar();

      if (!operatedMessage.edited) {
        socket.emit(
          "create_message",
          room,
          user,
          message,
          getDate(),
          operatedMessage.replied && {
            author: operatedMessage.message?.authorName,
            message: operatedMessage.message?.content,
          },
        );
      } else {
        socket.emit(
          "update_message",
          (room as PrivateRoom).commonId
            ? (room as PrivateRoom).commonId
            : room.id,
          operatedMessage.message?.id,
          message,
        );

        setMessages((prevMessages) => {
          const updatedMessages = prevMessages?.messages.map((msg) => {
            if (
              operatedMessage.message &&
              msg.id === operatedMessage.message.id
            ) {
              return {
                ...msg,
                content: message,
              };
            }

            return msg;
          });

          return {
            roomId: room.id,
            messages: updatedMessages || [],
          };
        });
      }
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
        className="z-10 flex flex-col gap-5 border-t border-slate-600 bg-slate-900 px-5 py-3"
        onSubmit={handleSendMessage}
      >
        {operatedMessage.message && (
          <MessageOperationBar
            message={operatedMessage.message}
            operation={operatedMessage.edited ? "edit" : "reply"}
            handleCloseBar={handleCloseBar}
          />
        )}

        <div className="flex w-full items-center gap-5">
          <EmojiSmile
            color="#3b82f6"
            size={20}
            cursor="pointer"
            onClick={() => setIsEmojiClicked(!isEmojiClicked)}
          />
          {isEmojiClicked && (
            <div className="absolute bottom-16">
              <EmojiPicker
                theme={Theme.DARK}
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
            <Send color="#3b82f6" size={20} cursor="pointer" />
          </button>
        </div>
      </form>
    );
  },
);
export default SendMessageForm;
