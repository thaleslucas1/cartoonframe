import { useEffect, useState } from 'react';
import { getWeeklyRanking } from '../../api/ranking';

export default function RankingSidebar() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    getWeeklyRanking().then(setRanking).catch(() => setRanking([]));
  }, []);

  return (
    <aside className="ranking-sidebar">
      <h2>Ranking Semanal</h2>
      <ul>
        {ranking.length === 0 && (
          <li style={{ color: 'var(--text-muted)', justifyContent: 'center' }}>Sem dados</li>
        )}
        {ranking.map((entry, i) => (
          <li key={entry.nickname}>
            <span>{i + 1}. {entry.nickname}</span>
            <span className="pts">{entry.points} pts</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
