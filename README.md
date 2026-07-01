# Beauty API — Express

Production-oriented REST API using Express 5, TypeScript, PostgreSQL, Prisma, Zod, internal JWT authorization, Helmet, CORS, rate limiting, and Cloudinary.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill PostgreSQL, secrets, frontend origin, and Cloudinary credentials.
3. `npm run db:generate`
4. `npm run db:migrate`
5. `npm run db:seed`
6. `npm run dev`

Use the exact same `INTERNAL_API_SECRET` in `web`. Public read endpoints return only active/published content. Adding `admin=true` requires an admin bearer token. Writes require `ADMIN`/`SUPER_ADMIN`; `/users` requires `SUPER_ADMIN`.

## Endpoints

| Resource   | Routes                                                                                 |
| ---------- | -------------------------------------------------------------------------------------- |
| Health     | `GET /health`                                                                          |
| Auth       | `GET /auth/me`, `POST /auth/internal-token/verify`                                     |
| Products   | `GET /products`, `GET /products/:slug`, `POST /products`, `PATCH/DELETE /products/:id` |
| Categories | `GET/POST /categories`, `PATCH/DELETE /categories/:id`                                 |
| Banners    | `GET/POST /banners`, `PATCH/DELETE /banners/:id`                                       |
| Campaigns  | `GET/POST /campaigns`, `GET /campaigns/:slug`, `PATCH/DELETE /campaigns/:id`           |
| Articles   | `GET/POST /articles`, `GET /articles/:slug`, `PATCH/DELETE /articles/:id`              |
| Newsletter | `POST/GET /newsletter`, `DELETE /newsletter/:id`                                       |
| Upload     | `POST /upload` (`multipart/form-data`, field `file`)                                   |
| Users      | `GET /users`, `PATCH /users/:id/role`, `DELETE /users/:id`                             |

Product query parameters: `search`, `category`, `sort=price-asc|price-desc`, `bestSeller`, `page`, and `limit`.

## Test

Run `npm run build`. Start the server and check `curl http://localhost:4000/health`. A write without `Authorization: Bearer <internal-token>` must return 401. Tokens are minted by the Next.js BFF; they are never browser storage.

## Vercel

Project ini memiliki `api/index.ts` dan `vercel.json` untuk menjalankan seluruh Express router sebagai
satu Vercel Function. Pilih `node.js-express.js` sebagai Root Directory, isi environment variables,
dan gunakan URL PostgreSQL dengan connection pooling. Detail urutan deployment tiga project ada di
[repository frontend](https://github.com/FarhanZulkarnainHarahap/BLP-Beauty/blob/main/VERCEL_DEPLOYMENT.md).
