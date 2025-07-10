import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

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
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>LeetCode Skill Breakdown</h1>
        <button 
          onClick={signOut}
          style={{ 
            padding: '0.5rem 1rem',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      <input
        type="text"
        placeholder="Enter LeetCode username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
      />
      <button onClick={fetchLeetCodeSkills} style={{ padding: '0.5rem' }}>Fetch Skills</button>

      <p>Type your LeetCode username and press "Fetch Skills".</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {skillData && (
        <>
          <h2>Fundamental Skills</h2>
          <ul>
            {skillData.fundamental.map((skill: any) => (
              <li key={skill.tagSlug}>
                {skill.tagName}: {skill.problemsSolved} solved
              </li>
            ))}
          </ul>

          <h2>Intermediate Skills</h2>
          <ul>
            {skillData.intermediate.map((skill: any) => (
              <li key={skill.tagSlug}>
                {skill.tagName}: {skill.problemsSolved} solved
              </li>
            ))}
          </ul>

          <h2>Advanced Skills</h2>
          <ul>
            {skillData.advanced.map((skill: any) => (
              <li key={skill.tagSlug}>
                {skill.tagName}: {skill.problemsSolved} solved
              </li>
            ))}
          </ul>
        </>
      )}

      {advice && (
        <div className="card advice-card">
          <h2>AI Recommendation</h2>
          <div className="advice-content">
            {(() => {
              // Split advice into lines and parse sections
              const lines = advice.split('\n').map(l => l.trim()).filter(Boolean);
              // Find the start of the numbered list
              const listStart = lines.findIndex(l => /^1[).]/.test(l));
              // Find the motivational message (last non-list paragraph)
              const lastListLine1 = lines.find(l => /^3[).]/.test(l)) || '';
              const lastListLine2 = lines.find(l => /^3\./.test(l)) || '';
              const lastListIdx = Math.max(
                lines.lastIndexOf(lastListLine1),
                lines.lastIndexOf(lastListLine2)
              );
              const intro = lines.slice(0, listStart).join(' ');
              const topics = lines.slice(listStart, lastListIdx + 1);
              const outro = lines.slice(lastListIdx + 1).join(' ');
              // Group topics by number
              const topicGroups: string[][] = [];
              let current: string[] = [];
              for (const line of topics) {
                if (/^[1-3][).]/.test(line)) {
                  if (current.length) topicGroups.push(current);
                  current = [line];
                } else {
                  current.push(line);
                }
              }
              if (current.length) topicGroups.push(current);
              return (
                <>
                  <div className="advice-intro">{intro}</div>
                  <ol className="advice-topic-list">
                    {topicGroups.map((group, idx) => {
                      // First line is the topic title, rest is explanation
                      const [title, ...rest] = group;
                      // Extract topic name (bold or not)
                      const match = title.match(/^[1-3][).]\s*\*\*(.+?)\*\*\s*-\s*(.*)/) || title.match(/^[1-3][).]\s*(.+?)\s*-\s*(.*)/);
                      const topic = match ? match[1] : title;
                      const reason = match ? match[2] : '';
                      return (
                        <li key={idx} className="advice-topic">
                          <span className="advice-topic-title">{topic}</span>
                          <span className="advice-topic-reason">{reason} {rest.join(' ')}</span>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="advice-outro">{outro}</div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;