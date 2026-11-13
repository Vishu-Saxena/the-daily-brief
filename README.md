# The Daily Brief

Premium editorial news experience built with Next.js App Router, TypeScript, Tailwind CSS, and Lucide icons.

## Run locally

1. Copy `.env.example` to `.env.local` and add your credentials. Set `OPENAI_API_KEY` to an OpenAI API key; optionally choose a model with `OPENAI_MODEL` (defaults to `gpt-4o-mini`). Set `ADMIN_EMAILS` to a comma-separated list of moderator account emails. Restart Next.js after changing environment variables.
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

The UI includes a responsive editorial homepage, category headlines stored in MongoDB, category and trending discovery, search, article detail pages, dark mode, MongoDB-backed bookmarks and authentication, browser speech playback, and OpenAI-powered summaries. Signed-in users can submit a complete draft for AI structuring or generate an article from a topic. Topic generation can use the Responses API web search tool when the model needs more or current information, and shows returned sources in the editable preview. User-submitted text and optional images are screened before publication; flagged or unreviewable posts wait for moderator review. Moderators listed in `ADMIN_EMAILS` can approve or reject submissions, and authors can appeal rejections from the dashboard. Article images are stored in MongoDB GridFS. Published stories are stored with their author and each story has a public `/posts/{id}` reading page.

To provision an admin account, temporarily set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` in `.env.local`, include that email in `ADMIN_EMAILS`, then run `npm run admin:create`. The setup script hashes the password and upserts the account. Remove the two bootstrap variables after it succeeds; keep only `ADMIN_EMAILS` for moderator access.

Run `npm run seed:news` to upsert four Google News RSS links per category into MongoDB. Stories are deduplicated by publisher URL and appear on the home and matching category pages. `NEWS_COUNTRY` sets the RSS region and defaults to `in`.
