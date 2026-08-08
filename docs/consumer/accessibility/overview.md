# Accessibility — Overview

`@sometic/accessibility` provides framework-neutral DOM accessibility engines that components and adapters compose — never reimplement ad hoc.

## Modules

| Module                 | Import                              |
| ---------------------- | ----------------------------------- |
| Focus trap / tab order | `@sometic/accessibility/focus`       |
| Keyboard bindings      | `@sometic/accessibility/keyboard`    |
| Dismissable layer      | `@sometic/accessibility/dismissable` |
| Portal root            | `@sometic/accessibility/portal`      |
| Scroll lock            | `@sometic/accessibility/scroll-lock` |
| Live announcer         | `@sometic/accessibility/announcer`   |
| Observers              | `@sometic/accessibility/observers`   |

## When to use

Building overlays, dialogs, menus, toasts, or any interactive surface that needs focus containment, Escape/outside dismiss, scroll locking, or SR announcements.

## When not to use

- Prefer native `<button>` / `<dialog>` semantics first; engines fill gaps, they do not replace natives
- Framework hooks (`useFocusTrap`) arrive with adapters later
- Full WCAG certification ≠ shipping these helpers alone

## Screen-reader relationships

| Engine         | SR / AT role                                                               |
| -------------- | -------------------------------------------------------------------------- |
| Focus trap     | Keeps keyboard focus inside a modal surface; restores focus to the trigger |
| Live announcer | Polite/assertive status updates via `aria-live`                            |
| Dismissable    | Escape/outside close — pair with visible close control + labelled dialog   |
