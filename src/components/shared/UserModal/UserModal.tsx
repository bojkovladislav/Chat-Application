import { FC } from "react";
import { Modal } from "../Modal";
import { UserInfo } from "../../core/UserInfo";
import { User } from "../../../../types/Users";
import { PrivateRoom } from "../../../../types/Rooms";

interface Props {
  opened: boolean;
  close: () => void;
  user: User;
  currentUser: PrivateRoom | null;
  handleSendDirectMessage: (member: PrivateRoom) => void;
}

const UserModal: FC<Props> = ({
  opened,
  close,
  user,
  currentUser,
  handleSendDirectMessage,
}) => {
  return (
    <Modal title="User Modal" opened={opened} close={close}>
      <UserInfo
        user={user}
        currentUser={currentUser}
        handleSendDirectMessage={handleSendDirectMessage}
      />
    </Modal>
  );
};

export default UserModal;
