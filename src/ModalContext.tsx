import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal } from "./components/Modal";

interface ModalContextType {
  showModal: (title: string, message: string) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

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
