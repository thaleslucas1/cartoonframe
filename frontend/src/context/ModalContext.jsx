import { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

export const MODALS = {
  NONE: null,
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_CODE: 'reset_code',
  NEW_PASSWORD: 'new_password',
  PROFILE: 'profile',
  ADMIN: 'admin',
};

export function ModalProvider({ children }) {
  const [activeModal, setActiveModal] = useState(MODALS.NONE);

  function openModal(modal) {
    setActiveModal(modal);
  }

  function closeModal() {
    setActiveModal(MODALS.NONE);
  }

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
