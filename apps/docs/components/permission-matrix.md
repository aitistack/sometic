# Permission matrix

Resources by actions grid from `@sometic/dom/permission-matrix`. A baseline `can(resource, action)` check (typically your auth authorization helper) provides the current answer, and edits are stored as a sparse override map, so you always know what the admin changed versus what the policy already allowed. Grid keyboard navigation, tri-state cells, read-only mode, and per-cell disabling are built in. React and Vue ship `PermissionMatrix`.

::: tip System standout: UX, not authz
Cells are editable allow/deny overrides for admin chrome. The server (and `@sometic/auth` claims) remain the security boundary. Preview uses posts/users × read/write like the playground.
:::

<PreviewPermissionMatrix />

## Usage

::: code-group

```jsx [JS]
import { PermissionMatrix } from "@sometic/react/data";

const resources = [
    { id: "posts", label: "Posts" },
    { id: "users", label: "Users" },
];

const actions = [
    { id: "read", label: "Read" },
    { id: "write", label: "Write" },
];

export function Example() {
    return (
        <PermissionMatrix
            label="Editor role"
            resources={resources}
            actions={actions}
            can={(resourceId, actionId) => actionId === "read"}
            onValueChange={(value) => console.log(value)}
        />
    );
}
```

```tsx [TS]
import {
    PermissionMatrix,
    type PermissionMatrixAction,
    type PermissionMatrixResource,
    type PermissionMatrixValue,
} from "@sometic/react/data";

const resources: PermissionMatrixResource[] = [
    { id: "posts", label: "Posts" },
    { id: "users", label: "Users" },
];

const actions: PermissionMatrixAction[] = [
    { id: "read", label: "Read" },
    { id: "write", label: "Write" },
];

export function Example(): JSX.Element {
    return (
        <PermissionMatrix
            label="Editor role"
            resources={resources}
            actions={actions}
            can={(resourceId, actionId) => actionId === "read"}
            onValueChange={(value: PermissionMatrixValue) => console.log(value)}
        />
    );
}
```

```html [Vanilla]
<div id="matrix"></div>
<p id="matrix-live" role="status" aria-live="polite"></p>

<script type="module">
    import { createPermissionMatrixController } from "@sometic/dom/permission-matrix";

    const host = document.querySelector("#matrix");

    const matrix = createPermissionMatrixController({
        resources: [
            { id: "posts", label: "Posts" },
            { id: "users", label: "Users" },
        ],
        actions: [
            { id: "read", label: "Read" },
            { id: "write", label: "Write" },
        ],
        can: (resourceId, actionId) => actionId === "read",
        onValueChange: () => render(),
        onAnnounce: (message) => {
            document.querySelector("#matrix-live").textContent = message;
        },
    });

    const applyAttributes = (element, attributes) => {
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    };

    function render() {
        host.replaceChildren();
        applyAttributes(host, matrix.resolve({ label: "Editor role" }).attributes);

        for (const resource of matrix.getResources()) {
            const row = document.createElement("div");
            row.setAttribute("role", "row");
            const header = document.createElement("span");
            header.setAttribute("role", "rowheader");
            header.textContent = resource.label ?? resource.id;
            row.append(header);

            for (const action of matrix.getActions()) {
                const cell = matrix.resolveCell(resource.id, action.id);
                const button = document.createElement("button");
                button.type = "button";
                applyAttributes(button, cell.attributes);
                button.disabled = cell.disabled;
                button.textContent = cell.state;
                button.addEventListener("click", () => {
                    matrix.toggleCell(resource.id, action.id);
                });
                row.append(button);
            }
            host.append(row);
        }
    }

    host.addEventListener("keydown", (event) => {
        const action = matrix.getKeyboardAction(event);
        if (!action) {
            return;
        }
        event.preventDefault();
        if (action.type === "move") {
            render();
            const position = matrix.getFocusedCell();
            const resource = matrix.getResources()[position.row];
            const target = matrix.getActions()[position.column];
            host
                .querySelector(`[data-resource="${resource.id}"][data-action="${target.id}"]`)
                ?.focus();
            return;
        }
        const position = matrix.getFocusedCell();
        const resource = matrix.getResources()[position.row];
        const target = matrix.getActions()[position.column];
        matrix.toggleCell(resource.id, target.id);
    });

    render();
</script>
```

