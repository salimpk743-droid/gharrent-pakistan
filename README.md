# GharRent Pakistan

A Pakistan-wide rental marketplace. People search homes without an account, then sign in with Google to post listings, save favourites and manage their own properties.

**Find a home. Rent with confidence.**

This repository is the production application. The old static HTML / `localStorage` prototype (`index.html` + `app.js`) has been replaced.

Stack: **TanStack Start** (React 19, TypeScript, SSR) — not Next.js. PostgreSQL, Better Auth, Google sign-in, server functions, and indexable pages.

## What exists in this repo

| Area | Path |
| --- | --- |
| App entry / routes | `src/routes/` |
| Listings (create, edit, pause, resume, mark rented, delete) | `src/lib/server/listings.ts` |
| Search / public properties | `src/lib/server/properties.ts` |
| Saved listings | `src/lib/server/favorites.ts` |
| Reports | `src/lib/server/reports.ts` |
| Admin / moderation | `src/lib/server/admin.ts` |
| User profiles / first-admin bootstrap | `src/lib/server/profile.ts` |
| Authorization helpers | `src/lib/authz.ts` |
| Auth (Better Auth, Google + X) | `src/lib/auth/` |
| Auth API | `src/routes/api/auth/$.ts` |
| Image serving | `src/routes/api/images/$id.ts` |
| Schema | `migrations/0001_auth.sql`, `migrations/0002_schema.sql` |
| Pakistan location tree | `src/data/pakistan-locations.ts` |
| SEO sitemap / robots | `src/routes/sitemap[.]xml.ts`, `src/routes/robots[.]txt.ts` |
| Legal / safety | `src/routes/privacy.tsx`, `terms.tsx`, `disclaimer.tsx`, `safety.tsx` |

Listings, accounts, saves, reports and moderation live in **PostgreSQL**. There is **no `localStorage` listing store**. Authorization is enforced on the server using the verified session `userId` — never a client-supplied owner id.

## Listing lifecycle

`DRAFT → PENDING_REVIEW → PUBLISHED`, plus `PAUSED`, `REJECTED`, `RENTED`, `EXPIRED`, and soft-deleted `DELETED`.

- Public search only returns `status = 'PUBLISHED' AND deleted_at IS NULL`.
- Delete sets `status = DELETED` and `deleted_at` — the row is hidden, not physically destroyed.
- Sample homes are stored with `is_sample = true` and labelled **Demo listing**.

## Authorization (server-side)

Every mutating server function uses `authMiddleware`, which resolves `context.userId` from the session cookie (or a preview-only bearer). Typical checks:

- Edit / delete / pause / resume: `canMutateListing(sessionUser, row.owner_id)` then SQL scoped to that listing.
- User A cannot edit or delete User B’s listing.
- Admin routes call `requireStaff()`; a normal user gets 403.
- First profile on a fresh database becomes `ADMIN`. Set `ADMIN_EMAIL` before going live so that is your Google email, not whoever signs in first.

Covered by unit tests in `src/lib/authz.test.ts`. Two-account live OAuth is not run in CI (needs real Google accounts).

## Authentication

Sessions are **HttpOnly `__Host-` cookies** on a real deploy. The only browser storage is a **preview-iframe bearer in `sessionStorage`**, used only on `*.grok-sandbox.com` because partitioned cookies cannot be read there. That token is not used on a normal Vercel / custom-domain deploy.

Two Google sign-in modes:

1. **Grok App Builder / live preview** — Continue with Google federates through the Grok auth broker. No Google Cloud project required in the sandbox.
2. **Independent GitHub → Vercel (or any host)** — set your own Google OAuth client (below). The app then uses Better Auth `socialProviders.google`.

## Local development

```bash
npm install
npm run dev
```

