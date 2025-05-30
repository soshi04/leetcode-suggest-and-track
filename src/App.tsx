import React, { useState } from 'react';
import axios from 'axios';

function App() {
  /*
  variables to render in and update with the app
  */
  const [username, setUsername] = useState('');
  const [solved, setSolved] = useState<number | null>(null);
  const [error, setError] = useState('');

  /*
  the async tag on the function means we can use the keyword "await" inside it later
  This is a syntax that makes working with Promises more readable and easier to manage.
  async declares a function that returns a promise, and await pauses execution until a promise resolves.
  */
  const fetchLeetCodeData = async () => {
    /*
    in this query, we are defining it as a string.
    "query questionTitle()" is the declaration with titleSlug being of type String. The ! after string
    means its required

    Inside the query, we have question(title:$title) <- this is what asks leetcode for that question
    from it we want the title and the difficulty 
    */
    
    const query = `
      query questionTitle($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          difficulty
        }
      }
    `;
  
    const variables = { titleSlug: username }; // let the input be the slug like "two-sum"
    // this creates a json Creates a JSON object like { username: "sohumjoshi" } This matches $username from the GraphQL query.
  
    try {
      const response = await axios.post(
        '/api/leetcode',
        { query, variables },
        {
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
            'User-Agent': 'Mozilla/5.0',
          },
        }
      );
  
      const question = response.data.data.question;
      if (question) {
        setSolved(null);
        setError('');
        alert(`${question.title} is a ${question.difficulty} problem.`);
      } else {
        setError('Problem not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching data.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>LeetCode User Stats</h1>
      <input
        type="text"
        placeholder="Enter problem name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={fetchLeetCodeData}>Fetch</button>
      <p>Type in a problem using "-" for spaces and then press fetch.</p>

      {solved !== null && <p>{username} has solved {solved} problems!</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
