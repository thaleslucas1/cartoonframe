import { useState } from "react";
import Modal from "./Modal";
import { useModal, MODALS } from "../../context/ModalContext";
import {
  requestPasswordResetCode,
  confirmPasswordResetCode,
  resetPassword,
} from "../../api/ranking";

let sharedEmail = "";

export function ForgotPasswordModal() {
  const { openModal } = useModal();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await requestPasswordResetCode(email);
      sharedEmail = email;
      setSuccess("Código enviado para seu email!");
      setTimeout(() => openModal(MODALS.RESET_CODE), 1500);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal>
      <h2>Esqueceu a Senha</h2>
      <form onSubmit={handleSubmit}>
        <p>Insira seu email para redefinir a senha.</p>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar Código</button>
        {error && <p className="mensagem erro">{error}</p>}
        {success && <p className="mensagem sucesso">{success}</p>}
      </form>
      <button className="link-button" onClick={() => openModal(MODALS.LOGIN)}>
        Voltar ao Login
      </button>
    </Modal>
  );
}

export function ResetCodeModal() {
  const { openModal } = useModal();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await confirmPasswordResetCode(sharedEmail, code);
      setSuccess("Código confirmado!");
      setTimeout(() => openModal(MODALS.NEW_PASSWORD), 1500);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal>
      <h2>Confirmar Código</h2>
      <form onSubmit={handleSubmit}>
        <p>Um código foi enviado para o seu email.</p>
        <label>Código:</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Confirmar</button>
        {error && <p className="mensagem erro">{error}</p>}
        {success && <p className="mensagem sucesso">{success}</p>}
      </form>
      <button
        className="link-button"
        onClick={() => openModal(MODALS.FORGOT_PASSWORD)}
      >
        Voltar
      </button>
    </Modal>
  );
}

export function NewPasswordModal() {
  const { openModal } = useModal();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    try {
      await resetPassword(sharedEmail, newPassword);
      setSuccess("Senha redefinida! Redirecionando...");
      sharedEmail = "";
      setTimeout(() => openModal(MODALS.LOGIN), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal>
      <h2>Nova Senha</h2>
      <form onSubmit={handleSubmit}>
        <label>Nova Senha:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <label>Confirmar Senha:</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit">Salvar</button>
        {error && <p className="mensagem erro">{error}</p>}
        {success && <p className="mensagem sucesso">{success}</p>}
      </form>
    </Modal>
  );
}
