---
"@sometic/react": patch
---

Cache React form field and form-state snapshots so useSyncExternalStore does not loop when getFieldMeta clones meta.
