import {
    applyThemeToElement,
    createThemeController,
    type ThemeDensity,
    type ThemeMode,
} from "@sometic/theme";
import { darkTheme, lightTheme } from "@sometic/theme/presets";

export function mountThemeSection(root: HTMLElement): () => void {
    const theme = createThemeController({
        themes: [lightTheme, darkTheme],
        defaultThemeId: "light",
        darkThemeId: "dark",
        mode: "system",
    });

    const status = root.querySelector<HTMLElement>("[data-theme-status]");
    const modeButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-theme-mode]")];
    const densityButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-theme-density]")];
    const dirButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-theme-dir]")];

    const paint = (): void => {
        const snapshot = theme.get();
        applyThemeToElement(document.documentElement, snapshot);
        if (status) {
            status.textContent = [
                `theme=${snapshot.resolvedThemeId}`,
                `scheme=${snapshot.resolvedColorScheme}`,
                `mode=${snapshot.preferences.mode}`,
                `density=${snapshot.preferences.density}`,
                `dir=${snapshot.preferences.direction}`,
            ].join(" · ");
        }
        for (const button of modeButtons) {
            button.dataset.active = String(button.dataset.themeMode === snapshot.preferences.mode);
        }
        for (const button of densityButtons) {
            button.dataset.active = String(
                button.dataset.themeDensity === snapshot.preferences.density,
            );
        }
        for (const button of dirButtons) {
            button.dataset.active = String(
                button.dataset.themeDir === snapshot.preferences.direction,
            );
        }
    };

    const onMode = (event: Event): void => {
        const target = event.currentTarget as HTMLButtonElement;
        const mode = target.dataset.themeMode as ThemeMode | undefined;
        if (mode) {
            theme.setMode(mode);
        }
    };
    const onDensity = (event: Event): void => {
        const target = event.currentTarget as HTMLButtonElement;
        const density = target.dataset.themeDensity as ThemeDensity | undefined;
        if (density) {
            theme.setDensity(density);
        }
    };
    const onDir = (event: Event): void => {
        const target = event.currentTarget as HTMLButtonElement;
        const dir = target.dataset.themeDir;
        if (dir === "ltr" || dir === "rtl") {
            theme.setDirection(dir);
        }
    };

    for (const button of modeButtons) {
        button.addEventListener("click", onMode);
    }
    for (const button of densityButtons) {
        button.addEventListener("click", onDensity);
    }
    for (const button of dirButtons) {
        button.addEventListener("click", onDir);
    }

    const stop = theme.subscribe(() => {
        paint();
    });
    paint();

    return () => {
        stop();
        for (const button of modeButtons) {
            button.removeEventListener("click", onMode);
        }
        for (const button of densityButtons) {
            button.removeEventListener("click", onDensity);
        }
        for (const button of dirButtons) {
            button.removeEventListener("click", onDir);
        }
        theme.dispose();
    };
}