:::

> Custom element not shipped for data surfaces in this beta; use the DOM controller or the React and Vue components.

Custom element **not shipped** for Permission matrix. Vanilla uses `@sometic/dom/permission-matrix`. React ships `PermissionMatrix` from `@sometic/react/data`, Vue the same name from `@sometic/vue/data`.

## How it works

1. **Baseline plus overrides**: `can(resourceId, actionId)` returns `true`, `false`, or `undefined`. The controller stores only edits, keyed as `resource:action` in a `Record<string, boolean>`. A cell with no override falls back to the baseline, and `undefined` from `can` becomes the third state, `indeterminate`.
2. **Cell state**: `getCellState` returns `"allowed"`, `"denied"`, or `"indeterminate"`. `toggleCell` writes the opposite of "allowed" (so an indeterminate cell becomes allowed), `setCell` writes an explicit value, and `clearCell` removes the override so the baseline shows through again.
3. **Resolve**: `resolvePermissionMatrix` gives `role="grid"`, `aria-rowcount` and `aria-colcount` (headers included), `data-readonly`, and `data-empty`. `resolvePermissionMatrixCell` gives `role="gridcell"`, `aria-checked` (`true`, `false`, or `mixed`), `data-resource`, `data-action`, `data-state`, roving `tabindex`, and an `aria-label` such as `write on posts`.
4. **Keyboard**: `getKeyboardAction(event, dir?)` shares the grid navigation used by [Data table](/components/data-table): arrows move, Home and End jump to row edges (Ctrl or Cmd for grid corners), PageUp and PageDown jump by rows, Space toggles, Enter activates. The controller tracks the focused cell for you, and RTL swaps the horizontal arrows.
5. **Guards**: `readOnly`, unknown resource or action ids, `isCellDisabled`, and a disposed controller all block writes at the engine level, not just in the UI.
6. **Announcements**: `onAnnounce` fires with a human string such as `write on posts allowed` so you can push it into a live region or the shared announcer.
7. **Adapters**: React and Vue create the controller, render header row, row headers, and button cells, wire click and keyboard, and dispose on unmount.

## Anatomy

| Part        | `data-slot`  | Role / notes                                             |
| ----------- | ------------ | -------------------------------------------------------- |
| Root        | `root`       | `role="grid"`, `data-readonly`, `data-empty`              |
| Header row  | `header-row` | `role="row"` holding the action headers                   |
| Corner      | `corner`     | Empty top-left cell                                       |
| Action header | `header`   | `role="columnheader"`, action label                       |
| Row         | `row`        | `role="row"` per resource                                 |
| Row header  | `row-header` | `role="rowheader"`, resource label                        |
| Cell        | `cell`       | `role="gridcell"`, `aria-checked`, `data-state`, button   |

## Props / attributes

### React `PermissionMatrixProps`

Extends `HTMLAttributes<HTMLDivElement>` minus `children`.

| Prop             | Type                                                              | Default      | Description                                    |
| ---------------- | ------------------------------------------------------------------ | ------------ | ---------------------------------------------- |
| `resources`      | `readonly PermissionMatrixResource[]`                             | **required** | Rows, `{ id, label? }`                         |
| `actions`        | `readonly PermissionMatrixAction[]`                               | **required** | Columns, `{ id, label? }`                      |
| `can`            | `(resourceId: string, actionId: string) => boolean \| undefined`   | -            | Baseline policy, `undefined` means unknown     |
| `value`          | `PermissionMatrixValue`                                           | -            | Controlled override map                        |
| `defaultValue`   | `PermissionMatrixValue`                                           | `{}`         | Uncontrolled initial overrides                 |
| `onValueChange`  | `(value: PermissionMatrixValue) => void`                          | -            | Fires with the next override map               |
| `readOnly`       | `boolean`                                                         | `false`      | Renders the grid but blocks every write        |
| `isCellDisabled` | `(resourceId: string, actionId: string) => boolean`               | -            | Per-cell lock, for example an inherited grant  |
| `label`          | `string`                                                          | -            | `aria-label` on the grid                       |
| Native attrs     | remaining div HTML attrs                                          | -            | Forwarded to the root                          |

