# HTTP comparison

| Approach        | Notes                                                         |
| --------------- | ------------------------------------------------------------- |
| `@sometic/http` | Fetch-first, auth-queue aware, framework-thin adapters        |
| Axios           | Popular; heavier default surface; not required here           |
| Raw `fetch`     | Fine until you need shared refresh queues and typed errors    |
| ky / ofetch     | Small fetch wrappers; Sometic adds a shared auth refresh seam |

Choose Sometic when HTTP must share one behavior model with `@sometic/auth` across Vanilla/React/Vue.
