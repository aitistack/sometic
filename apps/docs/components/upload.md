# Upload

Upload queue behavior over `@sometic/upload`: concurrency-limited transfers, per-item progress, cancel, pause, resume, retry with attempt counts, accept and size gates, plus a drag-and-drop dropzone controller in `@sometic/dom/upload`. Transport is pluggable, so the same queue drives `fetch`, XHR, S3 presigned PUT, or a mock in tests. React and Vue ship `UploadDropzone` and `UploadList`.

::: tip System standout: transport boundary
The queue never hardcodes HTTP. You pass `UploadTransport.upload(file, { signal, onProgress })`. Swap `createHttpUploadTransport` for a mock in tests or a presigned PUT in production without rewriting cancel, retry, or list ARIA.
:::

<PreviewUpload />

## Usage

::: code-group

```tsx [React]
import { UploadDropzone, type UploadItem } from "@sometic/react/data";
import { createHttpUploadTransport } from "@sometic/upload";

const transport = createHttpUploadTransport({ url: "/api/uploads" });

export function Example(): JSX.Element {
    return (
        <UploadDropzone
            transport={transport}
            accept="image/png,image/jpeg"
            maxBytes={5 * 1024 * 1024}
            concurrency={2}
            label="Upload screenshots"
            onItemsChange={(items: readonly UploadItem[]) => {
                console.log(items.map((item) => item.status));
            }}
        >
            Drop files or press Enter to browse
        </UploadDropzone>
    );
}
```

```vue [Vue]
<script setup>
import { UploadDropzone } from "@sometic/vue/data";
import { createHttpUploadTransport } from "@sometic/upload";

const transport = createHttpUploadTransport({ url: "/api/uploads" });
</script>

<template>
    <UploadDropzone
        :transport="transport"
        accept="image/png,image/jpeg"
        :max-bytes="5 * 1024 * 1024"
        :concurrency="2"
        label="Upload screenshots"
        @items-change="(items) => console.log(items.map((item) => item.status))"
    >
        Drop files or press Enter to browse
    </UploadDropzone>
</template>
```

```html [Vanilla]
<div id="dropzone">Drop files here or press Enter to browse</div>
<ul id="list"></ul>

<script type="module">
    import {
        createUploadController,
        createUploadDropzoneController,
        resolveUploadItem,
        resolveUploadList,
    } from "@sometic/dom/upload";
    import { createHttpUploadTransport } from "@sometic/upload";

    const dropHost = document.querySelector("#dropzone");
    const listHost = document.querySelector("#list");

    const upload = createUploadController({
        transport: createHttpUploadTransport({ url: "/api/uploads" }),
        concurrency: 2,
        accept: ["image/png", "image/jpeg"],
        maxBytes: 5 * 1024 * 1024,
        onChange: () => render(),
    });

    const picker = document.createElement("input");
    picker.type = "file";
    picker.multiple = true;
    picker.hidden = true;
    picker.addEventListener("change", () => {
        dropzone.handleFileList(picker.files);
        picker.value = "";
    });
    document.body.append(picker);

    const dropzone = createUploadDropzoneController({
        multiple: true,
        accept: "image/png,image/jpeg",
        onFiles: (files) => upload.addFiles(files),
        openFilePicker: () => picker.click(),
    });

    const applyAttributes = (element, attributes) => {
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    };

    const paintDropzone = () => {
        applyAttributes(dropHost, dropzone.resolve({ label: "Upload screenshots" }).attributes);
    };

    dropHost.addEventListener("dragenter", (event) => {
        dropzone.handleDragEnter(event);
        paintDropzone();
    });
    dropHost.addEventListener("dragover", (event) => dropzone.handleDragOver(event));
    dropHost.addEventListener("dragleave", (event) => {
        dropzone.handleDragLeave(event);
        paintDropzone();
    });
    dropHost.addEventListener("drop", (event) => {
        dropzone.handleDrop(event);
        paintDropzone();
    });
    dropHost.addEventListener("click", () => dropzone.open());
    dropHost.addEventListener("keydown", (event) => dropzone.handleKeyDown(event));

    function render() {
        const items = upload.getItems();
        listHost.replaceChildren();
        applyAttributes(listHost, resolveUploadList({ count: items.length }).attributes);

        for (const item of items) {
            const view = resolveUploadItem({
                id: item.id,
                status: item.status,
                progress: item.progress,
                name: item.name,
            });
            const entry = document.createElement("li");
            applyAttributes(entry, view.attributes);

            const progress = document.createElement("span");
            applyAttributes(progress, view.progressAttributes);
            progress.textContent = `${view.percent}%`;

            const action = document.createElement("button");
            action.type = "button";
            const retryable = item.status === "error" || item.status === "canceled";
            action.textContent = retryable ? "Retry" : "Cancel";
            action.addEventListener("click", () => {
                if (retryable) {
                    upload.retry(item.id);
                    return;
                }
                upload.cancel(item.id);
            });

            entry.append(document.createTextNode(item.name), progress, action);
            listHost.append(entry);
        }
    }

    paintDropzone();
    render();
</script>
```

