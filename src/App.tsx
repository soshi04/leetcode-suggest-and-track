import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [skillData, setSkillData] = useState<any>(null); // for displaying skill breakdown
  const [error, setError] = useState('');

  const fetchLeetCodeSkills = async () => {
    try {
      const response = await axios.post(
        '/api/skills',
        { username }, // send { username: 'soshi04' }
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const stats = response.data.skills;

      if (stats) {
        setSkillData(stats);
        setError('');
        console.log(stats); // view the structured skill data in the console
      } else {
        setSkillData(null);
        setError('No skill data found.');
      }
    } catch (err) {
      console.error(err);
      setSkillData(null);
      setError('Error fetching data.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>LeetCode Skill Breakdown</h1>

      <input
        type="text"
        placeholder="Enter LeetCode username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={fetchLeetCodeSkills}>Fetch Skills</button>

      <p>Type your LeetCode username and press "Fetch Skills".</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {skillData && (
        <div>
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
        </div>
      )}
    </div>
  );
}

export default App;