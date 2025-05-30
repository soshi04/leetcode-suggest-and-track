import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, variables } = req.body;

    const response = await axios.post(
      'https://leetcode.com/graphql/',
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Error fetching from LeetCode' });
  }
}