```html [Custom Elements (Web Components)]
<!-- CE not shipped for this surface. Use React, Vue, or @sometic/dom (Vanilla) above. -->
```

```html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
```
:::

> Custom element not shipped for data surfaces in this beta; use the DOM controllers or the React and Vue components.

Custom element **not shipped** for Upload. Vanilla uses `@sometic/dom/upload` (which re-exports the queue from `@sometic/upload`). React ships `UploadDropzone` and `UploadList` from `@sometic/react/data`, Vue the same names from `@sometic/vue/data`. For a plain single-file form control see [File input](/components/file-input).

## How it works

1. **Queue (`createUploadController`)**: `addFiles` validates each file against `accept` and `maxBytes`, creates items with `queued` status, and starts transfers up to `concurrency`. Rejected files still enter the list with status `error` and a typed error so the user sees why.
2. **Transport contract**: `upload(file, { signal, onProgress })` returns `{ url? }`. Progress is a number from 0 to 1 that you report. `createHttpUploadTransport` posts `FormData` through `fetch`, throws `upload_request_failed` on a non-ok response, and parses a JSON `url` when the response is JSON.
3. **Item lifecycle**: `queued` then `uploading` then `success`, or `error`, `canceled`, or `paused`. Each run increments `attempts`; with `maxAttempts` above `0` a failure re-queues automatically until that ceiling. `cancel` and `pause` abort the in-flight request through its `AbortSignal`, `retry` clears the error and re-queues.
4. **Dropzone (`createUploadDropzoneController`)**: keeps a drag depth counter (so a child element entering does not clear the drag state), reads files from `dataTransfer.files` or `dataTransfer.items`, exposes `resolve()` for `role="button"`, `tabindex`, `data-dragging`, and `data-state`, and opens your hidden file input on click, Enter, or Space.
5. **Resolve (`@sometic/dom/upload`)**: `resolveUploadList` gives `role="list"` with a polite live region and `data-count`; `resolveUploadItem` gives `data-status`, `data-progress`, `aria-busy` while uploading, and a `progressAttributes` bag with `role="progressbar"` plus `aria-valuenow` and `aria-valuetext`.
6. **Adapters**: React and Vue `UploadDropzone` own both controllers, render a hidden `<input type="file">`, forward drag and keyboard events, render `UploadList` for you, and dispose both controllers on unmount.
7. **Downloads**: `downloadBlob(blob, filename)` and `downloadFromUrl(url, { saveAs, headers, signal })` live in the same package for the symmetric case.

## Anatomy

| Part         | `data-slot`  | Role / notes                                                             |
| ------------ | ------------ | ------------------------------------------------------------------------ |
| Wrapper      | `upload`     | React and Vue wrapper around dropzone, input, and list                   |
| Dropzone     | `dropzone`   | `role="button"`, `tabindex`, `data-dragging`, `data-state`               |
| Hidden input | `file-input` | Real `<input type="file">`, keeps native picker and a11y                 |
| List         | `list`       | `role="list"`, `aria-live="polite"`, `data-count`, `data-empty`          |
| Item         | `item`       | `data-status`, `data-progress`, `aria-busy` while uploading              |
| Item name    | `name`       | File name text                                                           |
| Progress     | `progress`   | `role="progressbar"` with `aria-valuenow` and `aria-valuetext`           |
| Cancel       | `cancel`     | Shown while queued, uploading, or paused                                 |
| Retry        | `retry`      | Shown for `error` and `canceled` items (React reuses `cancel` slot text) |

