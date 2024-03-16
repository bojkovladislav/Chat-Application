import { FC, useEffect } from "react";
import { PrivateRooms } from "../../../../types/Rooms";
import { ModalButton } from "../../shared/ModalButton";
import { Members } from "../../shared/Members";

interface Props {
  administrators: PrivateRooms;
  isCurrentUserAdmin: boolean;
  handleFetchMembers: () => void;
}

const AdministratorsModal: FC<Props> = ({
  administrators,
  isCurrentUserAdmin,
  handleFetchMembers,
}) => {
  useEffect(() => {
    handleFetchMembers();
    // eslint-disable-next-line
  }, []);

  return (
    <form
      className="flex min-h-[300px] min-w-[300px] flex-col justify-between"
      onSubmit={(e) => e.preventDefault()}
    >
      <Members
        members={administrators}
        loading={false}
        skeletonMembers={[]}
        handleMemberClick={() => {}}
      />
      <div className="flex justify-between px-3">
        {isCurrentUserAdmin && <ModalButton title="Add Administrators" />}
        <ModalButton title="Close" />
      </div>
    </form>
  );
};

export default AdministratorsModal;
