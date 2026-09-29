# EchoDesk — Customer Support Agent

EchoDesk is a memory-aware support workspace that keeps customer history, known issues, environment details, frustration level, and previously successful solutions close to every reply.

## Included

- React + Vite workspace UI with modular `Navbar`, `CustomerList`, `ChatWindow`, `MemoryPanel`, `CustomerTimeline`, and overview components.
- Express API with PostgreSQL persistence through Drizzle.
- Seeded customer, memory, timeline, and chat-message records.
- Retrieval pipeline that ranks the most relevant memories with token overlap plus confidence.
- Gemini prompt pipeline using `GEMINI_API_KEY` server-side.
- OpenAPI contract and generated React Query/Zod clients.

## Enable live AI replies

The application never sends the Gemini key to the browser. Add `GEMINI_API_KEY` as a Replit Secret, then restart the API Server workflow. Without the key, the chat endpoint returns an explicit `503` configuration response rather than pretending an AI reply was generated.

## Run

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/customer-support-agent run dev
```

The customer-support frontend calls the shared API through `/api`.