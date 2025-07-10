import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import './AppLayout.css';

function App() {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [skillData, setSkillData] = useState<any>(null);
  const [error, setError] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLeetCodeSkills = async () => {
    setError('');
    setAdvice('');
    setSkillData(null);
    setLoading(true);

    try {
      const idToken = await user?.getIdToken();
      const response = await axios.post(
        '/api/skills',
        { username },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
        }
      );

      const stats = response.data.skills;

      if (stats) {
        setSkillData(stats);

        // Send to LLM for advice
        const adviceResponse = await axios.post(
          '/api/advice',
          { skills: stats },
          {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          }
        );
        const recommendation = adviceResponse.data.advice;
        setAdvice(recommendation);
      } else {
        setError('No skill data found.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('Daily limit reached. Please try again tomorrow.');
      } else {
        setError('Error fetching data.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>LeetCode Skill Breakdown</h1>
        <button 
          onClick={signOut}
          className="signout-btn"
        >
          Sign Out
        </button>
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Enter LeetCode username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={fetchLeetCodeSkills}>Fetch Skills</button>
      </div>
      <p className="input-hint">Type your LeetCode username and press "Fetch Skills".</p>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="cards-row">
        {skillData && (
          <div className="card skills-card">
            <h2>Skills</h2>
            <div className="skills-section">
              <h3>Fundamental</h3>
              <ul>
                {skillData.fundamental.map((skill: any) => (
                  <li key={skill.tagSlug}>
                    <span className="skill-name">{skill.tagName}</span>
                    <span className="skill-count">{skill.problemsSolved} solved</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="skills-section">
              <h3>Intermediate</h3>
              <ul>
                {skillData.intermediate.map((skill: any) => (
                  <li key={skill.tagSlug}>
                    <span className="skill-name">{skill.tagName}</span>
                    <span className="skill-count">{skill.problemsSolved} solved</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="skills-section">
              <h3>Advanced</h3>
              <ul>
                {skillData.advanced.map((skill: any) => (
                  <li key={skill.tagSlug}>
                    <span className="skill-name">{skill.tagName}</span>
                    <span className="skill-count">{skill.problemsSolved} solved</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {advice && (
          <div className="card advice-card">
            <h2>AI Recommendation</h2>
            <pre className="advice-pre">{advice}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;