### Controller options and API

`createPermissionMatrixController` takes the same options plus `onAnnounce(message)`.

Methods: `getResources`, `getActions`, `getValue`, `setValue`, `getCellState`, `isCellDisabled`, `setCell`, `toggleCell`, `clearCell`, `getGrantedKeys`, `getFocusedCell`, `setFocusedCell`, `getKeyboardAction`, `resolve`, `resolveCell`, `dispose`. `permissionMatrixKey(resourceId, actionId)` builds the `resource:action` key used by the value map and `getGrantedKeys()`.

### Vue

`PermissionMatrix` from `@sometic/vue/data`. Props: `resources`, `actions`, `can`, `defaultValue`, `readOnly`, `label`. Emits `valueChange` with the override map.

```vue
<script setup lang="ts">
import { PermissionMatrix } from "@sometic/vue/data";

const resources = [
    { id: "posts", label: "Posts" },
    { id: "users", label: "Users" },
];
const actions = [
    { id: "read", label: "Read" },
    { id: "write", label: "Write" },
];

function can(resourceId: string, actionId: string): boolean {
    return actionId === "read";
}

function onValueChange(value: Record<string, boolean>): void {
    console.log(value);
}
</script>

<template>
    <PermissionMatrix
        label="Editor role"
        :resources="resources"
        :actions="actions"
        :can="can"
        @value-change="onValueChange"
    />
</template>
```

### Custom element

**CE not shipped.** Use the Vanilla controller, React, or Vue.

## Events / callbacks

| Surface        | Event            | Payload                        |
| -------------- | ---------------- | ------------------------------ |
| React          | `onValueChange`  | `PermissionMatrixValue`        |
| Vue            | `valueChange`    | `PermissionMatrixValue`        |
| Custom element | -                | -                              |
| DOM controller | `onValueChange`  | `PermissionMatrixValue`        |
| DOM controller | `onAnnounce`     | `string`, for example `write on posts denied` |

There is no per-cell event: the whole override map is the change payload, which keeps saving a role a single request.

## Controlled vs uncontrolled

- **Uncontrolled**: pass `defaultValue` (usually `{}` for "no edits yet") and read the map from `onValueChange`. This is the natural fit for a role editor with an explicit Save button.
- **Controlled**: pass `value` and `onValueChange` and store the map in your form or store. Without the callback the grid appears frozen, because controlled state is never overwritten silently.
- **Diffing**: since only overrides are stored, `value` is already the diff against your policy. Send it as-is, or expand to a full grant list with `getGrantedKeys()`.

## Accessibility

- `role="grid"` with `aria-rowcount` and `aria-colcount` that include the header row and the row-header column, so screen reader positions match what users see.
- Cells are real `<button>` elements with `aria-checked` (`true`, `false`, or `mixed` for indeterminate) and an `aria-label` such as `write on posts`, so a cell makes sense out of context.
- Roving `tabindex` means one tab stop for the grid; arrows move inside it. Space toggles and Enter activates, matching the data table.
- `readOnly` sets `aria-readonly` on the grid and on each cell, and disabled cells add `aria-disabled` plus `data-disabled`, so blocked cells are announced instead of silently ignoring clicks.
- `onAnnounce` gives you the exact wording for a live region, which is important because a color change alone is invisible to screen reader users.
- Row and column headers use `rowheader` and `columnheader`, so navigating a wide matrix keeps announcing which resource and action a cell belongs to.
- RTL: pass `dir` to `getKeyboardAction` so horizontal arrows follow reading order.

## Styling

Unstyled. Target `[data-slot="cell"][data-state="allowed"]`, `[data-state="denied"]`, `[data-state="indeterminate"]`, `[data-readonly="true"]`, `[data-disabled]`, and `[data-resource="posts"][data-action="write"]` for spot overrides. Do not encode state in color alone: pair `data-state` with an icon or text, which is what the default adapters do by rendering the state word.

## Edge cases

