import { useState, type ReactNode } from "react";
import { Modal } from "./components/Modal";
import { ModalContext } from "./hooks/useModal";

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const showModal = (modalTitle: string, modalMessage: string) => {
    setTitle(modalTitle);
    setMessage(modalMessage);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal isOpen={isOpen} onClose={hideModal} title={title}>
        <p>{message}</p>
      </Modal>
    </ModalContext.Provider>
  );
};
