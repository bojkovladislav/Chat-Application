import { FC, ReactNode } from "react";
import { Modal as ModalUI } from "@mantine/core";
import { ArrowLeft } from "react-bootstrap-icons";

interface Props {
  children: ReactNode;
  title: string;
  opened: boolean;
  close: () => void;
  subModal?: boolean;
  subModalClose?: () => void;
  isFormSubmitted?: boolean;
}

const Modal: FC<Props> = ({
  children,
  title,
  close,
  opened,
  subModal,
  subModalClose,
  isFormSubmitted,
}) => {
  return (
    <ModalUI.Root
      opened={opened}
      onClose={close}
      centered
      size="auto"
      trapFocus={false}
      returnFocus={false}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          !isFormSubmitted && e.preventDefault();
        }
      }}
    >
      <ModalUI.Overlay
        backgroundOpacity={0.3}
        blur={3}
        transitionProps={{
          transition: "fade",
          duration: 300,
          timingFunction: "linear",
        }}
      />
      <ModalUI.Content>
        <ModalUI.Header className="bg-slate-800">
          <div className="flex gap-3">
            {subModal && (
              <ArrowLeft onClick={subModalClose} className="cursor-pointer" />
            )}
            <ModalUI.Title>{title}</ModalUI.Title>
          </div>
          <ModalUI.CloseButton />
        </ModalUI.Header>
        <ModalUI.Body className="bg-[#0f172a] px-0 pt-3">
          {children}
        </ModalUI.Body>
      </ModalUI.Content>
    </ModalUI.Root>
  );
};

export default Modal;
