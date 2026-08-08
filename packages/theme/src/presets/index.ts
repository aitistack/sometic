import { defineTokens } from "../tokens/index.js";
import type { ThemeDefinition } from "../create-theme-controller.js";

const sharedSpace = {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
} as const;

const sharedRadius = {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
} as const;

export const lightTokens = defineTokens({
    color: {
        bg: "#ffffff",
        fg: "#111827",
        muted: "#6b7280",
        primary: "#2563eb",
        danger: "#dc2626",
    },
    space: sharedSpace,
    radius: sharedRadius,
});

export const darkTokens = defineTokens({
    color: {
        bg: "#0b1220",
        fg: "#f9fafb",
        muted: "#9ca3af",
        primary: "#60a5fa",
        danger: "#f87171",
    },
    space: sharedSpace,
    radius: sharedRadius,
});

export const lightTheme: ThemeDefinition = {
    id: "light",
    colorScheme: "light",
    tokens: lightTokens,
};

export const darkTheme: ThemeDefinition = {
    id: "dark",
    colorScheme: "dark",
    tokens: darkTokens,
};
