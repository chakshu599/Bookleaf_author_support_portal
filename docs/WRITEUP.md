# Brief Write-Up

## Stack
- Frontend: React (Next.js App Router)
- Backend: Next.js route handlers (Node.js/TypeScript)
- Database: SQLite via Prisma ORM
- Auth: JWT in HTTP-only cookies (jose + bcryptjs)
- AI/LLM: Groq API (OpenAI-compatible) with model `openai/gpt-oss-20b`, deterministic fallback
- Real-time: 10-second polling

## Approach
I prioritized a working end-to-end ticket lifecycle over breadth: authors can view books/royalties, submit tickets, and see replies; admins can triage, reply, assign, and add internal notes. The stack is Next.js (frontend + REST backend), Prisma/SQLite, and JWT cookie auth, keeping deployment simple while leaving a clear path to production.

## Priorities
1. Correctness and security: server-side role/ownership enforcement, Zod validation, structured errors.
2. AI quality with graceful degradation: Groq classification + drafting with deterministic KB-grounded fallback so the portal works without an API key.
3. Real-time-ish UX: 10-second polling for both portals.
4. Completeness: empty states, production books, zero-royalty handling.

## Trade-offs
- SQLite instead of PostgreSQL for fast local setup; schema is portable.
- Polling instead of WebSockets/SSE to reduce complexity.
- Attachment upload is UI-only; no object storage.
- AI calls are inline (not queued) with 8s timeout + 1 retry.
- Compact KB context only, sacrificing richer policy grounding for cost control.

## Evolving to production
- Move to PostgreSQL, add rate limiting/CSRF, secure object storage + malware scanning, audit log.
- Replace polling with SSE/WebSockets; use a queue (e.g., BullMQ) for LLM calls with retries.
- Add monitoring, tests for API routes, and CI/CD; split services if scale demands.