## Props / attributes

### React `UploadDropzoneProps`

Extends `HTMLAttributes<HTMLDivElement>` minus `children`. Remaining native attrs land on the dropzone element.

| Prop            | Type                                     | Default          | Description                                     |
| --------------- | ---------------------------------------- | ---------------- | ----------------------------------------------- |
| `transport`     | `UploadTransport`                        | **required**     | How bytes leave the browser                     |
| `accept`        | `string`                                 | -                | Comma-separated rules, also split for the queue |
| `multiple`      | `boolean`                                | `true`           | Single-file mode keeps only the first file      |
| `maxBytes`      | `number`                                 | -                | Per-file size gate                              |
| `concurrency`   | `number`                                 | queue default    | Parallel transfers                              |
| `disabled`      | `boolean`                                | `false`          | Blocks drop, click, and keyboard opening        |
| `label`         | `string`                                 | `"Upload files"` | `aria-label` on the dropzone                    |
| `onItemsChange` | `(items: readonly UploadItem[]) => void` | -                | Fires on every queue change                     |
| `children`      | `ReactNode`                              | default text     | Dropzone content                                |

### React `UploadListProps`

| Prop         | Type                      | Default      | Description                          |
| ------------ | ------------------------- | ------------ | ------------------------------------ |
| `items`      | `readonly UploadItem[]`   | **required** | Items to render                      |
| `controller` | `UploadController`        | -            | Enables the cancel and retry buttons |
| `label`      | `string`                  | `"Uploads"`  | `aria-label` on the list             |
| Native attrs | remaining `ul` HTML attrs | -            | Forwarded to the list                |

### `CreateUploadControllerOptions`

| Option            | Type                            | Default      | Description                                                           |
| ----------------- | ------------------------------- | ------------ | --------------------------------------------------------------------- |
| `transport`       | `UploadTransport`               | **required** | Transfer implementation                                               |
| `concurrency`     | `number`                        | `3`          | Max simultaneous uploads                                              |
| `accept`          | `string[]`                      | -            | Extension (`.png`), mime (`image/png`), or wildcard (`image/*`) rules |
| `maxBytes`        | `number`                        | -            | Per-file size gate                                                    |
| `allowEmptyFiles` | `boolean`                       | `true`       | Set `false` to reject zero-byte files                                 |
| `autoStart`       | `boolean`                       | `true`       | Start transfers when files are added                                  |
| `maxAttempts`     | `number`                        | `0`          | Automatic re-queue ceiling per item (`0` disables it)                 |
| `onChange`        | `(items: UploadItem[]) => void` | -            | Any queue change                                                      |
| `onItemSuccess`   | `(item: UploadItem) => void`    | -            | Per-item success                                                      |
| `onItemError`     | `(item: UploadItem) => void`    | -            | Per-item failure                                                      |

Controller methods: `getItems`, `getItem`, `getSummary`, `addFiles`, `start`, `remove`, `clear`, `retry`, `cancel`, `pause`, `resume`, `subscribe`, `dispose`. `getSummary()` returns counts per status plus an aggregate `progress`.

### `UploadItem`

`{ id, file, name, size, type, status, progress, loadedBytes, attempts, error, url }` where `status` is `queued`, `uploading`, `paused`, `success`, `error`, or `canceled`.

### `createHttpUploadTransport` options

`url`, `method` (default `POST`), `fieldName` (default `file`), `headers`, `extraFields`, `credentials`, `fetchImpl`, `parseResponse`.

### Vue

`UploadDropzone` props: `transport`, `accept`, `multiple`, `maxBytes`, `concurrency`, `disabled`, `label`; emits `itemsChange`. `UploadList` props: `items`, `controller`, `label`.

```vue
<script setup lang="ts">
import { UploadDropzone } from "@sometic/vue/data";
import { createHttpUploadTransport } from "@sometic/upload";

const transport = createHttpUploadTransport({ url: "/api/uploads" });
</script>

<template>
    <UploadDropzone :transport="transport" accept="image/png,image/jpeg" label="Upload screenshots">
        Drop files or press Enter to browse
    </UploadDropzone>
</template>
```

### Custom element

