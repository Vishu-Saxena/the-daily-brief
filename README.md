# The Daily Brief

Premium editorial news experience built with Next.js App Router, TypeScript, Tailwind CSS, and Lucide icons.

## Run locally

1. Copy `.env.example` to `.env.local` and add your credentials. Set `OPENAI_API_KEY` to an OpenAI API key; optionally choose a model with `OPENAI_MODEL` (defaults to `gpt-4o-mini`). Restart Next.js after changing environment variables.
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

The UI includes a responsive editorial homepage, category headlines stored in MongoDB, category and trending discovery, search, article detail pages, dark mode, MongoDB-backed bookmarks and authentication, browser speech playback, and OpenAI-powered summaries. Signed-in users can use **Write** to submit a complete draft for AI structuring or generate an article from a topic. Topic generation can use the Responses API web search tool when the model needs more or current information, and shows returned sources in the editable preview. Users can attach their own JPEG/PNG/WebP image (up to 5 MB), review the article, then explicitly publish. Article images are stored in MongoDB GridFS. Published stories are stored with their author and listed at **My Posts**; authors can add or replace a published article's image later, and each story has a public `/posts/{id}` reading page.

Run `npm run seed:news` to upsert four Google News RSS links per category into MongoDB. Stories are deduplicated by publisher URL and appear on the home and matching category pages. `NEWS_COUNTRY` sets the RSS region and defaults to `in`.
