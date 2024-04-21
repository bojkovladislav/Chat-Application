import { FC, RefObject } from "react";

interface Props {
  placeholder: string;
  value: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
  handleTextareaChange: (value: string) => void;
  maxLength?: number;
}

const DescriptionInput: FC<Props> = ({
  placeholder,
  value,
  textareaRef,
  handleTextareaChange,
  maxLength,
}) => {
  return (
    <textarea
      rows={1}
      ref={textareaRef}
      maxLength={maxLength || 200}
      className="w-full resize-none bg-transparent text-sm outline-none"
      value={value}
      placeholder={placeholder}
      onChange={(e) => handleTextareaChange(e.target.value)}
    />
  );
};

export default DescriptionInput;
