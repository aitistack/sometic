export type DisposeFn = () => void;

export interface Disposable {
    readonly disposed: boolean;
    dispose(): void;
}

export function createDisposable(onDispose: DisposeFn): Disposable {
    let disposed = false;

    return {
        get disposed() {
            return disposed;
        },
        dispose() {
            if (disposed) {
                return;
            }

            disposed = true;
            onDispose();
        },
    };
}

export class DisposableStack implements Disposable {
    #disposed = false;
    readonly #stack: DisposeFn[] = [];

    get disposed(): boolean {
        return this.#disposed;
    }

    use(disposable: Disposable | DisposeFn): this {
        this.#assertNotDisposed();
        if (typeof disposable === "function") {
            this.#stack.push(disposable);
        } else {
            this.#stack.push(() => {
                disposable.dispose();
            });
        }
        return this;
    }

    defer(onDispose: DisposeFn): this {
        return this.use(onDispose);
    }

    adopt<T>(value: T, onDispose: (value: T) => void): T {
        this.#assertNotDisposed();
        this.#stack.push(() => {
            onDispose(value);
        });
        return value;
    }

    move(): DisposableStack {
        this.#assertNotDisposed();
        const next = new DisposableStack();
        while (this.#stack.length > 0) {
            const item = this.#stack.pop();
            if (item) {
                next.#stack.unshift(item);
            }
        }
        this.#disposed = true;
        return next;
    }

    dispose(): void {
        if (this.#disposed) {
            return;
        }

        this.#disposed = true;
        const errors: unknown[] = [];

        while (this.#stack.length > 0) {
            const item = this.#stack.pop();
            if (!item) {
                continue;
            }

            try {
                item();
            } catch (error) {
                errors.push(error);
            }
        }

        if (errors.length === 1) {
            throw errors[0];
        }

        if (errors.length > 1) {
            throw new AggregateError(errors, "DisposableStack.dispose encountered multiple errors");
        }
    }

    #assertNotDisposed(): void {
        if (this.#disposed) {
            throw new Error("DisposableStack has already been disposed");
        }
    }
}
