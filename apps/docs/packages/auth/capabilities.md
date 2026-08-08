# Auth capabilities

Providers declare a `Set<AuthCapability>`. Orchestration checks capabilities before calling optional methods.

| Capability          | Typical method                                               |
| ------------------- | ------------------------------------------------------------ |
| `signIn`            | `signIn`                                                     |
| `signOut`           | `signOut`                                                    |
| `register`          | `register`                                                   |
| `getSession`        | `getSession`                                                 |
| `refresh`           | `refresh`                                                    |
| `getUser`           | `getUser`                                                    |
| `passwordReset`     | `requestPasswordReset`                                       |
| `emailVerification` | `verifyEmail`                                                |
| `oauth` / `mfa` / … | Provider adapters, [matrix](/packages/auth-providers/matrix) |

Unsupported flows throw `AUTH_UNSUPPORTED`.
