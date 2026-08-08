# Accessibility statement

**Last updated:** 6 August 2026  
**Applies to:** the Sometic documentation website at [sometic.aitistack.com](https://sometic.aitistack.com).

Sometic’s product promise includes accessible behavior in components. This page covers accessibility of the **documentation Site** itself.

## Commitment

We aim for the documentation Site to be usable with keyboard navigation, assistive technologies, and clear visual hierarchy. Component packages document accessibility expectations separately in the [Accessibility guide](/guide/accessibility) and individual component pages.

## Standards we target

We design and review the Site against the spirit of **WCAG 2.2 Level AA** for documentation content: text alternatives where practical, keyboard operability, visible focus, sufficient contrast for primary UI chrome, and readable structure (headings, lists, landmarks provided by the docs theme).

## Known limitations (docs Site)

- Some interactive demos are illustrative and may use `aria-hidden` collage regions on the home page that are not intended as operable UI.
- Dense API tables and code blocks can be verbose for screen reader users; we structure pages with headings to improve navigation.
- Third-party embeds (if added later) may not meet the same standard; we will disclose them when introduced.
- Beta documentation may temporarily include incomplete examples; we label maturity on [Beta](/releases/beta).

## Compatibility

The Site targets evergreen browsers listed in [Browser support](/guide/browser-support). Assistive technology support depends on the browser + AT combination.

## Feedback

If you encounter an accessibility barrier on the documentation Site:

1. Open an issue in the Sometic packages repository under [github.com/aitistack](https://github.com/aitistack)
2. Include the page URL, your browser / AT, and what you expected vs what happened

We prioritize fixes that unblock reading docs or completing documented examples.

## Product accessibility

For how Sometic **components** handle focus, keyboard interaction, and ARIA patterns, start with:

- [Accessibility guide](/guide/accessibility)
- Component pages under [Components](/components/)
