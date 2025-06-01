import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { skills } = req.body;
  if (!skills) {
    return res.status(400).json({ error: 'Missing skills data' });
  }

  const formatSkillGroup = (group: any[], level: string) =>
    `${level}:\n` +
    group.map((s) => `- ${s.tagName}: ${s.problemsSolved} solved`).join('\n');

  const formattedSkills = `
User's LeetCode Skill Profile:

${formatSkillGroup(skills.fundamental, 'Fundamental')}
\n
${formatSkillGroup(skills.intermediate, 'Intermediate')}
\n
${formatSkillGroup(skills.advanced, 'Advanced')}
`;

  const prompt = `
${formattedSkills}

Based on this profile, what are 3 topics this user should focus on to improve?
For each topic, explain *why* it was chosen and recommend 1–2 free resources (YouTube or blog).
Keep it actionable and motivational.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful LeetCode coach.' },
        { role: 'user', content: prompt },
      ],
    });

    const advice = completion.choices[0].message.content;
    return res.status(200).json({ advice });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to generate advice' });
  }
}