# Scaling the backend

The API is stateless between requests. Access JWTs are self-contained; refresh-session hashes and application data live in PostgreSQL; cache and rate-limit state are shared through Redis. This lets replicas serve requests interchangeably behind the proxy.

The Compose overlay assumes `docker-compose.yaml` defines the PostgreSQL and Redis services, and that environment values are supplied outside the image. Set `DATABASE_URL_DOCKER` to a PostgreSQL address reachable from the containers (for the Compose database service, use host `postgres`, not `localhost`). A one-shot migration service applies pending Prisma migrations before the API replicas start. Keep `NODE_ENV=production` and configure Turnstile secrets for production; local development may use `NODE_ENV=development`.

Example from the repository root:

```sh
docker compose -f docker-compose.yaml -f deploy/docker-compose.scale.yaml up --build --scale api=3
```

Nginx uses Docker DNS discovery with periodic refresh and `least_conn`; Compose health checks gate startup on PostgreSQL, Redis, and API readiness. Keep one trusted proxy hop configured for this topology; increase `TRUST_PROXY_HOPS` only when another known proxy is placed in front. Do not expose the API replicas directly to the public network. Terminate TLS at a trusted external load balancer or add TLS certificates to the Nginx service before exposing this sample publicly.

For managed deployments, run multiple identical API instances behind the provider's HTTP load balancer, point all instances at the same PostgreSQL and Redis services, and configure forwarded headers/trusted proxy hops for the actual topology. Each replica defaults to a PostgreSQL pool maximum of five (`DATABASE_POOL_MAX`); size the aggregate (`replicas × pool max`) below the database connection budget. The example is a starting configuration; production capacity still needs load testing.

## Session client contract

- Login responds with `accessToken`, `refreshToken`, `tokenType`, and `expiresIn` (900 seconds); it also places the access token in the `Authorization` response header.
- Refresh with `POST /auth/refresh` and `{ "refreshToken": "..." }`. Each successful call rotates the refresh token; discard the old token immediately.
- Logout with `POST /auth/logout` and the current refresh token.
- Store refresh tokens in Keychain/Keystore or another secure client store. Do not log either token.

## OTP client contract

Confirm with `POST /auth/signup/verify` and `{ "email": "...", "code": "123456" }`. The server verifies this exact pair with Supabase and activates the pending local user for that email. The previous GET endpoint can temporarily accept `?email=...` for clients during migration; a code-only request is no longer sufficient.
