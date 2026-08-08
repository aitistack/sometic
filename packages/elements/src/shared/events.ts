export type SometicValueChangeDetail = {
    value: string;
};

export type SometicPressedChangeDetail = {
    pressed: boolean;
};

export type SometicCheckedChangeDetail = {
    checked: boolean;
};

export type SometicRevealedChangeDetail = {
    revealed: boolean;
};

export type SometicNumberChangeDetail = {
    value: number | null;
};

export type SometicFilesChangeDetail = {
    files: File[];
};

export type SometicDateChangeDetail = {
    value: Date | null;
};

export type SometicAsyncCompleteDetail<TData = unknown> = {
    data: TData;
};

export type SometicAsyncErrorDetail = {
    error: unknown;
};

export type SometicFormChangeDetail = {
    values: Record<string, unknown>;
};

export type SometicFormSubmitDetail = {
    values: Record<string, unknown>;
};

export type SometicFormInvalidDetail = {
    issues: unknown[];
};

export function dispatchSometicEvent<TDetail>(
    target: EventTarget,
    type: string,
    detail: TDetail,
): boolean {
    return target.dispatchEvent(
        new CustomEvent(type, {
            detail,
            bubbles: true,
            composed: true,
        }),
    );
}

declare global {
    interface HTMLElementEventMap {
        "pressed-change": CustomEvent<SometicPressedChangeDetail>;
        "checked-change": CustomEvent<SometicCheckedChangeDetail>;
        "async-complete": CustomEvent<SometicAsyncCompleteDetail>;
        "async-error": CustomEvent<SometicAsyncErrorDetail>;
        "value-change": CustomEvent<
            | SometicValueChangeDetail
            | SometicNumberChangeDetail
            | SometicFilesChangeDetail
            | SometicDateChangeDetail
        >;
        "revealed-change": CustomEvent<SometicRevealedChangeDetail>;
        "form-change": CustomEvent<SometicFormChangeDetail>;
        "form-submit": CustomEvent<SometicFormSubmitDetail>;
        "form-invalid": CustomEvent<SometicFormInvalidDetail>;
        "form-announce": CustomEvent<{ message: string }>;
    }
}
