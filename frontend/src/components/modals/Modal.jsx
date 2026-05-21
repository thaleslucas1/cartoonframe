import { useModal } from '../../context/ModalContext';

export default function Modal({ children }) {
  const { closeModal } = useModal();

  return (
    <div className="modal" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={closeModal}>&times;</span>
        {children}
      </div>
    </div>
  );
}
