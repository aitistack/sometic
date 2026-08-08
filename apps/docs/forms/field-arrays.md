# Field arrays

Dynamic lists of values on a form path. `createFieldArray` / `useFieldArray` mutate the array in form values and expose stable keys for rendering. They do **not** auto-validate, register nested paths yourself (`items[0].name`).

## Import

```ts
import { createForm } from "@sometic/forms";
import { useFieldArray } from "@sometic/react/form";
// Vue: useFieldArray from "@sometic/vue/form"
```

## Creating an array controller

```ts
const form = createForm({
    defaultValues: {
        items: [{ name: "", qty: 1 }],
    },
});

const items = form.createFieldArray<{ name: string; qty: number }>("items", {
    defaultItem: { name: "", qty: 1 },
});
```

`createFieldArray` is memoized per name on the form instance.

### React

```tsx
const items = useFieldArray<{ name: string; qty: number }>("items", {
    defaultItem: { name: "", qty: 1 },
});
```

### Vue

```ts
const items = useFieldArray("items", { defaultItem: { name: "", qty: 1 } });
// or useFieldArray(form, "items", options)
```

## API

```ts
type FieldArrayItem = { key: string; index: number };

type FieldArrayController<TItem> = {
    fields: () => FieldArrayItem[];
    append(item?: TItem): void;
    prepend(item?: TItem): void;
    insert(index: number, item?: TItem): void;
    remove(index: number): void;
    move(from: number, to: number): void;
    swap(a: number, b: number): void;
    replace(index: number, item: TItem): void;
    update(index: number, item: TItem): void; // alias of replace
};
```

| Method                          | Behavior                                                    |
| ------------------------------- | ----------------------------------------------------------- |
| `fields()`                      | Stable `{ key, index }` for list rendering (`fa-${n}` keys) |
| `append` / `prepend` / `insert` | Insert `item` or `defaultItem`                              |
| `remove`                        | Delete index                                                |
| `move` / `swap`                 | Reorder; no-op if out of bounds                             |
| `replace` / `update`            | Replace item at index; no-op if out of bounds               |

Missing or non-array paths are treated as `[]`.

## Rendering pattern

```tsx
function LineItems() {
    const items = useFieldArray<{ name: string }>("items", {
        defaultItem: { name: "" },
    });

    return (
        <ul>
            {items.fields().map((row) => (
                <li key={row.key}>
                    <LineName index={row.index} />
                    <button type="button" onClick={() => items.remove(row.index)}>
                        Remove
                    </button>
                </li>
            ))}
            <button type="button" onClick={() => items.append()}>
                Add
            </button>
        </ul>
    );
}

function LineName({ index }: { index: number }) {
    const { value, setValue, onBlur, meta } = useFormField(`items[${index}].name`, {
        validators: [required()],
    });
    return (
        <input
            name={`items[${index}].name`}
            value={String(value ?? "")}
            onChange={(event) => setValue(event.target.value)}
            onBlur={onBlur}
            aria-invalid={meta.invalid || undefined}
        />
    );
}
```

Use `row.key` as the React/Vue list key, not the index, so focus and local state survive reorder.

## Validation notes

- Array mutations only update values and notify subscribers.
- Call `form.validateForm()` on submit (default) or validate specific paths after edits.
- When removing rows, `unregister` nested fields if you registered them via hooks that do not unmount automatically (hooks unregister on unmount when the row component leaves the tree).

## Related

- [Fields](/forms/fields)
- [Validation](/forms/validation)
- [Form component](/components/form)
- [Forms overview](/forms/)
