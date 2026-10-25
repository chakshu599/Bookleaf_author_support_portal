# Brief Write-Up 

## Technology Stack
- **Frontend:** React with Next.js App Router
- **Backend:** Next.js route handlers (Node.js/TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT stored in HTTP-only cookies, using `jose` and `bcryptjs`
- **AI Integration:** Groq API with the OpenAI-compatible `openai/gpt-oss-20b` model and a deterministic fallback
- **Ticket Updates:** 10-second polling

## Approach
I prioritized delivering a functional end-to-end ticket lifecycle. Authors can view their books and royalty information, submit support tickets, and track responses. Administrators can review and triage tickets, assign them, respond to authors, and add internal notes.

Next.js, Prisma, and PostgreSQL provide a unified application architecture that simplifies development and deployment while maintaining a clear path for future scaling.

## Key Priorities
1. **Correctness and security:** Enforced role-based access and resource ownership on the server, with Zod validation and structured error handling.
2. **Reliable AI integration:** Used Groq for ticket classification, priority assignment, and reply drafting, with a deterministic, knowledge-base-grounded fallback when AI is unavailable.
3. **Responsive user experience:** Implemented 10-second polling to refresh ticket updates in both author and admin portals.
4. **Functional completeness:** Addressed empty states, book information, and zero-royalty scenarios.

## Trade-offs
- **Database:** Used PostgreSQL with Prisma for deployment compatibility; local development requires a PostgreSQL instance.
- **Updates:** Chose polling over WebSockets or Server-Sent Events to reduce implementation complexity.
- **Attachments:** Implemented the attachment interface without a complete file-storage and upload pipeline.
- **AI execution:** Kept AI calls inline with an 8-second timeout and one retry rather than introducing a background queue.
- **Context and cost:** Used compact knowledge-base context to control token usage, accepting less extensive policy grounding.

## Future Production Improvements
- Strengthen API protection with rate limiting, CSRF protections where applicable, and comprehensive authorization tests.
- Implement secure object storage, file validation, and malware scanning for attachments.
- Add audit logging and centralized monitoring.
- Replace polling with SSE or WebSockets if update frequency and scale justify it.
- Introduce a background job queue for AI calls, with controlled retries and failure handling.
- Expand automated API and integration tests and add CI/CD checks.
- Consider separating services if future traffic and operational needs require it.
