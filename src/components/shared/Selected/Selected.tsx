import { ReactNode, FC } from "react";
import { Check } from "react-bootstrap-icons";

interface Props {
  children: ReactNode;
  selected: boolean;
  avatarSize?: number;
}

const Selected: FC<Props> = ({ children, selected, avatarSize }) => {
  return (
    <div
      className="relative h-fit w-fit"
      style={{
        border: `2px solid ${selected ? "#fff" : "transparent"}`,
        borderRadius: "50%",
        transition: "border-color 0.3s ease",
        minWidth: `${avatarSize ? avatarSize : "43"}px`
      }}
    >
      {children}

      <Check
        className="absolute bottom-0 right-[-5px] rounded-full border-2 border-white bg-blue-500 transition-opacity duration-150"
        style={{
          opacity: selected ? 1 : 0,
        }}
      />
    </div>
  );
};

export default Selected;
