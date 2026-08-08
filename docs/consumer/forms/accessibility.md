# Forms accessibility

- Prefer native `<form>` / control semantics.
- Wire `aria-invalid` from field meta.
- On invalid submit: announce a summary (`announceFormErrors`) and `focusFirstInvalid`.
- Keep error text associated via Field `aria-describedby` (Phase 8 Field).