- **Unknown ids**: cells for resources or actions that are not in the lists are disabled and report `indeterminate`, so a stale saved role cannot flip a permission that no longer exists.
- **`can` returns `undefined`**: the cell is `indeterminate`. A first toggle makes it `allowed`, which matches the usual "grant it" intent.
- **`clearCell`** removes the override entirely, so the cell follows the policy again. That is different from `setCell(..., false)`, which records an explicit deny.
- **`readOnly`** blocks `setCell`, `toggleCell`, and `clearCell` in the engine. The grid still renders and stays keyboard navigable.
- **After `dispose`** every cell reports disabled and writes are ignored, so late events from a removed dialog cannot mutate state.
- **Empty resources or actions**: `data-empty="true"` on the root and keyboard navigation returns no action, so render your own empty state.
- **Focus tracking**: `setFocusedCell` clamps into range, so removing rows cannot strand focus outside the grid.
- **Large matrices**: nothing virtualizes. Twenty resources by ten actions is 200 buttons, which is fine; hundreds by dozens needs grouping or paging in your UI.
- **Value keys**: the map uses `resource:action`. If your ids can contain a colon, wrap `permissionMatrixKey` in your own encoding before persisting.
- **SSR**: no browser globals at import time. Build the value map on the server and pass it as `defaultValue`.

## Security

This grid is UX for editing a policy. It is not enforcement. Every real check must run on the server, and the client `can` function should mirror the same rules only so the UI does not lie. Persisting the override map is a privileged operation: authorize it server side, validate that ids exist, and audit it (see [Activity](/components/activity)).

## Performance notes

State is one flat object of overrides, and reads are O(resources times actions) only in `getGrantedKeys()`. `resolveCell` is pure and cheap, called once per cell per render. React and Vue rerender the whole grid on any change, which is fine at typical sizes; for very large matrices, split by resource group into separate controllers. The controller holds no listeners, timers, or observers, so `dispose()` is only about blocking late writes.

## When to use / When not

**Use** for role and policy editors, per-tenant permission screens, and any resources-by-actions grid that must behave the same in React, Vue, and Vanilla while your auth layer supplies the baseline.

**Do not use** as an authorization check (call your auth layer for that: see [Authorization](/authentication/authorization)), for hierarchical or attribute-based policies that do not fit a two-axis grid, or for a simple list of toggles where [Checkbox](/components/checkbox) is enough. Keep Casbin/CASL/OPA (or your API) as the source of truth; use the matrix to edit a projection the server already understands.

## FAQ

**How does this relate to Sometic auth?** Pass your authorization check as `can`. The matrix never decides permissions; it displays a baseline and records intended changes.

**Why store overrides instead of a full grant map?** Because "what changed" is the useful payload for saving, diffing, and auditing. Call `getGrantedKeys()` when you do want the expanded list of allowed pairs.

**What is the indeterminate state for?** Unknown baselines: the policy has no opinion, or the answer is inherited from somewhere the client cannot see. It keeps "not granted" and "unknown" distinguishable instead of guessing.

**How do I lock inherited permissions?** `isCellDisabled(resource, action)` returns `true` for those cells. The engine blocks writes and the cell gets `aria-disabled`, so keyboard users are told rather than being ignored.

**Can I show groups of resources?** Render several matrices, one per group, each with its own controller, and merge the maps on save. The engine does not model grouping.

**Is keyboard support the same as the data table?** Yes, both use the shared grid navigation helper, so arrows, Home, End, PageUp, PageDown, Space, and Enter behave identically.

**How do I announce changes?** Pass `onAnnounce` and write the message into a polite live region, or feed it to the announcer in `@sometic/accessibility`.

**Can I make the whole grid read-only for viewers?** Yes, `readOnly`. It is enforced in the engine, so a stray script call cannot flip a cell.

**Is there a `sometic-permission-matrix` element?** No. Custom elements are not shipped for data surfaces in this beta.

## Related links

- [Authorization](/authentication/authorization)
- [Data table](/components/data-table)
- [Activity](/components/activity)
- [Approval](/components/approval)
- [Beta maturity](/releases/beta)

The vanilla playground demos the controller in section `#permissions` with `posts` and `users` resources and `read` and `write` actions.
