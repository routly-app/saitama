import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { MdClose } from "react-icons/md";

type ModalProps = {
  open: boolean;
  header?: React.ReactNode;
  closeIcon?: React.ElementType;
  onBack?: () => unknown;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Modal({
  open,
  onClose,
  onBack,
  children,
  closeIcon,
  header,
}: React.PropsWithChildren<ModalProps>) {
  const CloseIcon = closeIcon ? closeIcon : MdClose;

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex sm:items-center sm:justify-center">
        <DialogPanel className="relative flex flex-col bg-white  lt-sm:flex-col lt-sm:w-full lt-sm:mt-16 lt-sm:min-h-[37rem] lt-sm:rounded-t-xl sm:max-w-sm sm:w-10/11 sm:min-h-[37rem] sm:rounded-xl dark:bg-dark dark:text-white">
          <div className="flex items-center py-4 sm:px-4">
            <button
              className="p-2 rounded-full dark:bg-dark-200/75"
              onClick={() => (onBack ? onBack() : onClose(false))}
            >
              <CloseIcon className="text-xl md:text-base" />
            </button>
            {header}
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
