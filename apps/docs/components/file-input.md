# File input

Native file picker that emits `File[]` (empty array when cleared), with optional `multiple` and `accept`. React/Vue wrap a native `<input type="file">`; the custom element adds face chrome (`data-slot` face/icon/title/hint) over the same engine.

<PreviewFile />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { FileInput } from "@sometic/react/input";

export function Example() {
    const [files, setFiles] = useState([]);
    return <FileInput multiple accept="image/*,.pdf" onValueChange={setFiles} />;
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { FileInput } from "@sometic/vue/input";

const files = ref([]);
</script>

<template>
    <FileInput multiple accept="image/*,.pdf" @update:model-value="files = $event" />
</template>
```

```js [Vanilla]
import { createFileInputController, resolveFileInput } from "@sometic/dom/input-file";

const input = document.querySelector('input[type="file"]');
const controller = createFileInputController({
    multiple: true,
    accept: "image/*,.pdf",
    onValueChange(next) {
        console.log(next);
    },
});

const view = resolveFileInput({ multiple: true, accept: "image/*,.pdf" });
for (const [key, attr] of Object.entries(view.nativeAttributes)) {
    input.setAttribute(key, attr);
}

input.addEventListener("change", () => {
    controller.setFromList(input.files);
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<sometic-file-input multiple accept="image/*,.pdf"></sometic-file-input>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.5/dist/cdn/sometic-elements.iife.js"></script>

<sometic-file-input multiple accept="image/*,.pdf"></sometic-file-input>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.5/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-file-input multiple accept="image/*,.pdf"></sometic-file-input>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { FileInput } from "@sometic/vue/input";

const files = ref([]);
</script>

<template>
    <FileInput v-model="files" multiple accept="image/*,.pdf" />
</template>
```

## How it works

1. **Engine (`@sometic/dom/input-file`)**: `resolveFileInput` resolves styling/state for `type: "file"`. `createFileInputController` maps `FileList` ↔ controllable `File[]` (`setFromList`, `clear`).
2. **Adapters**: React `FileInputProps` omits string `value` / `defaultValue` / `onValueChange` from Input and reintroduces `File[]` APIs. On change it spreads `event.target.files` into an array (or `[]`). Vue emits `update:modelValue` with `File[]`.
3. **Custom element**: `sometic-file-input` observes `multiple`, `accept`, `disabled`, `invalid`, `shadow`, renders a face UI plus the native input, sets `data-file-kind` from the first file, and dispatches `value-change` with `{ files }`.

Browser security still owns what can be written into the DOM file control; treat controlled `value` as app state, not a guarantee you can re-seed the picker.

## Anatomy

| Part         | `data-slot` (CE) | Role                                   |
| ------------ | ---------------- | -------------------------------------- |
| Face         | `face`           | Clickable chrome over the native input |
| Icon         | `icon`           | Decorative kind glyph (`aria-hidden`)  |
| Title / hint | `title` / `hint` | Filename or “Choose file(s)” copy      |
| Native input | ,                | Real `<input type="file">`             |

React/Vue adapters expose the bare input unless you wrap them. State attrs follow input resolve where applicable (`data-disabled`, `data-invalid`, …).

## Props / attributes

### React `FileInputProps`

`Omit<InputProps, "type" | "value" | "defaultValue" | "onValueChange">` plus:

| Prop                   | Type                       | Default | Description                            |
| ---------------------- | -------------------------- | ------- | -------------------------------------- |
| `value`                | `File[]`                   | ,       | App-side controlled list (best-effort) |
| `defaultValue`         | `File[]`                   | ,       | Documented uncontrolled seed           |
| `onValueChange`        | `(files: File[]) => void`  | ,       | Change; `[]` when cleared              |
| `multiple`             | `boolean`                  | ,       | Native multi-select                    |
| `accept`               | `string`                   | ,       | Native accept hint                     |
| `disabled` / `invalid` | `boolean`                  | ,       | State + ARIA                           |
| `name`                 | `string`                   | ,       | Form association                       |
| styling props          | from Input                 | ,       | `unstyled`, `classes`, …               |
| Native attrs           | remaining input HTML attrs | ,       | Forwarded; `ref` supported             |

Note: React currently reads selection from the native change event; `value` / `defaultValue` are typed for app state but are not written back into the DOM FileList (browser limitation). Prefer `onValueChange` as the source of truth for uploads.

### Vue

`disabled`, `multiple`, optional `accept`. Emits `update:modelValue` with `File[]`. Use `v-model`.

### Custom element (`sometic-file-input`)

Observed: `multiple`, `accept`, `disabled`, `invalid`, `shadow`. Event: `value-change` → `{ files: File[] }`. Face copy switches between “Choose file” and “Choose files” based on `multiple`.

## Events / callbacks

| Surface        | Event               | Payload             |
| -------------- | ------------------- | ------------------- |
| React          | `onValueChange`     | `File[]`            |
| Vue            | `update:modelValue` | `File[]`            |
| Custom element | `value-change`      | `{ files: File[] }` |

Ignored while `disabled` (and React also while `readonly` if set). Clearing the picker yields `[]`.

## Controlled vs uncontrolled

- Prefer **uncontrolled native picker** + `onValueChange` / `v-model` for app state.
- Emitting `[]` means cleared / no files.
- Do not expect setting `value={[file]}` to programmatically populate the OS file dialog selection in all browsers.

## Form participation

Native file inputs participate in multipart form submit by `name`. Controlled React state may diverge from the DOM FileList; for uploads prefer files from `onValueChange` (or CE `value-change`) rather than re-reading only FormData after SPA state updates. Validate size/type in Form validators and on the server; `accept` is a hint, not enforcement.

## Accessibility

- Visible label via [Field](/components/field) or associated `<label>`.
- Keyboard: focus the native control (or CE face that activates it); Space / Enter opens the picker per browser.
- Do not rely on the filename alone for status; announce upload errors via [Alert](/components/alert) or [Toast](/components/toast).
- CE icon is `aria-hidden`; keep meaningful title text for the selection.

## Styling

CE face elements (`[data-slot="face"|"icon"|"title"|"hint"]`, `[data-file-kind]`) are the main style hooks. React/Vue: style the input host via Input state attrs / `classes`.

## Edge cases

- **Security**, you cannot freely assign arbitrary `File[]` into the DOM input; keep app state separate.
- **`accept`**, hint only; always validate MIME/extension and size server-side.
- **`multiple`**, array length can be > 1; CE title appends `(+N)`.
- **Clearing**, listen for `[]`; some browsers require remounting the input to clear the visible filename.
- **SSR**, register CE in the browser only; `File` exists in browser runtimes.

## Performance notes

Keep `File` references; do not read whole files into memory until upload. Face sync on CE is per selection change only.

## When to use / When not

**Use** for uploads, attachments, and image/document pickers.

**Do not use** for:

- Path strings or non-file text, [Input](/components/input).
- Drag-and-drop only UIs without a file input fallback (compose FileInput underneath).
- Base `Input type="file"` when you want a typed `File[]` API.

## FAQ

**Why `File[]` not `FileList`?** Stable, app-friendly array API that copies the live list at change time.

**How do I enable multiple files?** Pass `multiple` (React/Vue/CE).

**How do I clear?** Emit/set `[]` in app state; you may need to reset the input element to clear the browser chrome.

**Is `accept` enforcement?** No. Validate in Form / server code.

**Can I use base Input `type="file"`?** Prefer FileInput for `File[]` typing and CE face chrome.

**Does React forward refs?** Yes, to the underlying `<input type="file">`.

**Vue `v-model` type?** `File[]`.

**What is `data-file-kind`?** CE attribute derived from the first selected file for icon/chrome styling.

**Readonly?** React ignores changes while `readonly`; Vue FileInput does not expose a readonly prop (native file inputs are rarely readonly). Prefer `disabled` to block picking.

**Bundle tip?** Import from `@sometic/react/input` or `@sometic/dom/input-file`.

## Related links

- [Input](/components/input)
- [Field](/components/field)
- [Form](/components/form)
- [Alert](/components/alert)
- [Styling slots](/concepts/styling-slots)