With no `DATABASE_URL`, the app uses embedded PGLite (Postgres in WASM). Schema is applied from `migrations/`. Seed data (Pakistan locations + labelled demo listings) is inserted if the `properties` table is empty.

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm test` includes template-workspace tests that expect auth *off*. This app has auth on, so a few of those template assertions fail. GharRent domain tests (`authz`, listing lifecycle, validation, phone, search, image magic) pass.

## Environment variables

**Never commit secrets.** Do not put a `.env` in git.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Production | Neon / Postgres connection string |
| `BETTER_AUTH_SECRET` | Production | 32+ char secret for signing sessions |
| `BETTER_AUTH_URL` | Production | Public origin, e.g. `https://your-domain.com` |
| `GOOGLE_CLIENT_ID` | Independent deploy | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Independent deploy | Google OAuth client secret |
| `VITE_GOOGLE_CLIENT_ID` | Independent deploy | Same public client ID (selects native Google in the UI) |
| `ADMIN_EMAIL` | Strongly recommended | Google email that is always `ADMIN` |
| `GROK_AUTH_ISSUER` / `GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET` | Grok platform only | Injected by App Builder. Leave unset on your own Vercel. |
| `VITE_AUTH_ENABLED` | — | Must not be `"false"` |

## Database setup (Neon)

1. Create a Neon project and copy the pooled `DATABASE_URL`.
2. Set it on the host. `npm run build` runs `npm run db:migrate`, which applies `migrations/*.sql` in name order.
3. Tables: Better Auth (`user`, `session`, `account`, …) plus `profiles`, `properties`, `property_images`, `favorites`, `reports`, location tables, `audit_log`.

## Google Cloud OAuth setup (independent deploy)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth client ID → Web application.
2. Authorized JavaScript origins: `https://your-domain.com`
3. Authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`
4. Copy client ID and secret into `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `VITE_GOOGLE_CLIENT_ID` (client ID only).
5. OAuth consent screen: app name **GharRent Pakistan**, scopes `email`, `profile`, `openid`.

On the Grok App Builder deploy you can skip this — Google is brokered for you.

## Image storage

Uploads are sniffed by magic bytes (JPEG / PNG / WebP only), size-capped and compressed in the browser. Each row has a `storage_key` (`properties/{listingId}/{imageId}`). Bytes currently live in `property_images.byte_data` and are served at `/api/images/:id` so the marketplace works without S3.

To attach object storage later: write the file to the bucket using `storage_key`, set `url` to the public object URL, and stop writing `byte_data`.

## Admin setup

1. Set `ADMIN_EMAIL` to your Google address **before** the first production sign-in, or sign in first on a fresh database (first profile becomes admin).
2. Open **Account** after sign-in. Staff see Admin.
3. Approve / reject listings, handle reports, suspend users.

There is no shared demo password. There are no mock users.

## Test procedure

Without signing in:

1. Home page loads listings labelled **Demo listing**.
2. Search Lahore → heading “Rental homes in Lahore, Punjab”, real cards.
3. Open a property → gallery, Call, WhatsApp, share, report (report requires sign-in).
4. Phone layout (~390px) has no horizontal scroll.

With Google:

1. **Post a property** → Continue with Google → listing wizard.
2. Submit → pending review or published (if `auto_publish` is on).
3. My listings: Edit, Pause, Resume, Mark rented, Delete.
4. Saved homes persist in Postgres for that account.
5. `/admin` as a normal user → “Admin access required”.
6. Delete a listing → it disappears from public search (soft-delete).

## Known limitations

- **This was previously only in the App Builder preview.** Pushing this commit is what puts it on GitHub `main`.
- Google sign-in on *your* Vercel project needs the Google Cloud client above. The live Grok preview uses the broker and does not need those variables.
- Two-user authorization is unit-tested (`User A` cannot mutate `User B`). End-to-end with two live Google accounts is not automated.
- Image bytes are still in Postgres (`storage_key` is the seam for a bucket).
- Commercial search is not a product yet (label only).
- Agency tables exist; there is no agency dashboard.
- `is_featured` exists; there is no paid checkout.
- Legal pages are drafts for a Pakistani lawyer, not legal advice.
- Demo listings seed only when the `properties` table is empty (preview / first migrate).
- Template workspace tests that expect auth off still fail; that is expected with auth on.

## Security notes

- HTTPS in production
- HttpOnly `__Host-` session cookies
- Parameterized SQL
- Server-side ownership and staff checks
- Image MIME sniffing, not client-supplied types
- Report rate limit
- Audit log for listing and moderation actions
- No secrets in frontend code
