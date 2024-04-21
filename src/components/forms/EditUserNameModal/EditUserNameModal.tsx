import { FC, FormEvent, useEffect, useRef } from "react";
import { Input } from "@mantine/core";
import { ModalButton } from "../../shared/ModalButton";

interface Props {
  handleSaveNewName: (e: FormEvent) => void;
  handleEditName: (value: string) => void;
  value: string;
}

const EditUserNameModal: FC<Props> = ({
  handleSaveNewName,
  handleEditName,
  value,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSaveNewName} className="flex flex-col gap-10 px-3">
      <Input
        ref={inputRef}
        onChange={(e) => handleEditName(e.target.value)}
        value={value}
      />

      <div className="self-end">
        <ModalButton title="Save" />
      </div>
    </form>
  );
};

export default EditUserNameModal;
