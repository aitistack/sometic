# Command palette

Modal, filterable command list for quick actions. Composes `@sometic/dom/overlay` (focus trap, Escape, scroll lock) with a keyboard-driven option list. It is **not** a Combobox (inline field) and **not** a Menu (anchored actions).

<PreviewCommandPalette />

## Usage

::: code-group

```tsx [JS]
import { useState } from "react";
import { CommandPalette } from "@sometic/react/structure";

const commands = [
    { id: "docs", label: "Open docs", keywords: ["guide", "documentation"], group: "Navigation" },
    { id: "status", label: "Focus playground status", keywords: ["log"], group: "Navigation" },
    { id: "theme", label: "Toggle theme", keywords: ["dark", "light"], group: "Theme" },
    { id: "tokens", label: "Reset tokens", disabled: true, group: "Theme" },
    { id: "faq", label: "Search FAQ", keywords: ["help"], group: "Docs" },
    { id: "compare", label: "Open comparison", keywords: ["vs"], group: "Docs" },
];

export function Example() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Open command palette
            </button>
            <CommandPalette
                open={open}
                onOpenChange={setOpen}
                commands={commands}
                onSelect={(command) => console.log(command.id)}
            />
        </>
    );
}
```

```tsx [TS]
import { useState } from "react";
import { CommandPalette, type CommandPaletteCommand } from "@sometic/react/structure";

const commands: CommandPaletteCommand[] = [
    { id: "docs", label: "Open docs", keywords: ["guide", "documentation"], group: "Navigation" },
    { id: "status", label: "Focus playground status", keywords: ["log"], group: "Navigation" },
    { id: "theme", label: "Toggle theme", keywords: ["dark", "light"], group: "Theme" },
    { id: "tokens", label: "Reset tokens", disabled: true, group: "Theme" },
    { id: "faq", label: "Search FAQ", keywords: ["help"], group: "Docs" },
    { id: "compare", label: "Open comparison", keywords: ["vs"], group: "Docs" },
];

export function Example(): JSX.Element {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Open command palette
            </button>
            <CommandPalette
                open={open}
                onOpenChange={setOpen}
                commands={commands}
                onSelect={(command) => console.log(command.id)}
            />
        </>
    );
}
```

```ts [Vanilla]
import { createCommandPaletteController } from "@sometic/dom/command-palette";

const panel = document.querySelector("#palette");
const controller = createCommandPaletteController({
    defaultOpen: false,
    commands: [
        { id: "docs", label: "Open docs", keywords: ["guide", "documentation"], group: "Navigation" },
        { id: "status", label: "Focus playground status", keywords: ["log"], group: "Navigation" },
        { id: "theme", label: "Toggle theme", keywords: ["dark", "light"], group: "Theme" },
        { id: "tokens", label: "Reset tokens", disabled: true, group: "Theme" },
        { id: "faq", label: "Search FAQ", keywords: ["help"], group: "Docs" },
        { id: "compare", label: "Open comparison", keywords: ["vs"], group: "Docs" },
    ],
    getContent: () => panel,
    onSelect: (command) => console.log(command.id),
});
controller.setOpen(true);
```

:::

### Vue

`CommandPalette` from `@sometic/vue/structure`. Props: `open`, `defaultOpen`, `value`, `defaultValue`, `filter`, `defaultFilter`, `commands`. Emits `update:open` / `openChange`, `update:value` / `valueChange`, `update:filter` / `filterChange`, and `select`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CommandPalette, type CommandPaletteCommand } from "@sometic/vue/structure";

const open = ref(false);
const commands: CommandPaletteCommand[] = [
    { id: "docs", label: "Open docs", keywords: ["guide", "documentation"], group: "Navigation" },
    { id: "status", label: "Focus playground status", keywords: ["log"], group: "Navigation" },
    { id: "theme", label: "Toggle theme", keywords: ["dark", "light"], group: "Theme" },
    { id: "tokens", label: "Reset tokens", disabled: true, group: "Theme" },
    { id: "faq", label: "Search FAQ", keywords: ["help"], group: "Docs" },
    { id: "compare", label: "Open comparison", keywords: ["vs"], group: "Docs" },
];
</script>

<template>
    <button type="button" @click="open = true">Open command palette</button>
    <CommandPalette
        v-model:open="open"
        :commands="commands"
        @select="(command) => console.log(command.id)"
    />
</template>
```

## How it works

- Open state uses modal overlay chrome (trap, Escape, scroll lock).
- Filter string narrows commands by label and keywords.
- Arrow keys move the active option; Enter runs `onSelect` and closes; Escape closes.
- IME composition ignores Enter/arrows while composing.

## When to use / when not

| Use when | Prefer something else when |
| -------- | -------------------------- |
| Global quick actions (⌘K-style) | Inline autocomplete in a form field → [Combobox](/components/combobox) |
| Modal focus with filter + run | Anchored contextual actions → [Menu](/components/menu) |

## Edges

- Empty / no-match filter lists stay open with no active option.
- Disabled commands are skipped by keyboard movement.
- Dispose the controller on unmount (React/Vue do this for you).

## FAQ

### Are custom elements shipped?

No. Use React, Vue, or `@sometic/dom/command-palette` in Vanilla.

### Does it pull Combobox?

No. Filtering and list keyboard live in the command-palette engine.

## Related

- [Structure FAQ](/components/structure-faq)
- [Structure comparison](/components/structure-comparison)
- [Dialog](/components/dialog)
- [Combobox](/components/combobox)
