# Mentra Console Setup — ClassWatch Mentra App

This doc tells you exactly what to put into the Mentra MiniApp creation form.

## Critical distinction

There are **two different URLs** involved:

1. **`CLASSWATCH_BASE_URL`**
   - This is the upstream data source.
   - In your case:
     - `https://hackduke26tea.vercel.app`

2. **Mentra MiniApp `Server URL`**
   - This must point to the **Mentra app built in this repo**.
   - It is **not** the ClassWatch Vercel URL.
   - Mentra will send MiniApp webhook traffic to this server.

If you put the Vercel dashboard URL directly into Mentra’s Server URL field, Mentra will hit the wrong server and the app will not work properly. Cute disaster, bad outcome.

## What to run locally

From this repo:

```bash
cp .env.example .env
```

Use:

```env
PORT=3001
PACKAGE_NAME=com.whiteboardapp
MENTRAOS_API_KEY=YOUR_REAL_MENTRA_API_KEY
CLASSWATCH_BASE_URL=https://hackduke26tea.vercel.app
DEFAULT_CLASS_ID=class-demo
POLL_CLASSES_MS=60000
POLL_ALERTS_MS=5000
POLL_SUMMARY_MS=10000
POLL_STUDENTS_MS=15000
REQUEST_TIMEOUT_MS=8000
MENTRA_VIEW_TYPE=DEFAULT
LOG_LEVEL=info
```

Then run:

```bash
bun run dev
```

Expose the Mentra app publicly:

```bash
ngrok http 3001
```

Use the resulting ngrok HTTPS URL as the **Mentra Server URL**.

Example:

```text
https://your-ngrok-subdomain.ngrok-free.app
```

Mentra will append `/webhook` automatically.

## Recommended MiniApp form values

### Core details
- **Package / Identifier**: `com.whiteboardapp`
  - Must exactly match `PACKAGE_NAME` in your `.env`
- **Display Name**: `whiteboardmain`
  - You may want to rename this to something more user-friendly, e.g. `ClassWatch Live`
- **Description**:
  - Suggested:
    - `Live classroom alerts, summaries, and student roster updates for ClassWatch on Mentra smart glasses.`

### Server configuration
- **Server URL**:
  - **Do not use:** `https://hackduke26tea.vercel.app`
  - **Use instead:** your public ngrok URL for this Mentra app server
  - Example:
    - `https://your-ngrok-subdomain.ngrok-free.app`

- **Webview URL**:
  - Optional
  - You can leave the default unless you actually have a dedicated webview app to show
  - If you want a real webview target later, that would be separate
  - Important: if you previously toggled on a custom webview URL, Mentra may keep using that stale custom value even after changing the Server URL. If the glasses still show a 404, verify the custom webview toggle is OFF or that the explicit webview URL points to `<your-ngrok-url>/webview`.

### Background / Foreground
- Recommended for this app:
  - **Foreground MiniApp**

Reason:
- this app is display-oriented,
- it actively renders alerts/summaries,
- it is not just a silent background helper.

### Permissions
Recommended:
- **Microphone + Transcripts**

Reason:
- the app supports transcript-driven commands like:
  - `next screen`
  - `show alerts`
  - `show summary`
  - `show students`
  - `class <class-id>`

If you do not care about voice commands, you could technically remove this later.

### Minimum hardware requirements
Recommended:
- no special extra hardware requirement unless the console forces one

Reason:
- this app is text-first,
- no camera processing,
- no special sensor dependency,
- no custom media pipelines.

## Checklist before pressing Create MiniApp

- [ ] `PACKAGE_NAME` in `.env` matches the console package exactly
- [ ] `CLASSWATCH_BASE_URL=https://hackduke26tea.vercel.app`
- [ ] local Mentra app is running on `PORT=3001`
- [ ] ngrok is exposing port `3001`
- [ ] Mentra form `Server URL` points to ngrok, not Vercel
- [ ] Mentra form `Webview URL` is either defaulted correctly or explicitly set to `<your-ngrok-url>/webview`
- [ ] if custom webview was previously enabled, it is not pointing to an old/stale URL
- [ ] real Mentra API key is in `.env`

## Quick sanity endpoints

After starting the app locally, verify:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/cache
```

If ngrok is running, also verify the public URL works:

```bash
curl https://your-ngrok-subdomain.ngrok-free.app/api/health
curl https://your-ngrok-subdomain.ngrok-free.app/webview
```

## Recommendation on naming

Your current values seem to be:
- package: `com.whiteboardapp`
- display name: `whiteboardmain`
- description: `whiteboardd`

Those will work, but they’re pretty placeholder-y.

Cleaner recommendation:
- **Package**: `com.whiteboardapp`
- **Display Name**: `ClassWatch Live`
- **Description**: `Live classroom alerts, summaries, and student roster updates for ClassWatch on Mentra smart glasses.`

That is much less “hackathon fever dream form fill” and much more “real app.”
