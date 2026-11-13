import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { moderateSubmission } from '../lib/content-moderation.ts';

const originalFetch = globalThis.fetch;
const originalKey = process.env.OPENAI_API_KEY;

function moderationResponse(categories = {}, flagged = Object.values(categories).some(Boolean)) {
  return { ok: true, status: 200, json: async () => ({ results: [{ flagged, categories }] }) };
}

beforeEach(() => { process.env.OPENAI_API_KEY = 'test-key'; });
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
});

test('clean text passes screening and publishes', async () => {
  globalThis.fetch = async () => moderationResponse();
  const result = await moderateSubmission('A neutral article about public transport improvements.');
  assert.equal(result.state, 'clean');
  assert.equal(result.status, 'published');
  assert.deepEqual(result.categories, []);
});

test('detected profanity is held for review instead of immediately published', async () => {
  globalThis.fetch = async () => moderationResponse();
  const result = await moderateSubmission('This is a damn example article with enough context.');
  assert.equal(result.state, 'flagged');
  assert.equal(result.status, 'pending');
  assert.ok(result.categories.includes('profanity'));
});

test('multiple insults and profanity in an article are caught even when the API misses them', async () => {
  globalThis.fetch = async () => moderationResponse();
  const result = await moderateSubmission('A writer describes online trolls as assholes and calls their conduct bullshit, stupid, and pathetic.');
  assert.equal(result.state, 'flagged');
  assert.equal(result.status, 'pending');
  assert.ok(result.categories.includes('profanity'));
});

test('clear severe categories are rejected and remain appealable', async () => {
  globalThis.fetch = async () => moderationResponse({ 'sexual/minors': true });
  const result = await moderateSubmission('A submitted story with sufficient text.');
  assert.equal(result.state, 'flagged');
  assert.equal(result.status, 'rejected');
  assert.ok(result.categories.includes('sexual/minors'));
  assert.match(result.note, /appeal/i);
});

test('other flagged content is held in the moderator queue', async () => {
  globalThis.fetch = async () => moderationResponse({ harassment: true });
  const result = await moderateSubmission('A submitted story with sufficient text.');
  assert.equal(result.status, 'pending');
  assert.ok(result.categories.includes('harassment'));
});

test('text and image are both sent to the moderation endpoint', async () => {
  let requestBody;
  globalThis.fetch = async (_url, options) => { requestBody = JSON.parse(options.body); return moderationResponse(); };
  const result = await moderateSubmission('Article text for the image test.', { buffer: Buffer.from('fake-image'), contentType: 'image/png' });
  assert.equal(result.status, 'published');
  assert.equal(requestBody.model, 'omni-moderation-latest');
  assert.equal(requestBody.input[0].text, 'Article text for the image test.');
  assert.match(requestBody.input[1].image_url.url, /^data:image\/png;base64,/);
});

test('missing credentials fail closed to pending review', async () => {
  delete process.env.OPENAI_API_KEY;
  globalThis.fetch = async () => { throw new Error('Fetch should not be called without a key.'); };
  const result = await moderateSubmission('An article that has not been checked.');
  assert.equal(result.state, 'unavailable');
  assert.equal(result.status, 'pending');
});

test('moderation service errors fail closed to pending review', async () => {
  const originalError = console.error;
  console.error = () => {};
  globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => ({}) });
  try {
    const result = await moderateSubmission('An article that could not be checked.');
    assert.equal(result.state, 'unavailable');
    assert.equal(result.status, 'pending');
  } finally { console.error = originalError; }
});