**CE not shipped.** Use the Vanilla controllers, React, or Vue.

## Events / callbacks

| Surface        | Event                          | Payload                 |
| -------------- | ------------------------------ | ----------------------- |
| React          | `onItemsChange`                | `readonly UploadItem[]` |
| Vue            | `itemsChange`                  | `readonly UploadItem[]` |
| Custom element | -                              | -                       |
| Queue          | `onChange`                     | `UploadItem[]`          |
| Queue          | `onItemSuccess`, `onItemError` | `UploadItem`            |
| Queue          | `subscribe(listener)`          | `UploadItem[]`          |
| Transport      | `onProgress(progress)`         | `number` from 0 to 1    |

Native drag events still fire on the dropzone element; the controller only calls `preventDefault` so the browser does not navigate to the dropped file.

## Controlled vs uncontrolled

The queue owns item state; there is no controlled `items` prop, because progress and status come from transfers rather than from your renders. What you control is the input side (which files enter, through `addFiles` or the dropzone) and the commands (`cancel`, `pause`, `resume`, `retry`, `remove`, `clear`). To mirror the queue into your own store, subscribe and copy: `onItemsChange` in React and Vue, `subscribe` or `onChange` on the controller. For a controlled single-file value use [File input](/components/file-input) instead.

## Accessibility

- The dropzone is a focusable `role="button"` with `tabindex="0"` (or `-1` and `aria-disabled` when disabled) and opens the native picker on Enter or Space, so drag-and-drop is never the only path.
- A real hidden `<input type="file">` does the picking, which preserves native OS dialogs, camera capture on mobile, and platform accessibility.
- The list is a polite live region with `data-count`, so newly queued files are announced without interrupting.
- Each item exposes `role="progressbar"` with `aria-valuenow` and a human `aria-valuetext` such as `40%`, and `aria-busy="true"` while uploading.
- Failed items get `data-invalid`; pair that with visible error text from `item.error.message` and reference it with `aria-describedby`.
- Label the dropzone with `label` (default "Upload files") and describe the constraints (types, max size) in text referenced by `aria-describedby`, not only in a tooltip.
- Cancel and retry are real buttons with accessible names, one per row, so keyboard users can manage a queue without a pointer.

## Styling

Unstyled. Target `[data-slot="dropzone"][data-dragging="true"]`, `[data-slot="dropzone"][data-state="disabled"]`, `[data-slot="item"][data-status="error"]`, `[data-slot="item"][data-progress]`, and `[data-slot="list"][data-empty="true"]`. `data-progress` carries the rounded percent, so a CSS bar can be driven with `attr()` or a CSS variable you set from `view.percent` without extra JavaScript state.

## Edge cases

- **Rejected files stay visible**: files failing `accept`, `maxBytes`, or the empty-file check are added with status `error` and a typed code (`upload_file_type_rejected`, `upload_file_too_large`, `upload_file_empty`), so the user gets feedback instead of silence.
- **Zero-byte files** are accepted by default. Pass `allowEmptyFiles: false` when an empty file is meaningless to your API.
- **Accept matching** handles `.ext` suffixes, exact mime types, `type/*` wildcards, and `*` or `*/*` for everything. A file the browser reports with an empty mime type only matches extension rules.
- **Single-file mode**: `multiple: false` keeps only the first dropped or selected file.
- **Drag depth**: entering a child element does not clear `data-dragging`; the counter only resets on drop or when the last leave fires.
- **Drop with folders**: only file entries from `dataTransfer.items` are read. Directory recursion is not part of this beta.
- **Retry**: only `error` and `canceled` items can be retried. Progress resets, the error clears, and `attempts` keeps counting up across runs.
- **Pause**: works from `uploading` or `queued`, aborts the request, and marks `paused`. `resume` re-queues from the start, so byte-range resume must live in your transport if the server supports it.
- **Cancel is terminal until retried**: canceled and successful items ignore further `cancel` calls.
- **Progress without content length**: transports that cannot measure progress should report 0 then 1, which is exactly what `createHttpUploadTransport` does with `fetch`.
- **`fetch` unavailable**: `resolveUploadFetch` throws `upload_fetch_unavailable`; pass `fetchImpl` in Node or test environments.
- **Non-JSON responses**: the default parser returns `{}` rather than throwing, so `item.url` stays `null`.
- **Dispose**: `dispose()` aborts in-flight transfers and clears listeners. React and Vue dispose both dropzone and queue on unmount, so route changes cannot leak requests.
- **Input reset**: the adapters clear the file input value after each selection so picking the same file twice still fires a change.
- **SSR**: no browser globals at import time. `downloadBlob` throws `upload_download_unavailable` when there is no `document`.

