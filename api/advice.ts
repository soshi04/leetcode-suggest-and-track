import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { checkAndIncrement } from './firebase-stuff';
import * as admin from 'firebase-admin';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🔐 Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: Token not found' });
  }

  try {
    // 🔍 Verify Firebase ID token and get UID
    console.log(' Verifying Firebase token...');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log('Firebase token verified. UID:', uid);

    // 🚦 Rate limit: 3 calls per day
    const isAllowed = await checkAndIncrement(uid);
    if (!isAllowed) {
      console.warn(`Daily limit reached for user ${uid}`);
      return res.status(403).json({ error: 'Daily limit reached' });
    }

    // 🧠 Validate input
    const { skills } = req.body;
    if (!skills) {
      return res.status(400).json({ error: 'Missing skills data' });
    }

    // 🧾 Format skill prompt
    const formatSkillGroup = (group: any[], level: string) =>
      `${level}:\n` + group.map((s) => `- ${s.tagName}: ${s.problemsSolved} solved`).join('\n');

    const formattedSkills = `
User's LeetCode Skill Profile:

${formatSkillGroup(skills.fundamental, 'Fundamental')}

${formatSkillGroup(skills.intermediate, 'Intermediate')}

${formatSkillGroup(skills.advanced, 'Advanced')}
    `;

    const prompt = `
${formattedSkills}

Based on this profile, what are 3 topics this user should focus on to improve?
For each topic, explain *why* it was chosen and recommend 1–2 free resources (YouTube or blog).
Keep it actionable and motivational.
    `;

    console.log('Sending prompt to OpenAI...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful LeetCode coach.' },
        { role: 'user', content: prompt },
      ],
    });

    const advice = completion.choices[0].message.content;
    console.log('OpenAI response received.');

    return res.status(200).json({ advice });
  } catch (err: any) {
    console.error('Error in /api/advice.ts:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to generate advice' });
  }
}