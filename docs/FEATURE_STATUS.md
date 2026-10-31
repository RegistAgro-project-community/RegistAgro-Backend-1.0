# Backend feature status

## Implemented

- Authentication passwords use Argon2id; successful bcrypt logins upgrade the stored hash.
- Turnstile verification supports the `auth` action and configured hostname.
- Signup/login CAPTCHA tokens are sent as `captchaToken`; NIF signup sends `X-Captcha-Token` because that endpoint remains a GET.
- Redis backed rate limits are used when `REDIS_URL` is configured. Authentication limits are keyed by IP and a keyed HMAC of the normalized email/NIF; the raw identity is not stored in Redis keys.
- Ownership filters protect transport, location and delivery flow queries.
- API schemas reject unknown body fields; route IDs, rules, vehicle types, NIFs, OTPs and coordinates are validated.
- Geocoding uses a fixed Geoapify host, rejects redirects, times out and checks Angola coordinate bounds.
- Health and readiness endpoints report dependency availability without exposing details.
- Consumer product catalog reads use a short Redis cache with invalidation after writes and database fallback when Redis is unavailable.
- Login returns a 15-minute access token and a rotating, opaque 30-day refresh token; only the SHA-256 hash of each refresh token is persisted in PostgreSQL.
- OTP confirmation is bound to the email and code supplied together. Pending account identity is resolved in PostgreSQL by email; OTP email delivery and validation remain with Supabase.
- The API is stateless across instances. `deploy/nginx.conf` and `deploy/docker-compose.scale.yaml` provide a shared Redis/PostgreSQL-backed Nginx load-balancing example.

## Simulated or unavailable

- Payment references and balance settlement remain simulated in development. Production order creation, payment confirmation and ledger release fail with HTTP 503 until a real gateway is integrated.
- The commission split is configurable through `PAYMENT_TRANSPORT_PERCENT` and `PAYMENT_REGISTAGRO_PERCENT`; there is no admin configuration screen yet.
- No payment gateway, webhook receiver, refunds, payment idempotency, or PCI integration is active.
- Signup still uses Supabase OTP and an external mailbox deliverability check; queued business email templates, preferences and a dead letter queue are not implemented.
- Clients must update OTP confirmation to send both `email` and `code` to `POST /auth/signup/verify`; the legacy GET route is temporarily supported with an `email` query parameter.
- Clients must save the returned refresh token in secure platform storage and call `POST /auth/refresh` before/after access-token expiry. `POST /auth/logout` revokes that refresh session; already-issued access tokens remain valid for at most 15 minutes.
- Push notifications, webhooks, metrics, distributed tracing, Sentry, CI security scanning and deployment secret rotation require additional work and/or provider credentials.

In production, set `SECRET_KEY` (at least 32 characters), `REDIS_URL`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAME`, and both payment split percentages. Configure a newly rotated JWT key in the deployment secret manager; existing sessions will need to authenticate again.
