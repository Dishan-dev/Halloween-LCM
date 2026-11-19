# Sugar Cubes from the Crypt

A Halloween LCM page for AIESEC in University of Moratuwa: delegates enter their name, a wax-sealed letter floats down, and they break the seal to read a sugar cube from EB 26.27.

Built with Next.js (App Router).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Edit the messages

All messages are in [`lib/messages.ts`](lib/messages.ts):

- `PERSONAL`: a special note for one delegate, keyed by their name in lowercase.
- `MESSAGES`: random sugar cubes for everyone else. `{name}` is replaced with the delegate's name.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo.
3. Keep the defaults (Framework: Next.js, build command `next build`) and click **Deploy**.

Or from the terminal: `npx vercel` (preview) and `npx vercel --prod` (production).
