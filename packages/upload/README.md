# `@sometic/upload`

Upload and download queue state for Sometic: file items with status and progress, a concurrency limit, pause and resume, cancel through `AbortSignal`, retry, accept and size validation, and a pluggable `UploadTransport`.

`createUploadController` owns the queue. It never talks to the network itself, so you can back it with `fetch`, XHR for byte accurate progress, a signed S3 URL, a resumable protocol, or a fake transport in tests. `createHttpUploadTransport` ships as a small `fetch` based default and touches the global `fetch` only when an upload actually runs, which keeps the module import safe on the server.

Why it exists: the file `<input>` is one problem and the network lifecycle is another. [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) owns the input and dropzone behavior; this package owns queueing, progress, retries, and cancellation so every framework shares one state machine.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core); [`@sometic/http`](https://www.npmjs.com/package/@sometic/http) is an optional peer for teams that want their interceptors and auth refresh in the transport.

Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [https://sometic.aitistack.com](https://sometic.aitistack.com).

## Install

```bash
pnpm add @sometic/upload
```

```bash
npm install @sometic/upload
```

```bash
yarn add @sometic/upload
```

## Usage

Queue files against an HTTP endpoint:

```ts
import { createHttpUploadTransport, createUploadController } from "@sometic/upload";

const uploads = createUploadController({
    transport: createHttpUploadTransport({ url: "/api/files" }),
    concurrency: 3,
    accept: ["image/*", ".pdf"],
    maxBytes: 10 * 1024 * 1024,
    onChange: (items) => render(items),
});

input.addEventListener("change", () => {
    uploads.addFiles(Array.from(input.files ?? []));
});
```

Control a single item:

```ts
uploads.pause(id);
uploads.resume(id);
uploads.cancel(id);
uploads.retry(id);
uploads.remove(id);
```

Write your own transport, for example with XHR progress:

```ts
import type { UploadTransport } from "@sometic/upload";

const transport: UploadTransport = {
    upload: (file, { signal, onProgress }) =>
        new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    onProgress(event.loaded / event.total);
                }
            });
            signal.addEventListener("abort", () => request.abort());
            request.addEventListener("load", () => resolve({ url: request.responseText }));
            request.addEventListener("error", () => reject(new Error("Upload failed")));
            request.open("POST", "/api/files");
            request.send(file);
        }),
};
```

Download a file:

```ts
import { downloadFromUrl } from "@sometic/upload";

await downloadFromUrl("/api/files/42", { saveAs: "invoice.pdf" });
```

## API

- `UploadItemStatus`: `queued`, `uploading`, `paused`, `success`, `error`, `canceled`.
- `createUploadController({ transport, concurrency?, accept?, maxBytes?, allowEmptyFiles?, autoStart?, maxAttempts?, onChange?, onItemSuccess?, onItemError? })` exposes `getItems`, `getItem`, `getSummary`, `addFiles`, `start`, `remove`, `clear`, `retry`, `cancel`, `pause`, `resume`, `subscribe`, `dispose`.
- Rejected files still enter the list with status `error` and a typed error, so the UI can explain why a drop was refused instead of silently dropping it.
- `createHttpUploadTransport(options)`, `resolveUploadFetch(fetchImpl?)`, `matchesAcceptRule(file, accept)`.
- `downloadBlob(blob, filename)` and `downloadFromUrl(url, { signal?, saveAs?, headers?, fetchImpl? })`.

Zero byte files upload normally. Set `allowEmptyFiles: false` to reject them instead.

## When not to use

Skip it for a single fire and forget `POST` with no progress, retry, or queue. Prefer a vendor SDK when you need multipart resumable uploads with server side session bookkeeping, then wrap that SDK in an `UploadTransport` so the queue stays portable.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [HTTP client](https://sometic.aitistack.com/utilities/http)

## License

MIT
