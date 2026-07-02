# Beauty API — Express

Production-oriented REST API using Express 5, TypeScript, PostgreSQL, Prisma, Zod, internal JWT authorization, Helmet, CORS, rate limiting, and Cloudinary.

Each module separates `*.routes.ts` from `*.controller.ts`. Routes define URLs, authorization, and
validation; controllers contain application and database logic. `src/lib/prisma.ts` exposes one
global `PrismaClient` backed by `PrismaPg` for serverless-safe connection reuse.

Auth.js and its Prisma adapter run in this backend under `/api/auth/*`. Admin routes accept the
Auth.js database session cookie forwarded by the frontend rewrite; the existing short-lived internal
bearer token remains supported for service-to-service compatibility.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env`, use the pooled PostgreSQL URL as `DATABASE_URL`, the direct URL as
   `DIRECT_URL`, then fill secrets, frontend origin, and Cloudinary credentials.
3. `npm run db:generate`
4. `npm run db:migrate`
5. `npm run db:seed`
6. `npm run dev`

Use the exact same `INTERNAL_API_SECRET` in `web`. Public read endpoints return only active/published content. Adding `admin=true` requires an admin bearer token. Writes require `ADMIN`/`SUPER_ADMIN`; `/users` requires `SUPER_ADMIN`.

## Endpoints

| Resource   | Routes                                                                             |
| ---------- | ---------------------------------------------------------------------------------- |
| Status     | `GET /`, `GET /health`                                                             |
| Auth.js    | `/api/auth/providers`, `/api/auth/session`, OAuth callbacks, sign-in, and sign-out |
| Auth       | `GET /auth/me`, `POST /auth/internal-token/verify`                                 |
| Products   | `GET /products`, `GET /products/:slug`, `GET /products/id/:id`, mutations by ID    |
| Categories | `GET /categories`, `GET /categories/id/:id`, mutations by ID                       |
| Banners    | `GET /banners`, `GET /banners/id/:id`, mutations by ID                             |
| Campaigns  | `GET /campaigns`, `GET /campaigns/:slug`, `GET /campaigns/id/:id`, mutations by ID |
| Articles   | `GET /articles`, `GET /articles/:slug`, `GET /articles/id/:id`, mutations by ID    |
| Newsletter | `POST/GET /newsletter`, `DELETE /newsletter/:id`                                   |
| Upload     | `POST /upload` (`multipart/form-data`, field `file`)                               |
| Users      | `GET /users`, `PATCH /users/:id/role`, `DELETE /users/:id`                         |

Product query parameters: `search`, `category`, `sort=price-asc|price-desc`, `bestSeller`, `page`, and `limit`.

## Test

Run `npm run build`, set `API_URL` to the deployed backend URL, and check
`curl "$API_URL/health"`. A write without `Authorization: Bearer <internal-token>` must return 401.
Tokens are minted by the Next.js BFF; they are never stored in browser storage.

## Vercel

Vercel mendeteksi default export di `src/app.ts` dan menjalankan seluruh Express router sebagai satu
Vercel Function. Pilih `node.js-express.js` sebagai Root Directory dan jangan isi Build Command atau
Output Directory secara manual.

Isi `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `INTERNAL_API_SECRET`, `AUTH_SECRET`,
`AUTH_TRUST_HOST`, seluruh credential OAuth,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, dan `FRONTEND_URL` untuk
Production dan Preview. Gunakan pooled PostgreSQL URL untuk `DATABASE_URL`, lalu jalankan
`npm run db:deploy` sekali untuk menerapkan migration. Detail urutan deployment tiga project ada di
[repository frontend](https://github.com/FarhanZulkarnainHarahap/BLP-Beauty/blob/main/VERCEL_DEPLOYMENT.md).
