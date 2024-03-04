import { FC, FormEvent, useEffect, useRef } from "react";
import { ModalButton } from "../../shared/ModalButton";

interface Props {
  inputError: string;
  roomName: string;
  handleInputChange: (value: string) => void;
  submitNewGroupCreationForm: (e: FormEvent) => void;
}

const NewGroupPreview: FC<Props> = ({
  inputError,
  handleInputChange,
  submitNewGroupCreationForm,
  roomName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form
      className="flex min-w-[300px] flex-col gap-7 px-3"
      onSubmit={submitNewGroupCreationForm}
    >
      <div className="relative">
        <input
          className={`relative w-full rounded-sm bg-slate-700 p-2 outline-none ${
            inputError && "text-red-500"
          }`}
          ref={inputRef}
          type="text"
          placeholder="Enter the name of chat"
          value={roomName}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        {inputError && (
          <p className="absolute top-11 text-sm font-semibold text-red-600">
            {inputError}
          </p>
        )}
      </div>

      <div className="w-fit self-end">
        <ModalButton title="Next" />
      </div>
    </form>
  );
};

export default NewGroupPreview;
