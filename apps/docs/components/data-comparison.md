# Data & business comparison

Why Sometic Phase 21 engines instead of framework-only kits.

## Vs TanStack Table / AG Grid

| | Sometic data table | TanStack Table | AG Grid / commercial |
| - | ------------------ | -------------- | -------------------- |
| Behavior home | `@sometic/data-table` + DOM resolve shared with Vue and Vanilla | React-first ecosystem | Product UI + license |
| Styling | Unstyled slots / ARIA | Headless | Often themed |
| Portability | Same controller across stacks | Reimplement chrome per framework | Vendor lock-in |
| Scope | Sort, filter, page, selection, URL sync, pure virtual window | Huge plugin surface | Spreadsheet features |

Choose TanStack when you are React-only and want its plugin depth. Choose AG Grid when you need pivots and cell editing out of the box. Choose Sometic when table behavior must match forms, HTTP, and query-builder bridges across stacks.

## Vs react-querybuilder / filter UIs

Sometic Query builder is an AST engine (validate, serialize, `toDataTableFilters`) without a frozen rule-row design. Bring your own selects and layout. Prefer react-querybuilder when you want a React-only visual builder with batteries included.

## Vs native file input / Uppy / Dropzone

Native `<input type="file">` is enough for one field. Uppy and similar kits own chrome and transports. Sometic Upload is a queue + dropzone resolve + pluggable `UploadTransport` (HTTP helper included), so progress, cancel, and retry stay portable without a visual kit.

## Vs Authz admin kits / CASL UI

Permission matrix is a grid UX for allow/deny cells, not a policy language. Keep Casbin/CASL/OPA (or your API) as the source of truth; use the matrix to edit a projection the server already understands.

## Vs in-app toast / email / push vendors

Notification center is an inbox list with read/dismiss semantics. Toasts remain [Toast](/components/toast). Push and email delivery stay in your backend or vendor SDKs; feed items into `@sometic/notifications`.

## Vs workflow engines

Approval is a lightweight multi-step require-all / require-any controller for UI gates. It is not Temporal, Camunda, or a durable workflow runtime. Persist decisions on the server.

## Vs empty-state kits

Status resolve helpers are small ARIA-friendly cards for empty, error, offline, and conflict. Prefer a design-system Empty component when you need illustration kits; keep Sometic when the same resolve contract must work in Vanilla and adapters.

## Related

- [Data FAQ](/components/data-faq)
- [Data table](/components/data-table)
- [Query builder](/components/query-builder)
- [Upload](/components/upload)
- [Why Sometic](/guide/why-sometic)
