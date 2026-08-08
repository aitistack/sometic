import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type AlertTone = "info" | "success" | "warning" | "danger";
export type AlertLive = "polite" | "assertive";

export type ResolveAlertOptions = StyleableProps<"root"> & {
    tone?: AlertTone;
    live?: AlertLive;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type AlertViewModel = {
    tone: AlertTone;
    live: AlertLive;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveAlert(options: ResolveAlertOptions = {}): AlertViewModel {
    const tone = options.tone ?? "info";
    const live = options.live ?? (tone === "danger" ? "assertive" : "polite");
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        tone,
        live,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: live === "assertive" ? "alert" : "status",
            "data-slot": "root",
            "data-tone": tone,
            "aria-live": live,
            "aria-atomic": "true",
        },
    };
}
