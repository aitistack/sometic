# Upload comparison

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| **`@sometic/upload`** | Queue, concurrency, abort, progress, HTTP helper, DOM dropzone, React shell | Not resumable chunks out of the box; no CE |
| **Uppy** | Plugins, resumable uploads, polished UI | Larger surface; visual opinions |
| **filepond** | Beautiful UX, framework wrappers | Styling lock-in; less “engine only” |
| **Native `<input type="file">`** | Tiny | No queue, progress, or shared adapters |

Choose Sometic when uploads should match Sometic’s headless model and you will style the dropzone yourself. Choose Uppy when you need tus/S3 multipart plugins immediately. Use native input for a single optional attachment with no progress UI.
