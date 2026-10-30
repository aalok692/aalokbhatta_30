# Aalok Bhatta — personal website

A responsive personal website with a React/Vite frontend, Express API, MongoDB persistence, and a private content-management dashboard.

The site uses only the personal background provided so far: Civil Engineering and a transition into software development, with interests in full-stack development, backend engineering, cloud, and DevOps. Projects, writing, gallery photos, and social profiles start empty until Aalok adds real content.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB Atlas database (or a local MongoDB instance for development)

## Run locally

1. Copy the environment template:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Set `MONGODB_URI` to your database connection string and replace `SESSION_SECRET` with a random value of at least 32 characters. Keep `.env` private and never commit it.

   Generate a session secret with:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```

3. Install packages and start the frontend/API:

   ```powershell
   npm install
   npm run dev
   ```

   The frontend runs at `http://localhost:5173`, the API at `http://localhost:4000`, and Vite proxies `/api` and `/uploads` locally.

4. Create the first admin account. Put `ADMIN_EMAIL` and a unique password of at least 14 characters into `.env`, then run:

   ```powershell
   npm run admin:create
   ```

   Visit `http://localhost:5173/admin`. There is no public admin registration endpoint.

## Environment

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development` locally; set to `production` on the API host. |
| `API_PORT` | Express listening port (default `4000`). |
| `WEB_ORIGIN` | Exact comma-separated browser origins permitted by CORS and write-origin checks. |
| `MONGODB_URI` | MongoDB connection string; keep private. |
| `SESSION_SECRET` | Random session-signing secret, minimum 32 characters. |
| `COOKIE_SECURE` | Set `true` behind HTTPS in production. |
| `COOKIE_SAME_SITE` | `lax` works with the documented same-domain reverse proxy. |
| `MAX_UPLOAD_MB` | Maximum gallery image upload size, default `8`. |
| `STORAGE_PROVIDER` | Storage adapter name; `local` is the implemented development adapter. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by the explicit admin creation command. Never place admin credentials in frontend variables. |
| `AI_ENABLED`, `AI_PROVIDER`, `AI_API_KEY` | Future assistant flags and backend-only credentials. No provider adapter is activated by default. |
| `MESSAGING_ENABLED`, `MESSAGING_PROVIDER`, `MESSAGING_API_KEY` | Future messaging integration settings; no paid provider is connected. |
| `VITE_API_URL` | Optional API origin. Leave blank for local Vite proxy and the Vercel rewrite. |
| `VITE_AI_ENABLED`, `VITE_MESSAGING_ENABLED` | Frontend feature flags. Both default to `false`. |
| `VITE_ANALYTICS_ENABLED` | Enables the privacy-conscious `site:pageview` event integration point; no analytics vendor is bundled. |

Do not use a `VITE_` prefix for secrets: Vite exposes those values to browsers.

## Project map

```text
apps/
  web/                 React public site and admin UI
  api/                 Express API, MongoDB models, auth, and services
packages/
  shared/              Zod schemas shared by browser and API
apps/api/uploads/      Local development images (ignored by Git)
```

## Admin and content

- Admin sessions use `httpOnly` cookies persisted in MongoDB, password hashes, login rate limits, CORS allowlisting, and origin checks for writes.
- Create the initial admin with `npm run admin:create`; the script refuses to overwrite an existing account.
- Draft projects and journal posts remain private. Public routes only return published entries.
- Gallery uploads are size-limited, MIME-filtered, checked against image file signatures, pixel-limited, converted into optimized WebP plus a thumbnail, assigned random storage keys, and kept outside MongoDB. SVG uploads are not accepted.
- The local filesystem adapter is for development. A production deployment with ephemeral disks should replace it with a private Cloudinary/R2/S3 adapter before enabling gallery uploads.
- Contact messages are validated, rate-limited, stored in MongoDB, and accessible in the protected inbox. The form includes a honeypot; configure additional edge-level bot protection before a high-traffic launch.

## API overview

All API paths are under `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API/database health |
| `GET` | `/public/settings` | Public intro, availability, and configured links |
| `GET` | `/public/projects` | Published projects; supports `featured=true`, `category`, `q`, and `limit` |
| `GET` | `/public/projects/:slug` | Published project detail |
| `GET` | `/public/posts` | Published journal notes |
| `GET` | `/public/posts/:slug` | Published Markdown note |
| `GET` | `/public/gallery` | Published gallery images |
| `POST` | `/public/contact` | Submit a validated contact message |
| `POST` | `/admin/auth/login` | Admin login |
| `GET` | `/admin/auth/me` | Current admin session |
| `POST` | `/admin/auth/logout` | End admin session |
| `GET/POST` | `/admin/projects`, `/admin/posts` | List or create content (admin session required) |
| `PUT/DELETE` | `/admin/projects/:id`, `/admin/posts/:id` | Update or remove content |
| `GET/POST/DELETE` | `/admin/gallery` | List/upload/remove images |
| `GET/PATCH/DELETE` | `/admin/messages` | Read/manage contact messages |
| `GET/PUT` | `/admin/settings` | Read/update public profile settings |
| `POST` | `/assistant/messages` | Disabled future-assistant endpoint; returns an explicit unavailable response until configured |
| `POST` | `/messaging/messages` | Disabled future-messaging adapter endpoint |

Admin paths require the session cookie. Write requests must include an allowed `Origin`. JSON request bodies are limited to 32 KB.

## Build and checks

```powershell
npm run build
npm test
npm run lint
```

## Deployment outline

1. Deploy `apps/api` to a Node.js host with MongoDB Atlas access, HTTPS, and a persistent service. Set the API environment variables there. Use a private database user with only the required database permissions and restrict Atlas network access.
2. Point `api.aalokbhatta.com` to that API host and configure TLS.
3. Deploy the Vite frontend to Vercel and attach `aalokbhatta.com` and `www.aalokbhatta.com`. The root `vercel.json` proxies `/api/*` and `/uploads/*` to `api.aalokbhatta.com`, then falls back to the SPA entry point.
4. Set API `WEB_ORIGIN` to the exact deployed website origins, `COOKIE_SECURE=true`, and retain `COOKIE_SAME_SITE=lax`. The same-origin Vercel proxy keeps browser sessions on the site origin.
5. Configure MongoDB Atlas, test admin login and message delivery, and choose durable object storage before enabling production image uploads. Never assume a serverless frontend deployment provides persistent filesystem storage or WebSocket support.

`robots.txt` and the starter `sitemap.xml` are in the web public directory. The sitemap contains stable top-level routes; update it or generate it from published slugs as the project and journal grow. Page metadata is updated client-side; for dependable per-article Open Graph previews across non-JavaScript crawlers, add pre-rendering/SSR or a metadata-aware edge renderer before promoting those URLs.

## Future integrations

The assistant UI and API adapter are isolated and feature-flagged. It returns an explicit unavailable error unless an actual provider adapter and backend-only key are configured; it does not invent answers. Messaging has a separate disabled UI/API adapter and conversation/message models. Before enabling real-time messaging, add provider authentication, persistent storage, visitor identity verification, spam controls, and a host/provider designed for real-time connections.

Analytics is deliberately off by default. When enabled, the app emits a `site:pageview` browser event only when Do Not Track is not set; connect a privacy-respecting provider through `apps/web/src/lib/analytics.js` after deciding on consent and retention.
