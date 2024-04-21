import { RefObject, useRef, useState } from "react";

const useTextAreaAdjustment = (
  initialDescription: string | null,
): [
  description: string,
  handleTextareaChange: (value: string) => void,
  textareaRef: RefObject<HTMLTextAreaElement>,
] => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [description, setDescription] = useState(initialDescription || "");

  const updateTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "20px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200,
      )}px`;
    }
  };

  const handleTextareaChange = (value: string) => {
    updateTextareaHeight();
    setDescription(value);
  };

  return [description, handleTextareaChange, textareaRef];
};

export default useTextAreaAdjustment;
