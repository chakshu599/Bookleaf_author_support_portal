# BookLeaf Author Support & Communication Portal

Next.js 15 (App Router) + Prisma/PostgreSQL portal for authors to raise support tickets and admins to manage them, with AI-assisted triage and reply drafting.

## Prerequisites
- Node.js 18+ and npm
- (Optional) A Groq API key for AI features

## Setup
1. Clone and enter the project:
   ```bash
   git clone <repo-url>
   cd Bookleaf-author-support-portal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from the example and set a strong `JWT_SECRET`:
   ```bash
   cp .env.example .env
   ```
4. Create the database schema:
   ```bash
   npx prisma db push
   ```
   (or `npm run db:migrate`)
5. Seed demo data:
   ```bash
   npm run db:seed
   ```
6. (Optional) Add `GROQ_API_KEY` and `GROQ_MODEL` to `.env` for AI features. Without them, deterministic fallbacks keep the portal usable.
7. Start the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Demo credentials
- Author: `priya.sharma@email.com` / `Bookleaf@123`
- Admin: `admin@bookleaf.demo` / `Bookleaf@123`

## Scripts
- `npm run dev` — start dev server
- `npm run build` / `npm run start` — production build/run
- `npm run lint` — lint
- `npm test` — run tests
- `npm run db:generate` — regenerate Prisma client
- `npm run db:migrate` — create/apply migrations
- `npm run db:seed` — seed demo data

## Architecture
- Next.js provides React pages and REST endpoints
- Prisma/PostgreSQL is the database
- JWTs stored in HTTP-only cookies
- AI classification/drafting uses Groq (`openai/gpt-oss-20b`); falls back to deterministic KB-grounded logic

## Architecture decisions
- Next.js App Router for unified frontend + REST backend in one deployable.
- Prisma + PostgreSQL; local dev can use a local Postgres or Prisma Postgres.
- JWT in HTTP-only cookie for simple, stateless auth; role stored in token.
- Server-side enforcement of roles/ownership; client only for rendering.
- AI calls server-only with 8s timeout + 1 retry; compact book + KB context only.

## AI integration
- Provider: Groq (OpenAI-compatible) `openai/gpt-oss-20b`; configurable via env.
- Prompt strategy: system prompt defines classification rules and KB; ticket text treated as untrusted data; requests structured JSON.
- Error handling: Zod validation of AI output; on failure/invalid, fall back to deterministic regex classifier and KB-grounded draft.
- Cost management: only linked book + compact policy context sent; no full ticket history or whole KB; temperature low; single call per ticket.
- AI results stored separately (`aiCategory`/`aiPriority`) from editable `category`/`priority`.

## API documentation
See `docs/API.md` for full endpoint reference.

## Known limitations / improvements
- Attachment upload is UI-only (no storage).
- Near-real-time via 10s polling (SSE/WebSockets would be better).
- No rate limiting/CSRF; review before production.
- No audit log; LLM calls lack a real queue/retry.
- Add PostgreSQL, object storage + malware scanning, and rate limiting for production.

See `docs/APPROACH.md` for submission documentation.
