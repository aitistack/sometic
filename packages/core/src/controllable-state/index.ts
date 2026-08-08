export type ControllableStateOptions<T> = {
    value?: T;
    defaultValue: T;
    onChange?: (value: T) => void;
    isEqual?: (left: T, right: T) => boolean;
};

export type ControllableState<T> = {
    get(): T;
    set(next: T): void;
    update(updater: (current: T) => T): void;
    reset(): void;
    readonly isControlled: boolean;
};

export function createControllableState<T>(
    options: ControllableStateOptions<T>,
): ControllableState<T> {
    const isEqual = options.isEqual ?? Object.is;
    const isControlled = Object.prototype.hasOwnProperty.call(options, "value");
    let uncontrolledValue = options.defaultValue;
    let reentrant = false;

    const get = (): T => {
        if (isControlled) {
            return options.value as T;
        }

        return uncontrolledValue;
    };

    const set = (next: T): void => {
        if (reentrant) {
            return;
        }

        const current = get();
        if (isEqual(current, next)) {
            return;
        }

        if (!isControlled) {
            uncontrolledValue = next;
        }

        if (options.onChange) {
            reentrant = true;
            try {
                options.onChange(next);
            } finally {
                reentrant = false;
            }
        }
    };

    return {
        get isControlled() {
            return isControlled;
        },
        get,
        set,
        update(updater) {
            set(updater(get()));
        },
        reset() {
            set(options.defaultValue);
        },
    };
}
