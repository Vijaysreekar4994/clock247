// src/CricketScore.js
import React, { useEffect, useState } from 'react';

const CricketScore = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScores = async () => {
    setLoading(true);
    try {
      // https://cricketdata.org/member-test.aspx#currentMatches
      const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=d8dbc712-85ce-4367-8bcf-8039dae845d8`);
      const data = await res.json();

      const iplMatches = data.data?.filter(m => m.series_id.includes("ipl") || m.name.toLowerCase().includes("ipl")) || [];
      setMatches(iplMatches);
    } catch (err) {
      setError("Couldn't load cricket scores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 60 * 1000); // update every 1 minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="score-box">Loading cricket scores...</div>;
  if (error) return <div className="score-box">{error}</div>;
  if (!matches.length) return <div className="score-box">No IPL matches right now.</div>;

  return (
    <div className="score-box">
      <h4>🏏 IPL Scores</h4>
      {matches.map((match, i) => (
        <div key={i}>
          <strong>{match.name}</strong><br />
          {match.status}<br />
          {match.score && match.score.map((s, idx) => (
            <div key={idx}>{s.inning}: {s.runs}/{s.wickets} in {s.overs} overs</div>
          ))}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default CricketScore;
