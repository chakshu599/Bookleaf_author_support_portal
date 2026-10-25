# BookLeaf implementation approach

I prioritised the complete ticket workflow and AI integration because they are the highest-value operational path and the PDF’s highest-weight evaluation area. Next.js keeps the author UI, admin UI, and REST layer in one deployable application. Prisma provides a clear relational model on PostgreSQL for both local and production use.

Ticket creation performs server-only AI triage using Groq (`openai/gpt-oss-20b`) when a `GROQ_API_KEY` is available. The model receives the ticket and only linked-book facts, with a compact policy prompt rather than full history or a full knowledge base. The returned category and priority are stored separately from editable admin values. Admin draft generation uses the same scoped approach. Timeouts, one retry, and a deterministic policy-based fallback mean tickets and manual replies work through AI outage or rate limiting.

The main trade-offs are 10-second polling instead of WebSockets/SSE and attachment UI without file storage—both acceptable to the brief. In production I would use PostgreSQL, a queue for model calls/retries, Redis rate limits, object storage with malware scanning, CSRF protection, audit events, and real-time events.
