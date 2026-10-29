# API and database contracts

The browser API is still a local demo. These are the Supabase and FastAPI contracts prepared for integration.

## Supabase RPCs

### `request_access`

Arguments: `{target_type, student_id?, team_id?, scope, scope_id?, message?}`. Organizer-only. Returns a request UUID and notifies the student/team owner.

### `decide_request`

Arguments: `{request_id, approve, expiry}`. Target student or active team member only. `expiry` is an interval such as `24 hours`, `7 days`, or `30 days`; an approved request gets an `expires_at` timestamp.

### `revoke_request`

Arguments: `{request_id}`. Target student/team member only; moves the request to revoked and notifies the organizer.

### `get_locked_student`

Arguments: `{target}`. Requires an active all-profile grant; records the request ID, organizer, resource and timestamp in `access_logs`, then returns only USN and masked Aadhaar last four digits.

### `respond_invite`

Arguments: `{invite_id, accept}`. Invitee only; accepts or declines a student/team event invitation.

## FastAPI

All non-health endpoints require `Authorization: Bearer <Supabase access token>` validated with the configured HS256 JWT secret.

### `POST /summarize-repo`

Request: `{"url":"https://github.com/owner/repository"}`

Response: `{"description":"A short project summary.","tags":["AI / ML","Civic tech"]}`

Errors: `400 unsupported_repository|invalid_repository_url`, `401 missing_bearer_token|invalid_bearer_token`, `404 readme_unavailable_or_private`, `429 github_rate_limited`, `502 github_unavailable|summarizer_unavailable|invalid_model_response`, `503 auth_not_configured|summarizer_not_configured`.

### `POST /aadhaar/encrypt`

Request: `{"number":"123412341234"}`

Response: `{"ciphertext":"<base64url v1 nonce+ciphertext>","last4":"1234"}`

Errors: Pydantic `422` for invalid 12-digit input; `401` for missing/invalid bearer token; `500 invalid_encryption_key`; `503 auth_not_configured|encryption_not_configured`.

The AES key is a base64url-encoded 32-byte environment variable. Plain Aadhaar is not logged or persisted by the API. Deploy behind TLS and configure request-size/rate limits.
