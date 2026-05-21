import { useModal, MODALS } from '../../context/ModalContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { ForgotPasswordModal, ResetCodeModal, NewPasswordModal } from './PasswordResetModals';
import ProfileModal from './ProfileModal';
import AdminModal from './AdminModal';

export default function ModalManager({ onViewChallenge }) {
  const { activeModal } = useModal();

  return (
    <>
      {activeModal === MODALS.LOGIN && <LoginModal />}
      {activeModal === MODALS.REGISTER && <RegisterModal />}
      {activeModal === MODALS.FORGOT_PASSWORD && <ForgotPasswordModal />}
      {activeModal === MODALS.RESET_CODE && <ResetCodeModal />}
      {activeModal === MODALS.NEW_PASSWORD && <NewPasswordModal />}
      {activeModal === MODALS.PROFILE && <ProfileModal onViewChallenge={onViewChallenge} />}
      {activeModal === MODALS.ADMIN && <AdminModal />}
    </>
  );
}
