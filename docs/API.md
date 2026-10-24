# REST API

All responses use `{ "data": ... }` on success or `{ "error": { "code", "message" } }` on failure. Protected endpoints require the HTTP-only `bookleaf_session` cookie.

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | public | Body: `email`, `password`; creates session |
| POST | `/api/auth/logout` | authenticated | Clears session |
| GET | `/api/author/books` | author | Current author’s books only |
| GET | `/api/author/tickets` | author | Current author’s tickets and public replies |
| POST | `/api/author/tickets` | author | Body: optional `bookId`, `subject`, `description`; performs AI triage |
| GET | `/api/admin/tickets` | admin | Filters: `status`, `category`, `priority`, `from` |
| GET | `/api/admin/tickets/:id` | admin | Full ticket, author/book context, conversation, private notes |
| GET | `/api/admin/tickets/:id/reply` | admin | Generates an editable AI draft; reports draft source |
| POST | `/api/admin/tickets/:id/reply` | admin | Body: `body`; sends an author-visible reply |
| PATCH | `/api/admin/tickets/:id/manage` | admin | Optional `status`, `category`, `priority`, `assignToSelf`, `note` |
| GET | `/api/health` | public | Health check |

Validation: subject 3–140 characters, description/replies 1–5,000 characters, note 1–2,000 characters. Authors cannot retrieve or modify another author’s book/ticket data.
