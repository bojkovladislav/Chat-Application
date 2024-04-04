import { FC } from "react";
import { Reaction } from "../../../../types/Messages";
import { v4 as uuid } from "uuid";
import { ID } from "../../../../types/PublicTypes";

interface Props {
  reactions: Reaction[];
  reactionsToShow: Reaction[];
  isMyMessage: boolean;
  isGroup: boolean;
  isPrivateRoom: boolean;
  userId: ID;
  currentRoomId: ID;
  handleReactionClick: (
    reaction: Reaction,
    currentRoomType: "private-room" | "group",
    currentRoomId: ID,
  ) => void;
}

const Reactions: FC<Props> = ({
  reactions,
  isMyMessage,
  isGroup,
  isPrivateRoom,
  userId,
  reactionsToShow,
  currentRoomId,
  handleReactionClick,
}) => {
  return (
    <div
      className="flex gap-3"
      style={{
        alignSelf: isMyMessage ? "start" : "end",
      }}
    >
      {reactionsToShow.map((reaction) => {
        const { reaction: actualReaction, id } = reaction;
        const quantity = reactions.filter(
          (r) => r.reaction === actualReaction,
        ).length;

        const showQuantity =
          (quantity && isGroup) || (isPrivateRoom && quantity && quantity > 1);

        const isReactionSelected = reactions.some(
          (reaction) =>
            reaction.authorId === userId &&
            reaction.reaction === actualReaction,
        );

        return (
          <div
            key={id}
            className="flex cursor-pointer gap-1 rounded-md"
            style={{
              border: isGroup
                ? `1px solid ${isMyMessage ? "#64748b" : "#adcdf0"}`
                : "none",
              padding: isGroup ? "2px" : "0",
              backgroundColor:
                isReactionSelected && isGroup
                  ? isMyMessage
                    ? "#adcdf0"
                    : "#3b82f64D"
                  : "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();

              if (isGroup || (isPrivateRoom && reaction.authorId === userId)) {
                handleReactionClick(
                  {
                    ...reaction,
                    id: uuid() as ID,
                    authorId: userId,
                  },
                  isPrivateRoom ? "private-room" : "group",
                  currentRoomId,
                );
              }
            }}
          >
            <p>{actualReaction}</p>
            {showQuantity && (
              <p
                style={{
                  color: isReactionSelected
                    ? !isMyMessage
                      ? "#adcdf0"
                      : "blue"
                    : "#fff",
                }}
              >
                {quantity}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Reactions;
