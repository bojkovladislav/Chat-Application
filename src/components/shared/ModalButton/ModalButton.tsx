import { FC } from "react";

interface Props {
  danger?: boolean;
  title: string;
  onClick?: () => void;
}

const ModalButton: FC<Props> = ({ danger, title, onClick }) => {
  return (
    <button
      type="submit"
      className={`rounded-md border-2 border-transparent px-2 py-1 font-bold transition-all duration-300 ${
        danger ? "modal_button-danger" : "modal_button"
      }`}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default ModalButton;
