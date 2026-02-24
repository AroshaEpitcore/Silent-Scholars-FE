import React, { useEffect, useState } from "react";
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import "./leaderboard.css";

const MEDALS = ["🥇", "🥈", "🥉"];
const ROW_CLS = ["lb-row--top1", "lb-row--top2", "lb-row--top3"];
const RANK_CLS = ["lb-rank-num--1", "lb-rank-num--2", "lb-rank-num--3"];

export default function LeaderBoard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const list = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.name && u.score != null)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        setPlayers(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top3 = players.slice(0, 3);

  return (
    <div className="lb-page">
      <div className="lb-container">

        {/* ── Header ── */}
        <div className="lb-header">
          <div className="lb-header-icon">🏆</div>
          <div className="lb-header-info">
            <h1>Leaderboard</h1>
            <p>Top players ranked by static sign game score</p>
          </div>
          {!loading && (
            <div className="lb-count-badge">{players.length} Players</div>
          )}
        </div>

        {/* ── Podium (top 3) ── */}
        {!loading && top3.length >= 3 && (
          <div className="lb-podium">
            {/* 2nd place */}
            <div className="lb-podium-card lb-podium-card--2nd">
              <div className="lb-podium-medal">{MEDALS[1]}</div>
              <div className="lb-podium-rank">2nd Place</div>
              <div className="lb-podium-name">{top3[1].name}</div>
              <div className="lb-podium-score">{top3[1].score ?? 0}</div>
              <div className="lb-podium-pts">pts</div>
            </div>

            {/* 1st place */}
            <div className="lb-podium-card lb-podium-card--1st">
              <div className="lb-podium-medal">{MEDALS[0]}</div>
              <div className="lb-podium-rank">1st Place</div>
              <div className="lb-podium-name">{top3[0].name}</div>
              <div className="lb-podium-score">{top3[0].score ?? 0}</div>
              <div className="lb-podium-pts">pts</div>
            </div>

            {/* 3rd place */}
            <div className="lb-podium-card lb-podium-card--3rd">
              <div className="lb-podium-medal">{MEDALS[2]}</div>
              <div className="lb-podium-rank">3rd Place</div>
              <div className="lb-podium-name">{top3[2].name}</div>
              <div className="lb-podium-score">{top3[2].score ?? 0}</div>
              <div className="lb-podium-pts">pts</div>
            </div>
          </div>
        )}

        {/* ── Full rankings table ── */}
        <div className="lb-card">
          <div className="lb-card-header">
            <span>All Rankings</span>
            {!loading && <span style={{ opacity: 0.75, fontWeight: 500 }}>Sorted by score</span>}
          </div>

          {loading && (
            <div className="lb-state">
              <div className="lb-state-icon">⏳</div>
              <p>Loading rankings…</p>
            </div>
          )}

          {!loading && players.length === 0 && (
            <div className="lb-state">
              <div className="lb-state-icon">📋</div>
              <p>No scores recorded yet. Play the game to appear here!</p>
            </div>
          )}

          {!loading && players.length > 0 && (
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => (
                  <tr
                    key={player.id}
                    className={idx < 3 ? ROW_CLS[idx] : ""}
                  >
                    {/* Rank */}
                    <td>
                      <div className="lb-rank-cell">
                        <div className={`lb-rank-num ${idx < 3 ? RANK_CLS[idx] : ""}`}>
                          {idx + 1}
                        </div>
                        {idx < 3 && (
                          <span className="lb-medal">{MEDALS[idx]}</span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td>
                      <span className="lb-player-name">{player.name}</span>
                    </td>

                    {/* Score */}
                    <td>
                      <div className="lb-score-cell">
                        <span className="lb-score-val">{player.score ?? 0}</span>
                        <span className="lb-score-pts">pts</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
