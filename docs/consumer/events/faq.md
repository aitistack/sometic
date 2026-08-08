# Events — FAQ

## Do I need to remove listeners manually?

Prefer the `Disposable` returned by `on`/`once`, or pass an `AbortSignal`. `dispose()` on the emitter clears all listeners.

## What happens if a listener throws?

Emit continues. Provide `onListenerError` to observe failures.

## Can I emit after dispose?

No — `emit` throws. Create a new emitter.
