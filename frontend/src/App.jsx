import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import Header from './components/layout/Header';
import RankingSidebar from './components/layout/RankingSidebar';
import Game from './components/game/Game';
import ModalManager from './components/modals/ModalManager';
import './App.css';

export default function App() {
  const [externalChallenge, setExternalChallenge] = useState(null);

  return (
    <AuthProvider>
      <ModalProvider>
        <Header />
        <div className="container">
          <RankingSidebar />
          <Game externalChallenge={externalChallenge} />
        </div>
        <ModalManager onViewChallenge={setExternalChallenge} />
      </ModalProvider>
    </AuthProvider>
  );
}
