import React, { useState } from 'react';
import axios from 'axios';

function App() {
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
      const response = await axios.post(
        '/api/skills',
        { username },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const stats = response.data.skills;

      if (stats) {
        setSkillData(stats);

        // Send to LLM for advice
        const adviceResponse = await axios.post('/api/advice', { skills: stats });
        const recommendation = adviceResponse.data.advice;
        setAdvice(recommendation);
      } else {
        setError('No skill data found.');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1>LeetCode Skill Breakdown</h1>

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
        <div style={{ marginTop: '2rem' }}>
          <h2>AI Recommendation</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem', whiteSpace: 'pre-wrap', borderRadius: '6px' }}>
            {advice}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;