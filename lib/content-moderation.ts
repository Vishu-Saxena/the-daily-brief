type Outcome = {
  state: 'clean' | 'flagged' | 'unavailable';
  status: 'published' | 'pending' | 'rejected';
  categories: string[];
  note: string;
};

const profanityPatterns = [
  /\bfuck(?:ing|ed|s)?\b/i,
  /\bshit(?:ty|s)?\b/i,
  /\bassholes?\b/i,
  /\bbullshit\b/i,
  /\bbastards?\b/i,
  /\bbitch(?:es)?\b/i,
  /\b(?:stupid|idiots?|worthless|pathetic|ugly)\b/i,
  /\bcrap\b/i,
  /\bdamn(?:ed)?\b/i,
];

export function getArticleModerationText(article: {
  title: string;
  dek: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
}) {
  return [article.title, article.dek, ...article.sections.flatMap(section => [section.heading, ...section.paragraphs])].join('\n');
}

export async function moderateSubmission(text: string, image?: { buffer: Buffer; contentType: string }): Promise<Outcome> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { state: 'unavailable', status: 'pending', categories: [], note: 'Automated screening is unavailable. This article is waiting for a moderator.' };

  try {
    const input: unknown = image
      ? [
          { type: 'text', text },
          { type: 'image_url', image_url: { url: `data:${image.contentType};base64,${image.buffer.toString('base64')}` } },
        ]
      : text;
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Moderation request failed (${response.status}).`);
    const data = await response.json();
    const result = data.results?.[0];
    if (!result) throw new Error('Moderation response was empty.');
    const flaggedCategories = Object.entries(result.categories || {}).filter(([, flagged]) => flagged === true).map(([category]) => category);
    if (result.flagged === true && flaggedCategories.length === 0) flaggedCategories.push('policy-flagged');
    const hasProfanity = profanityPatterns.some(pattern => pattern.test(text));
    const categories = [...flaggedCategories, ...(hasProfanity ? ['profanity'] : [])];
    if (!categories.length) return { state: 'clean', status: 'published', categories: [], note: '' };

    const clearViolationCategories = new Set(['sexual/minors', 'hate/threatening', 'harassment/threatening', 'violence/graphic', 'self-harm/instructions']);
    const isClearViolation = flaggedCategories.some(category => clearViolationCategories.has(category));
    return {
      state: 'flagged',
      status: isClearViolation ? 'rejected' : 'pending',
      categories,
      note: isClearViolation
        ? 'Automated screening found content that requires removal. The article is not eligible for publication.'
        : 'Automated screening flagged content for a moderator to review.',
    };
  } catch (error) {
    console.error('Content moderation unavailable:', error instanceof Error ? error.message : 'unknown error');
    return { state: 'unavailable', status: 'pending', categories: [], note: 'Automated screening could not finish. This article is waiting for a moderator.' };
  }
}
