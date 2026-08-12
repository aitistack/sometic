# Structure comparison

Why Sometic structure engines instead of framework-only kits.

## Vs Radix / React Aria Tabs & Accordion

| | Sometic | Radix / React Aria |
| - | ------- | ------------------ |
| Behavior home | `@sometic/dom` shared with Vue and Vanilla | React (or React Aria) first |
| Styling | Unstyled resolve + slots/`data-state` | Unstyled, your CSS |
| Portability | Same controller across stacks | Reimplement or wrap per framework |

Choose Radix/React Aria when you are React-only and already invested. Choose Sometic when the same tab/accordion behavior must survive a framework change.

## Vs cmdk / command menus

cmdk is excellent for React command UIs. Sometic Command palette is a smaller, portable engine composed with overlay chrome, without locking you to React or a styled kit.

## Vs React Aria Tree / Headless UI

Sometic Tree is single-select, no virtualization, honest about large-list limits. Prefer React Aria when you need multi-select, dense grid trees, or React-only depth today.

## Vs building Navbar / Sidebar chrome

App chrome (navbars, sidebars) stays composition: layout + [Menu](/components/menu) + maybe Tree. Sometic does not ship a Nav Menu package in Phase 20 Option A.

## Related

- [Structure FAQ](/components/structure-faq)
- [Tabs](/components/tabs)
- [Command palette](/components/command-palette)
- [Tree](/components/tree)
- [Why Sometic](/guide/why-sometic)
