# Upload troubleshooting

## Files never start uploading

Check `autoStart` (default may queue only). Call `start` / ensure React dropzone path calls `addFiles`. Verify transport `upload` resolves and does not hang without `onProgress`.

## Accept rejects valid files

Normalize MIME vs extension rules. Browsers often report empty `file.type` for some extensions; prefer extension rules when needed. Mirror rules on the hidden input `accept` attribute.

## Progress stuck at 0%

HTTP helper relies on the transport calling `onProgress`. XHR-style progress is not automatic with basic `fetch`; provide a custom transport if you need byte-level progress.

## Cancel does nothing visible

Confirm you call `controller.cancel(id)` and that the transport respects `signal`. UI should move to `canceled`.

## `upload_fetch_unavailable`

Pass `fetchImpl` into `createHttpUploadTransport` (tests, non-browser runtimes).

## Memory growth

Dispose controllers on route change. Bound concurrency. Avoid retaining File blobs after success if you only need the returned URL.

## Still stuck?

See [FAQ](./faq) and [component docs](/components/upload).
