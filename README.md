# site-assistant

The website assistant that runs on [lifkuru.com](https://lifkuru.com) and [ajastus.ee](https://ajastus.ee):
a single Cloudflare Worker in front of the Claude API. It answers only from the data it is given
(a system prompt, or a JSON register fetched at request time), refuses to invent, and stores nothing.

Published so that anyone we work with can read exactly what happens to a visitor's message.

## What it does

- **Origin allow-list.** Only the listed sites may call it; everything else gets `403`.
- **Bot check.** Every request must carry a [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) token
  when `TURNSTILE_SECRET` is set. The page loads Turnstile only when the chat is opened.
- **Limits.** 32 KB body, 700 characters per message, 10 user turns per conversation, 20 requests per IP
  per 10 minutes, 120 per minute per isolate.
- **No storage.** The conversation lives in the visitor's tab. The Worker keeps no logs of message content;
  the model provider (Anthropic) retains API inputs for up to 30 days for abuse prevention.
- **Plain text out.** Markdown is stripped (`cleanReply`), truncated replies are cut at the last sentence.
- **Two personas by Origin.** lifkuru.com gets the services prompt; ajastus.ee gets a register persona whose only
  source is `https://ajastus.ee/measures.json`, fetched through Cloudflare's cache once an hour and sent to the
  model as a cached prompt block.
- **Language.** Answers in the language of the visitor's latest message; the page language is only a fallback.
- **Monitoring contract.** `GET` returns `405` before the Origin check, so an uptime monitor can watch it
  without an allowed Origin.

## Deploy

1. Create a Worker, paste `worker.js`.
2. Variables: `ALLOWED_ORIGIN` (comma-separated origins), `MODEL` (optional, default `claude-haiku-4-5`).
   Secrets: `ANTHROPIC_API_KEY`, `TURNSTILE_SECRET`.
3. On the page: send `POST {lang, messages:[{role, content}], ts}` with `Content-Type: application/json`;
   show `reply` from the JSON response. Error replies come with a human-readable `reply` too.

## Test

```
node test.mjs
```
Mocks Anthropic and Turnstile; checks the status contract (405 → 403 → 503 → 413/415 → 403 bot_check → 429) and
Markdown cleaning.

## Licence

MIT. Prompts describe LIFKURU OÜ's services and prices; replace them with your own.
