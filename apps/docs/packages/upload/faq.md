# Upload FAQ

## How do I install it?

```bash
pnpm add @sometic/upload
```

React dropzone: `@sometic/react/data` + `@sometic/dom/upload`. Peer: `@sometic/core`.

## What is a transport?

Any `{ upload(file, { signal, onProgress }) }` implementation. `createHttpUploadTransport({ url })` posts multipart `FormData`. Inject `fetchImpl` when `fetch` is unavailable.

## How do accept and maxBytes work?

`accept` rules are MIME or extensions (`matchesAcceptRule`). `maxBytes` rejects oversized files on add. Empty files rejected unless `allowEmptyFiles`.

## Cancel, pause, retry?

Controller supports cancel (aborts signal), pause, and retry from `error` / `canceled`. React list wires cancel/retry buttons.

## Concurrency?

Set `concurrency` on the controller / `UploadDropzone`. Queued items start as slots free when `autoStart` is enabled.

## Downloads?

`downloadBlob` and `downloadFromUrl` help with download UX; they are separate from the upload queue.

## SSR?

Do not touch `File` / drag events on the server. Create controllers in effects or Vanilla entry scripts.

## Accessibility?

Dropzone resolve uses `role="button"` and keyboard open. List is a live region. Keep cancel/retry labelled.

## Security?

Validate MIME/size again on the server. Do not trust client `accept`. Use auth headers via transport `headers` / cookies carefully (CSRF).

## More help?

[Comparison](./comparison) · [Troubleshooting](./troubleshooting) · [Component](/components/upload).
