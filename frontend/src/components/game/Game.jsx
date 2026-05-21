import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDailyChallenge, submitGuess } from "../../api/challenge";

// todo: sugestões devem vir do backend.
const CARTOON_SUGGESTIONS = [
  "Avatar: A Lenda de Aang",
  "Apenas um Show",
  "As Meninas Superpoderosas",
  "Ben 10",
  "Bob Esponja Calça Quadrada",
  "Caverna do Dragão",
  "Corrida Maluca",
  "Du, Dudu e Edu",
  "O Incrível Mundo de Gumball",
  "Os Simpsons",
  "Hora de Aventura",
  "Tom e Jerry",
  "Pernalonga",
  "Os Flintstones",
  "Looney Tunes",
  "Scooby-Doo",
  "Dragon Ball Z",
  "Pokémon",
  "Naruto",
  "Steven Universo",
  "Rick e Morty",
  "Gravity Falls",
  "Star vs. as Forças do Mal",
  "Kim Possible",
  "Phineas e Ferb",
  "A Família Addams",
  "Batman: A Série Animada",
  "Superman: A Série Animada",
  "Liga da Justiça",
  "X-Men: Evolution",
  "DuckTales",
  "Animaniacs",
  "Pinky e o Cérebro",
  "Hey Arnold!",
  "Rugrats",
  "A Turma da Mônica",
  "Coragem, o Cão Covarde",
  "Laboratório de Dexter",
  "Cavaleiros do Zodíaco",
  "Sailor Moon",
  "Digimon",
  "Yu-Gi-Oh!",
];

const MAX_GUESSES = 5;

function formatDate(dateString) {
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

export default function Game({ externalChallenge }) {
  const { token, sessionId, user, setUser } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [disabled, setDisabled] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (externalChallenge) {
      loadChallenge(externalChallenge);
    } else {
      getDailyChallenge(token, sessionId)
        .then(loadChallenge)
        .catch(() =>
          setMessage({
            text: "Não foi possível carregar o desafio.",
            type: "error",
          }),
        );
    }
  }, [externalChallenge, token]);

  function loadChallenge(c) {
    setChallenge(c);
    setGuesses([]);
    setGuess("");
    setFrameIndex(c.frames.length - 1);
    const done = c.completed || c.remainingGuesses === 0;
    setDisabled(done);
    setMessage(
      done
        ? {
            text: `Desafio encerrado! Resposta: ${c.challengeAnswer}`,
            type: "info",
          }
        : { text: "", type: "info" },
    );
  }

  function handleInputChange(e) {
    const val = e.target.value;
    setGuess(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      CARTOON_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase()),
      ),
    );
  }

  async function handleSubmit() {
    if (!guess.trim()) {
      setMessage({ text: "Digite um palpite!", type: "error" });
      return;
    }
    if (!challenge?.id) {
      setMessage({ text: "Desafio não carregado.", type: "error" });
      return;
    }
    setDisabled(true);
    try {
      const result = await submitGuess(guess, challenge.id, token, sessionId);
      setChallenge((prev) => ({
        ...prev,
        frames: result.frames,
        remainingGuesses: result.remainingGuesses,
      }));
      setFrameIndex(result.frames.length - 1);
      const newGuess = { text: guess, correct: result.isCorrect };
      setGuesses((prev) => [...prev, newGuess]);
      setGuess("");
      setSuggestions([]);

      if (result.isCorrect) {
        setMessage({
          text: `Parabéns! Você acertou: ${result.challengeAnswer}!`,
          type: "success",
        });
        if (user && result.user)
          setUser((u) => ({ ...u, score: result.user.score }));
      } else if (result.remainingGuesses === 0) {
        setMessage({
          text: `Fim do desafio! A resposta era: ${result.challengeAnswer}`,
          type: "info",
        });
      } else {
        setMessage({ text: "Errado! Tente novamente.", type: "error" });
        setDisabled(false);
      }
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
      setDisabled(false);
    }
  }

  const usedGuesses = guesses.length;
  const lastCorrect = guesses.findIndex((g) => g.correct);

  if (!challenge)
    return (
      <div className="game">
        <p style={{ color: "var(--text-muted)", marginTop: 40 }}>
          Carregando desafio...
        </p>
      </div>
    );

  return (
    <div className="game">
      <h2>Adivinhe o Desenho!</h2>
      <p id="challengeDate">Desafio de {formatDate(challenge.date)}</p>

      <div className="image-wrapper">
        <img
          id="imagemDoJogo"
          src={challenge.frames[frameIndex]}
          alt="Frame do desafio"
        />
      </div>

      <div className="frame-navigation">
        {challenge.frames.map((_, i) => (
          <button
            key={i}
            className={frameIndex === i ? "active" : ""}
            onClick={() => setFrameIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={guess}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && !disabled && handleSubmit()}
          placeholder="Pesquise o desenho ou pule"
          list="suggestions"
          disabled={disabled}
        />
        <datalist id="suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <button onClick={handleSubmit} disabled={disabled}>
          Submit
        </button>
      </div>

      <div className="guesses-bar">
        <p id="remainingGuesses">
          {challenge.remainingGuesses} guesses remaining
        </p>
        <div className="guess-dots">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => {
            let cls = "guess-dot";
            if (i < usedGuesses) {
              cls += lastCorrect === i ? " correct" : " used";
            }
            return <div key={i} className={cls} />;
          })}
        </div>
      </div>

      {message.text && (
        <p id="mensagem" className={message.type}>
          {message.text}
        </p>
      )}

      <ul id="listaJogos">
        {guesses.map((g, i) => (
          <li key={i} className={g.correct ? "correct-guess" : ""}>
            <span>{g.text}</span>
            <span
              style={{
                fontSize: "0.75rem",
                color: g.correct ? "var(--success)" : "var(--danger)",
              }}
            >
              {g.correct ? "✓ Correto" : "✗ Errado"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
