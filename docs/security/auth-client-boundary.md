# Auth client boundary (draft)

Status: draft (Phase 10). Hardening continues in later security phases.

Client-side auth orchestration is a **convenience and UX layer**. Attackers who can run script in the page can:

- Read tokens from any non-httpOnly storage
- Call `can()` and ignore the result
- Trigger refresh / sign-out

Mitigations live primarily on the server (session cookies, CSRF, short-lived access tokens, binding refresh tokens, anomaly detection). Document storage tradeoffs in consumer FAQ/security pages whenever recommending browser storage.
