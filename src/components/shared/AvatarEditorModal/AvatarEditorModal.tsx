import { FC, useRef, useState } from "react";
import { Modal } from "@mantine/core";
import AvatarEditor from "react-avatar-editor";
import { Slider } from "@mantine/core";
import { v4 as uuid } from "uuid";
import { ModalButton } from "../ModalButton";
import { ID, SelectedImage } from "../../../../types/PublicTypes";

interface Props {
  opened: boolean;
  close: () => void;
  handleSubmitAvatar: (newImage: SelectedImage) => void;
  selectedImage: { name: string; src: string } | null;
}

const AvatarEditorModal: FC<Props> = ({
  close,
  opened,
  handleSubmitAvatar,
  selectedImage,
}) => {
  const [zoomValue, setZoomValue] = useState(1);
  // eslint-disable-next-line
  const editor: any = useRef(null);

  const getImageUrl = async () => {
    if (!editor.current) return;

    const dataUrl = editor.current.getImage().toDataURL();
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    if (!selectedImage) return;

    const newImage = {
      src: URL.createObjectURL(blob),
      data: await blob.arrayBuffer(),
      name: selectedImage?.name,
      id: uuid() as ID,
    };

    handleSubmitAvatar(newImage);
    close();
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={close}
      centered
      size="auto"
      trapFocus={false}
      returnFocus={false}
    >
      <Modal.Overlay
        backgroundOpacity={0.3}
        blur={15}
        transitionProps={{
          transition: "fade",
          duration: 300,
          timingFunction: "linear",
        }}
      />
      <Modal.Content>
        {selectedImage && (
          <AvatarEditor
            ref={editor}
            image={selectedImage.src}
            width={300}
            height={300}
            border={50}
            color={[255, 255, 255, 0.6]}
            scale={zoomValue}
            rotate={0}
            borderRadius={200}
          />
        )}
        <div className="flex items-center justify-between px-5 py-2">
          <ModalButton title="Cancel" onClick={close} />
          <div>
            <p>Zoom:</p>
            <Slider
              className="w-40"
              color="blue"
              min={1}
              max={5}
              step={0.1}
              labelTransitionProps={{
                transition: "skew-down",
                duration: 150,
                timingFunction: "linear",
              }}
              value={zoomValue}
              onChange={setZoomValue}
            />
          </div>
          <ModalButton title="Set Photo" onClick={getImageUrl} />
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};

export default AvatarEditorModal;
