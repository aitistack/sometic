# Input comparison

## Why Sometic Input

- One behavior model across Vanilla, React, Vue, and Web Components
- Native `<input>` semantics preserved
- Styling via slots/`data-*` without locking a CSS framework
- Specialized controllers without a god-component

## Why not native-only

Native inputs lack shared controlled-state helpers, field id wiring, OTP/mask/currency engines, and consistent adapter APIs across frameworks.

## Why not Radix / Headless UI alone

Those are framework-specific. Sometic keeps engines framework-free and adapters thin.

## Why not React Hook Form / Formik here

Those are form engines (Phase 9). Input/Field provide control primitives those libraries can sit on later.

## When not to use

If you need only a plain uncontrolled `<input>` with no shared adapters, native HTML is enough.