## Performance notes

`concurrency` is the main lever: more parallel transfers help many small files and hurt few large ones. Each active item holds one `AbortController` and one transport promise, and nothing polls. Progress notifications fan out through one `onChange` per event, so keep list rendering cheap and avoid recomputing derived state per item (use `getSummary()` once). Large queues should render with your own virtualization; the list resolve is pure. Object URLs created for previews are yours to revoke; the queue holds the `File` reference only.

## When to use / When not

**Use** for multi-file uploads that need progress, cancel, retry, and a queue that survives re-renders, and when the same behavior must work in React, Vue, and Vanilla with a transport you choose.

**Do not use** for a single file in a form (use [File input](/components/file-input)), for resumable chunked protocols such as tus without writing that transport yourself, or as authorization. The server must still validate type, size, and permissions: client gates are UX only.

**Vs native file input / Uppy.** Native `<input type="file">` is enough for one field. Uppy and similar kits own chrome and transports. Sometic Upload is a queue + dropzone resolve + pluggable `UploadTransport` (HTTP helper included), so progress, cancel, and retry stay portable without a visual kit.

## FAQ

**Which transport should I use?** `createHttpUploadTransport` for a plain `POST` endpoint. Write your own for presigned S3 PUT, XHR-based byte progress, or chunked protocols: it is one `upload(file, { signal, onProgress })` method.

**Why is progress 0 then 100 with `fetch`?** `fetch` does not expose request upload progress in browsers. Write an XHR transport (or use a streaming upload API where available) and call `onProgress` with real byte ratios.

**Are `accept` and `maxBytes` security?** No. They are UX gates that keep obvious mistakes out of the queue. Always validate type, size, and ownership on the server.

**Can I resume interrupted uploads?** `pause` and `resume` re-queue an item from the start. True byte-range resume requires a transport plus server support; the queue gives you the state model, not the protocol.

**How do I show a preview thumbnail?** Read `item.file` and create an object URL in your render layer, then revoke it when the row unmounts. The queue keeps the `File` so this stays possible after upload.

**How do I upload to two different endpoints?** Create two controllers with two transports, or one transport whose `upload` inspects the file and routes accordingly.

**Does it retry automatically?** Only if you ask. `maxAttempts` defaults to `0`, so a failure stays `error` until someone calls `retry`. Set `maxAttempts: 3` and the queue re-queues a failed item until it has run three times, then reports `onItemError`.

**What about downloads?** `downloadBlob` and `downloadFromUrl` ship in `@sometic/upload`. `downloadFromUrl` returns the `Blob` and optionally triggers a save with `saveAs`.

**Is there a `sometic-upload` element?** No. Custom elements are not shipped for data surfaces in this beta.

**Do I need `UploadList` if I write my own rows?** No. Use `resolveUploadItem` and `resolveUploadList` for the ARIA and data attributes, and render whatever markup you want.

---

**Files never start?** Check `autoStart`. Call `start` or ensure the dropzone path calls `addFiles`. Verify the transport `upload` resolves and does not hang without `onProgress`.

**Accept rejects valid files?** Normalize MIME vs extension rules. Prefer extension rules when `file.type` is empty. Mirror rules on the hidden input `accept` attribute.

**Cancel does nothing?** Call `controller.cancel(id)` and ensure the transport respects `signal`. UI should move to `canceled`.

**`upload_fetch_unavailable`?** Pass `fetchImpl` into `createHttpUploadTransport` for tests or non-browser runtimes.

**Rejected files look silent?** Rejected files still appear as `error` items; render `item.error.message`.

**Same file cannot be picked twice?** Clear the file input `value` after change (React/Vue adapters already do).

## Related links

- [File input](/components/file-input)
- [Progress](/components/progress)
- [Status surfaces](/components/status)
- [HTTP client](/utilities/http)
- [Beta maturity](/releases/beta)
