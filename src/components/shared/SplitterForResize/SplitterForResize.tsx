import { useState } from "react";

const SplitterForResize = ({
  id = "drag-bar",
  dir,
  isDragging,
  ...props
  // eslint-disable-next-line
}: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      id={id}
      data-testid={id}
      tabIndex={0}
      style={{
        backgroundColor: (isDragging || isFocused) && "#3b82f6",
        width: (isDragging || isFocused) && "12px",
      }}
      className={`w-[2px] cursor-col-resize bg-slate-600 transition-all hover:w-3 ${
        dir === "horizonal" && "h-5 w-full cursor-row-resize"
      }`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
};

export default SplitterForResize;
