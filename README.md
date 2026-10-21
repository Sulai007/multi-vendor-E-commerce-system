# Multi-Vendor E-Commerce System

A multi-vendor commerce API built with TypeScript and Express. It supports account authentication, vendor onboarding, business and product management, customer orders, refunds, and administrative workflows.

This repository contains the backend only. Frontend applications are maintained separately and are intentionally excluded from this repository.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Requirements](#requirements)
- [Backend setup](#backend-setup)
- [Environment variables](#environment-variables)
- [Database and category setup](#database-and-category-setup)
- [Running and testing](#running-and-testing)
- [API overview](#api-overview)
- [Authentication and permissions](#authentication-and-permissions)
- [Caching and reliability](#caching-and-reliability)
- [Data model overview](#data-model-overview)
- [Contributing](#contributing)

## Features

- Email/password account registration and login, email OTP verification, password reset, refresh tokens, and logout.
- Role-based authorization for regular users, vendors, and administrators.
- Vendor business registration, profile updates, and business verification/status management.
- Product creation, image upload, category assignment, inventory updates, and product visibility status.
- Product discovery by business, category, and search.
- Order creation and cancellation, per-business order item management, and status updates.
- Refund request creation, status transitions, and email notifications.
- Admin workflows for users, businesses, products, orders, refunds, settings, metrics, and API logs.
- Redis caching for catalog/business reads, with cache invalidation on relevant writes.
- Request validation, rate limiting on selected authentication endpoints, and idempotency protection on selected mutations.
- OpenAPI/Swagger UI, structured logging, and API request log persistence.

## Technology

| Area | Technology |
| --- | --- |
| API runtime | Node.js, Express 5 |
| Language | TypeScript |
| Database and ORM | PostgreSQL, Sequelize |
| Cache | Redis (`redis` / node-redis client) |
| Authentication | JWT, bcrypt, OTP and refresh-token records |
| Validation | Zod |
| Product images | Cloudinary |
| Email | Nodemailer |
| API docs | OpenAPI 3 and Swagger UI |

## Repository layout

```text
.
├── codingBackend/
│   ├── src/
│   │   ├── config/        # Database, Redis, mail, Cloudinary, environment
│   │   ├── controllers/   # HTTP request/response handlers
│   │   ├── docs/          # OpenAPI/Swagger configuration
│   │   ├── email/         # Email templates and delivery helpers
│   │   ├── helper/        # Password, OTP, token and upload helpers
│   │   ├── middleware/    # Auth, validation, rate limits, idempotency, errors
│   │   ├── models/        # Sequelize models and associations
│   │   ├── routes/        # Auth, customer, vendor and admin routes
│   │   ├── schema/        # Zod request schemas
│   │   ├── services/      # Business logic and cache helpers
│   │   └── index.ts       # API startup and route registration
│   ├── migrations/        # Sequelize database migrations
│   ├── scripts/           # Utility scripts, including category seeding
│   ├── tests/             # Jest tests
│   └── package.json
└── codingBackend/
    ├── src/               # API source code
    ├── migrations/        # Sequelize database migrations
    ├── scripts/           # Utility scripts, including category seeding
    ├── tests/             # Jest tests
    └── package.json
```

All commands in this README are run from `codingBackend/`.

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL
- Redis
- Cloudinary account and API credentials
- SMTP service credentials for email features

## Backend setup

From the repository root:

```powershell
cd codingBackend
npm install
```

Create a `codingBackend/.env` file using the variables below. The application loads `.env` relative to the current working directory, so run backend commands from `codingBackend`.

## Environment variables

The API validates its environment on startup. Variables marked **required** must be set; the others use the listed defaults.

| Variable | Required | Default / description |
| --- | --- | --- |
| `NODE_ENV` | No | `development`; accepted values: `development`, `test`, `production` |
| `PORT` | No | `3000` |
| `APP_NAME` | No | `My Coding Api`; OpenAPI title |
| `API_BASE_URL` | No | `http://localhost:3000`; OpenAPI server URL |
| `CORS_ORIGIN` | No | `*`; one origin or comma-separated origins |
| `DB_HOST` | Yes | PostgreSQL hostname |
| `DB_PORT` | No | `5432` |
| `DB_NAME` | Yes | PostgreSQL database name |
| `DB_USER` | Yes | PostgreSQL username |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_SSL` | No | `false` |
| `DB_LOGGING` | No | `false`; enables SQL logging when `true` |
| `JWT_ACCESS_SECRET` | Yes | Secret of at least 16 characters |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` |
| `JWT_REFRESH_SECRET` | Yes | Secret of at least 16 characters |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` |
| `JWT_RESET_SECRET` | Yes | Secret of at least 16 characters |
| `JWT_RESET_EXPIRES_IN` | No | `10m` |
| `BCRYPT_SALT_ROUNDS` | No | `12`; allowed range is 4–15 |
| `OTP_LENGTH` | No | `6`; allowed range is 4–10 |
| `OTP_EXPIRES_IN_MINUTES` | No | `10` |
| `OTP_MAX_ATTEMPTS` | No | `5` |
| `OTP_RESEND_COOLDOWN_SECONDS` | No | `60` |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | No | `587` |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASSWORD` | Yes | SMTP password |
| `SMTP_SECURE` | No | `false` |
| `MAIL_FROM_NAME` | No | `My Coding Api` |
| `MAIL_FROM_ADDRESS` | Yes | Valid sender email address |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `REDIS_URL` | Yes | Redis connection URL, e.g. `redis://localhost:6379` |

Example development configuration (replace every placeholder; do not commit real credentials):

```dotenv
NODE_ENV=development
PORT=3000
APP_NAME=Multi-Vendor E-Commerce API
API_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=multi_vendor_ecommerce
DB_USER=postgres
DB_PASSWORD=replace_with_local_database_password
DB_SSL=false
DB_LOGGING=false

JWT_ACCESS_SECRET=replace_with_a_random_secret_at_least_16_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_with_a_different_random_secret_at_least_16_chars
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_SECRET=replace_with_another_random_secret_at_least_16_chars
JWT_RESET_EXPIRES_IN=10m

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_SECURE=false
MAIL_FROM_NAME=Multi-Vendor E-Commerce
MAIL_FROM_ADDRESS=no-reply@example.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

REDIS_URL=redis://localhost:6379
```

Generate distinct strong values for all JWT secrets. Do not use the example placeholders in a deployed environment.

## Database and category setup

The backend uses PostgreSQL through Sequelize. In non-production environments, startup authenticates and synchronizes the models (`sequelize.sync({ alter: true })`). In production, this automatic model alteration is disabled; apply schema changes using the project’s migration workflow before deploying.

From `codingBackend/`:

```powershell
npm run migrate
```

To seed the predefined product categories:

```powershell
npm run seed:categories
```

The seed script inserts categories only when their names do not already exist.

## Running and testing

From `codingBackend/`:

```powershell
# Start the development API with automatic restart
npm run dev

# Compile TypeScript into dist/
npm run build

# Run the compiled API
npm start

# Run the Jest test suite
npm test
```

At startup, the API connects to PostgreSQL and Redis, then verifies Redis with a `PING`/`PONG` check before listening on the configured port.

Useful local URLs:

- Health response: `http://localhost:3000/`
- Swagger UI: `http://localhost:3000/api-docs`

## API overview

All API routes are rooted at `/api`. Request bodies and query parameters are validated using Zod schemas. Successful responses use a JSON envelope with `success`, `message`, and (when applicable) `data` and `pagination`. Errors are handled by the shared error middleware.

Pagination parameters are `page` and `limit`; defaults are page `1` and limit `10`, and the maximum limit is `100`.

### Authentication — `/api/auth`

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Register an account |
| `POST` | `/login` | Authenticate and obtain tokens |
| `POST` | `/verify-otp` | Verify an email OTP |
| `POST` | `/resend-otp` | Request another OTP |
| `POST` | `/forgot-password` | Start password reset |
| `POST` | `/reset-password` | Reset a password |
| `POST` | `/refresh-token` | Rotate/refresh authentication tokens |
| `POST` | `/logout` | Revoke a refresh token (authentication required) |
| `GET` | `/me` | Get the authenticated account |

Registration, login, OTP, and forgot-password routes have rate limiting configured.

### Customer — `/api/customer`

All customer routes require a valid bearer access token.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/get-businesses` | Browse businesses |
| `GET` | `/get-business/:businessId` | Get a business and its products |
| `GET` | `/:businessId/products` | List products for a business |
| `GET` | `/:businessId/product/:productId` | Get one product |
| `GET` | `/search-products?q=...` | Search products |
| `GET` | `/category/:categoryId/products` | Browse products by category |
| `POST` | `/create-order` | Create an order |
| `POST` | `/:orderid/:prodId/add-to-order` | Add a product to an order |
| `PATCH` | `/orders/:orderId/cancel` | Cancel an order |
| `POST` | `/order-items/:orderItemId/refund-requests` | Request a refund for an order item |

### Vendor — `/api/business`

All vendor routes require authentication; routes that change or expose vendor-only resources also apply role authorization.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Register a business |
| `GET` | `/profile/:id` | Get a business profile (vendor or admin) |
| `PATCH` | `/:id` | Update a business |
| `POST` | `/:businessId/add-products` | Add a product; accepts a multipart `image` upload |
| `GET` | `/:businessId/products` | List products for the vendor |
| `PATCH` | `/:businessId/products/:id` | Update a product |
| `DELETE` | `/:businessId/products/:id` | Delete a product |
| `GET` | `/:businessId/orders` | List vendor order items, optionally filtered by status |
| `PATCH` | `/:businessId/orders/:itemId/status` | Update an order-item status |
| `GET` | `/:businessId/refund-requests` | List vendor refund requests |
| `PATCH` | `/:businessId/refund-requests/:refundRequestId/status` | Update refund status |

### Admin — `/api/admin`

Admin routes require authentication and the `admin` role. Some log operations also require the separate administrator access password.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/logs` | Retrieve paginated API logs (access password required) |
| `POST` | `/logs` | Retrieve paginated API logs (access password required) |
| `POST` | `/accessPassword` | Set/update the administrator access password |
| `GET` | `/users` | List users |
| `GET` | `/users/:userId` | Get a user |
| `PATCH` | `/users/:userId/role` | Change a user role |
| `PATCH` | `/users/:userId/status` | Change account active status |
| `GET` | `/businesses` | List businesses |
| `GET` | `/businesses/:businessId` | Get a business |
| `PATCH` | `/businesses/:businessId/verify` | Verify or reject a business |
| `PATCH` | `/businesses/:businessId/status` | Change business status |
| `GET` | `/products` | List products |
| `GET` | `/products/:productId` | Get a product |
| `PATCH` | `/products/:productId/status` | Change product status |
| `GET` | `/orders` | List orders |
| `GET` | `/orders/:orderId` | Get an order |
| `PATCH` | `/orders/:orderId/status` | Change order status |
| `GET` | `/refund-requests` | List refund requests |
| `PATCH` | `/refund-requests/:refundRequestId/status` | Change refund status |
| `GET` | `/dashboard/summary` | Get dashboard counts and revenue summary |
| `GET` | `/metrics` | Get grouped operational metrics |
| `GET` | `/settings` | Get application settings |
| `PATCH` | `/settings` | Update an application setting |

For the canonical request/response schemas and complete endpoint documentation, use Swagger UI at `/api-docs`.

## Authentication and permissions

- Send access tokens using the `Authorization: Bearer <access-token>` header.
- The API has three account roles: `user`, `vendor`, and `admin`.
- Customer and vendor write endpoints use idempotency middleware where configured. When retrying an identical supported operation, send the same `Idempotency-Key` header; use a new key for a new operation.
- Request validation and role authorization are applied by route middleware. A valid token alone does not grant vendor or admin access.

## Caching and reliability

- Redis is required for API startup and is checked with `PING` before the server starts accepting requests.
- The Redis client uses a 30-second connection timeout, a bounded reconnect strategy, and a 15-second command timeout.
- Customer-facing catalog/business read results use Redis cache keys under the `catalog:` namespace. Vendor profile and vendor product-list entries use `vendor:` keys.
- Relevant business, product, and inventory changes invalidate the associated keys; catalog entries also have a TTL.
- Redis client events and application errors are logged through the project logger.

## Data model overview

The Sequelize models currently include:

- **User** — account identity, role, email verification, and active status.
- **Otp**, **RefreshToken**, **BlacklistedToken** — verification and authentication lifecycle records.
- **vendorBusiness** — vendor-owned business profile and status.
- **product**, **Category** — products, product status, inventory, and category associations.
- **Order**, **OrderItem** — customer orders and per-business line items.
- **ReturnRequest** — refund requests associated with order items, customers, and businesses.
- **Idempotency** — persisted request idempotency records.
- **apiLogs**, **appSetting** — API request logs and application settings.

## Contributing

1. Create a feature branch.
2. Make a focused change and add/update tests or documentation as appropriate.
3. Run the relevant build and test commands.
4. Open a pull request describing the change and validation performed.

Do not commit `.env` files, credentials, generated secrets, or production data.
