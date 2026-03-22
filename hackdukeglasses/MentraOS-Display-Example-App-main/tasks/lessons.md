# Lessons

## 2026-03-21 — Mentra 404 debugging

- A successful `POST /webhook 200` proves the Mentra app server path is reachable.
- If the glasses still show a 404 while webhook/session traffic succeeds, suspect the **Webview URL** before blaming the webhook.
- In Mentra console, a stale or custom webview URL may survive changes to the Server URL.
- Always check ngrok request logs for both:
  - `POST /webhook`
  - `GET /webview`
- If `/webview` traffic never appears, the glasses 404 is probably coming from some other configured/stale URL, not the current server.
