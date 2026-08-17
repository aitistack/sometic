---
"@sometic/auth": patch
"@sometic/auth-oidc": patch
"@sometic/auth-supabase": patch
"@sometic/auth-local": patch
"@sometic/http": patch
"@sometic/eslint-config": patch
---

Harden client auth and HTTP so tokens stay out of errors and BroadcastChannel can omit them, OIDC redirect matching is exact with S256-only PKCE, Supabase redirectTo is allowlisted, and login/refresh URLs never receive Bearer.
