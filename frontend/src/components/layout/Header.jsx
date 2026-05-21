import { useAuth } from '../../context/AuthContext';
import { useModal, MODALS } from '../../context/ModalContext';

export default function Header() {
  const { user } = useAuth();
  const { openModal } = useModal();

  return (
    <header className="main-header">
      <h1>Cartoonframe</h1>
      <div className="user-profile">
        {user ? (
          <>
            <span>{user.name || user.nickname || user.email}</span>
            <button onClick={() => openModal(MODALS.PROFILE)}>Perfil</button>
            {user.role === 'ADMIN' && (
              <button onClick={() => openModal(MODALS.ADMIN)}>Admin</button>
            )}
          </>
        ) : (
          <button onClick={() => openModal(MODALS.LOGIN)}>Login</button>
        )}
      </div>
    </header>
  );
}
