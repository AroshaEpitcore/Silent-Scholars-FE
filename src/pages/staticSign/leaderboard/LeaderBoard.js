import React, { useEffect, useState } from "react";
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import '../static-signs.css';

export default function LeaderBoard() {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboardCollection = collection(db, 'users');
      const leaderboardSnapshot = await getDocs(leaderboardCollection);
      const leaderboardList = leaderboardSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaderboardData(leaderboardList);
    };
    fetchLeaderboard();
  }, []);

  const sorted = [...leaderboardData].sort((a, b) => (b.score || 0) - (a.score || 0));

  const rankClass = (i) => {
    if (i === 0) return 'ss-rank-badge ss-rank-1';
    if (i === 1) return 'ss-rank-badge ss-rank-2';
    if (i === 2) return 'ss-rank-badge ss-rank-3';
    return 'ss-rank-badge ss-rank-other';
  };

  return (
    <div className="ss-page">
      <div className="ss-container">

        {/* Hero header */}
        <div className="ss-lb-header">
          <div className="ss-lb-title">🏆 Leaderboard</div>
          <div className="ss-lb-subtitle">Top players ranked by score</div>
        </div>

        {/* Table */}
        <div className="ss-table-wrapper">
          <table className="ss-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Name</th>
                <th style={{ width: '120px' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={3} className="ss-table-empty">
                    No scores yet — be the first!
                  </td>
                </tr>
              )}
              {sorted.map((user, index) => (
                <tr key={user.id}>
                  <td>
                    <span className={rankClass(index)}>{index + 1}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: index < 3 ? 700 : 400 }}>
                      {user.name || 'Anonymous'}
                    </span>
                  </td>
                  <td>
                    <span className="ss-score-value">{user.score || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
