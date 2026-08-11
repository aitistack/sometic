import { defineConfig } from "vitepress";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    title: "Sometic",
    titleTemplate: ":title | Sometic",
    description:
        "Sometic (@sometic) is an open-source TypeScript library by AitiStack for portable application behavior: shared controllers for UI, forms, auth, and HTTP, with thin React, Vue, and Web Components adapters.",
    lang: "en-US",
    cleanUrls: true,
    lastUpdated: true,
    srcExclude: [
        "**/public-api-inventory.md",
        "architecture/**",
        "packages/**",
        "guide/development.md",
        "guide/repository-structure.md",
        "guide/release.md",
        "guide/getting-started.md",
    ],
    sitemap: {
        hostname: "https://sometic.aitistack.com",
    },
    /**
     * Drop VitePress Inter (Google Fonts + local subsets). We use self-hosted Urbanist/Chakra.
     * Also add a main landmark for a11y / best-practices audits.
     */
    transformHtml(code) {
        return code
            .replace(/<link rel="preload" href="[^"]*inter[^"]+"[^>]*>\s*/gi, "")
            .replace(/(<div[^>]*\bid="VPContent")/, '$1 role="main"');
    },
    vite: {
        plugins: [
            {
                name: "sometic-strip-vitepress-inter",
                enforce: "pre",
                resolveId(id, importer) {
                    // Default theme pulls Inter via Google Fonts + local subsets.
                    if (
                        id.includes("theme-default/styles/fonts.css") ||
                        (id.endsWith("/styles/fonts.css") && importer?.includes("theme-default"))
                    ) {
                        return fileURLToPath(new URL("./theme/fonts-empty.css", import.meta.url));
                    }
                    return null;
                },
                generateBundle(_options, bundle) {
                    for (const fileName of Object.keys(bundle)) {
                        if (/inter[-.].*\.woff2$/i.test(fileName)) {
                            delete bundle[fileName];
                        }
                    }
                },
            },
        ],
        build: {
            chunkSizeWarningLimit: 900,
            cssCodeSplit: true,
        },
    },
    head: [
        ["link", { rel: "icon", href: "/favicon.ico", sizes: "any" }],
        ["link", { rel: "icon", href: "/favicon-96x96.png", type: "image/png", sizes: "96x96" }],
        ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" }],
        [
            "meta",
            {
                name: "google-site-verification",
                content: "KDg6yRfpvw-MdB48t24TJPS3PNTn-dUFiy5xiJOt9c4",
            },
        ],
        /* Critical self-hosted faces — latin WOFF2 only (~36KB combined) */
        [
            "link",
            {
                rel: "preload",
                href: "/fonts/Urbanist/Urbanist-latin.woff2",
                as: "font",
                type: "font/woff2",
                crossorigin: "",
            },
        ],
        [
            "link",
            {
                rel: "preload",
                href: "/fonts/Chakra_Petch/ChakraPetch-Bold-latin.woff2",
                as: "font",
                type: "font/woff2",
                crossorigin: "",
            },
        ],
        ["meta", { name: "theme-color", content: "#1E3E5B" }],
        ["meta", { name: "color-scheme", content: "light dark" }],
        ["meta", { name: "referrer", content: "strict-origin-when-cross-origin" }],
        ["meta", { name: "format-detection", content: "telephone=no" }],
        [
            "link",
            {
                rel: "alternate",
                type: "text/plain",
                title: "LLM documentation",
                href: "/llms.txt",
            },
        ],
        [
            "link",
            {
                rel: "alternate",
                type: "text/plain",
                title: "LLM full documentation export",
                href: "/llms-full.txt",
            },
        ],
        ["link", { rel: "author", href: "/.well-known/security.txt" }],
        ["meta", { property: "og:type", content: "website" }],
        ["meta", { property: "og:site_name", content: "Sometic" }],
        [
            "meta",
            {
                property: "og:description",
                content:
                    "Sometic (@sometic) is an open-source TypeScript library by AitiStack for portable application behavior: UI, forms, auth, and HTTP across React, Vue, and Web Components.",
            },
        ],
        ["meta", { property: "og:url", content: "https://sometic.aitistack.com" }],
        ["meta", { property: "og:image", content: "https://sometic.aitistack.com/icon.png" }],
        ["meta", { name: "twitter:card", content: "summary" }],
        [
            "meta",
            {
                name: "twitter:description",
                content:
                    "Sometic (@sometic) is an open-source TypeScript library by AitiStack for portable application behavior: UI, forms, auth, and HTTP across React, Vue, and Web Components.",
            },
        ],
        ["meta", { name: "twitter:image", content: "https://sometic.aitistack.com/icon.png" }],
        [
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "Organization",
                        "@id": "https://sometic.aitistack.com/#organization",
                        name: "Sometic",
                        alternateName: ["@sometic", "Sometic by AitiStack"],
                        url: "https://sometic.aitistack.com",
                        logo: "https://sometic.aitistack.com/icon.png",
                        sameAs: [
                            "https://github.com/aitistack/sometic",
                            "https://www.npmjs.com/org/sometic",
                        ],
                        parentOrganization: {
                            "@type": "Organization",
                            name: "AitiStack",
                            url: "https://portfolio.aitistack.com",
                        },
                    },
                    {
                        "@type": "WebSite",
                        "@id": "https://sometic.aitistack.com/#website",
                        name: "Sometic Docs",
                        url: "https://sometic.aitistack.com",
                        description:
                            "Documentation for Sometic, the open-source @sometic TypeScript library for portable UI, forms, auth, and HTTP behavior across JavaScript frameworks.",
                        publisher: { "@id": "https://sometic.aitistack.com/#organization" },
                        inLanguage: "en-US",
                    },
                    {
                        "@type": "SoftwareApplication",
                        "@id": "https://sometic.aitistack.com/#software",
                        name: "Sometic",
                        alternateName: ["@sometic", "Sometic UI", "Sometic React"],
                        applicationCategory: "DeveloperApplication",
                        applicationSubCategory: "JavaScript library",
                        operatingSystem: "Any",
                        url: "https://sometic.aitistack.com",
                        downloadUrl: "https://www.npmjs.com/org/sometic",
                        sameAs: [
                            "https://github.com/aitistack/sometic",
                            "https://www.npmjs.com/org/sometic",
                        ],
                        softwareVersion: "0.1.0-beta",
                        license: "https://opensource.org/licenses/MIT",
                        author: { "@id": "https://sometic.aitistack.com/#organization" },
                        offers: {
                            "@type": "Offer",
                            price: "0",
                            priceCurrency: "USD",
                        },
                        description:
                            "Sometic is an open-source TypeScript / JavaScript library (npm scope @sometic), not a sociogram tool. It provides portable application behavior engines for UI, forms, authentication, HTTP, query, and document head, with thin adapters for React, Vue, and Web Components (sometic-* custom elements).",
                        featureList: [
                            "Framework-agnostic behavior controllers",
                            "React, Vue, and Web Components adapters",
                            "Forms and validation engines",
                            "Auth orchestration with optional providers",
                            "Fetch-first HTTP client with refresh queue",
                            "Unstyled, design-system friendly APIs",
                        ],
                        keywords:
                            "Sometic, @sometic, TypeScript, React, Vue, Web Components, headless UI, forms, authentication, HTTP client, portable application behavior",
                    },
                ],
            }),
        ],
    ],
    transformHead({ pageData }) {
        const pageTitle =
            pageData.relativePath === "index.md"
                ? "Home"
                : pageData.title?.trim() || "Sometic";
        const fullTitle =
            pageTitle === "Sometic" ? "Sometic" : `${pageTitle} | Sometic`;
        return [
            ["meta", { property: "og:title", content: fullTitle }],
            ["meta", { name: "twitter:title", content: fullTitle }],
        ];
    },
    themeConfig: {
        logo: {
            light: "/icon.png",
            dark: "/icon.png",
            alt: "Sometic",
        },
        siteTitle: false,
        nav: [
            { text: "Guide", link: "/guide/introduction" },
            { text: "Architecture", link: "/concepts/architecture" },
            {
                text: "System",
                items: [
                    { text: "App Shell", link: "/guide/app-shell" },
                    { text: "Authentication", link: "/authentication/" },
                    { text: "HTTP", link: "/utilities/http" },
                    { text: "Query", link: "/utilities/query" },
                    { text: "Head / SEO", link: "/utilities/head" },
                    { text: "Forms", link: "/forms/" },
                    { text: "Stores", link: "/stores/" },
                    { text: "Theming", link: "/theming/" },
                    { text: "Foundation", link: "/primitives/" },
                ],
            },
            { text: "Frameworks", link: "/frameworks/" },
            { text: "Components", link: "/components/" },
            {
                text: "More",
                items: [
                    { text: "Why Sometic", link: "/guide/why-sometic" },
                    { text: "Comparison", link: "/guide/comparison" },
                    { text: "API reference", link: "/api/" },
                    { text: "Releases", link: "/releases/" },
                    { text: "Beta maturity", link: "/releases/beta" },
                    { text: "Contributing", link: "/guide/contributing" },
                    { text: "Legal", link: "/legal/" },
                    { text: "llms.txt", link: "/llms.txt" },
                ],
            },
            { text: "v0.1.0-beta", link: "/releases/beta" },
        ],
        sidebar: {
            "/legal/": [
                {
                    text: "Legal",
                    items: [
                        { text: "Overview", link: "/legal/" },
                        { text: "Privacy", link: "/legal/privacy" },
                        { text: "Terms of use", link: "/legal/terms" },
                        { text: "License", link: "/legal/license" },
                        { text: "Accessibility", link: "/legal/accessibility" },
                        { text: "Security", link: "/legal/security" },
                    ],
                },
            ],
            "/guide/": [
                {
                    text: "Guide",
                    items: [
                        { text: "Introduction", link: "/guide/introduction" },
                        { text: "Why Sometic", link: "/guide/why-sometic" },
                        { text: "What's included", link: "/guide/whats-included" },
                        { text: "App Shell", link: "/guide/app-shell" },
                        { text: "Comparison", link: "/guide/comparison" },
                        { text: "Installation", link: "/guide/installation" },
                        { text: "Quick start", link: "/guide/quick-start" },
                        { text: "Package managers", link: "/guide/package-managers" },
                        { text: "TypeScript", link: "/guide/typescript" },
                        { text: "JavaScript", link: "/guide/javascript" },
                        { text: "Styling", link: "/guide/styling" },
                        { text: "Accessibility", link: "/guide/accessibility" },
                        { text: "SSR", link: "/guide/ssr" },
                        { text: "Browser support", link: "/guide/browser-support" },
                        { text: "Troubleshooting", link: "/guide/troubleshooting" },
                        { text: "CLI", link: "/guide/cli" },
                        { text: "Agents", link: "/guide/agents" },
                        { text: "Contributing", link: "/guide/contributing" },
                    ],
                },
            ],
            "/concepts/": [
                {
                    text: "Concepts",
                    items: [
                        { text: "Architecture", link: "/concepts/architecture" },
                        { text: "Controlled state", link: "/concepts/controlled-state" },
                        { text: "Uncontrolled state", link: "/concepts/uncontrolled-state" },
                        { text: "Styling slots", link: "/concepts/styling-slots" },
                        { text: "State attributes", link: "/concepts/state-attributes" },
                        { text: "Design tokens", link: "/concepts/design-tokens" },
                        { text: "Framework adapters", link: "/concepts/framework-adapters" },
                        { text: "Tree shaking", link: "/concepts/tree-shaking" },
                        { text: "Bundlers", link: "/concepts/bundlers" },
                    ],
                },
            ],
            "/components/": [
                {
                    text: "Overview",
                    items: [{ text: "All components", link: "/components/" }],
                },
                {
                    text: "Button",
                    items: [
                        { text: "Button", link: "/components/button" },
                        { text: "Icon button", link: "/components/icon-button" },
                        { text: "Button group", link: "/components/button-group" },
                        { text: "Toggle button", link: "/components/toggle-button" },
                        { text: "Async button", link: "/components/async-button" },
                    ],
                },
                {
                    text: "Field & form",
                    items: [
                        { text: "Field", link: "/components/field" },
                        { text: "Form", link: "/components/form" },
                        { text: "Input", link: "/components/input" },
                        { text: "Password input", link: "/components/password-input" },
                        { text: "OTP input", link: "/components/otp-input" },
                        { text: "Number input", link: "/components/number-input" },
                        { text: "File input", link: "/components/file-input" },
                        { text: "Masked input", link: "/components/masked-input" },
                        { text: "Currency input", link: "/components/currency-input" },
                        { text: "Date input", link: "/components/date-input" },
                    ],
                },
                {
                    text: "Selection",
                    items: [
                        { text: "Checkbox", link: "/components/checkbox" },
                        { text: "Switch", link: "/components/switch" },
                        { text: "Radio", link: "/components/radio" },
                        { text: "Select", link: "/components/select" },
                        { text: "Combobox", link: "/components/combobox" },
                    ],
                },
                {
                    text: "Overlay & feedback",
                    items: [
                        { text: "Dialog", link: "/components/dialog" },
                        { text: "Drawer", link: "/components/drawer" },
                        { text: "Menu", link: "/components/menu" },
                        { text: "Context menu", link: "/components/context-menu" },
                        { text: "Popover", link: "/components/popover" },
                        { text: "Tooltip", link: "/components/tooltip" },
                        { text: "Toast", link: "/components/toast" },
                        { text: "Alert", link: "/components/alert" },
                        { text: "Progress", link: "/components/progress" },
                        { text: "Spinner", link: "/components/spinner" },
                        { text: "Skeleton", link: "/components/skeleton" },
                        { text: "Badge", link: "/components/badge" },
                    ],
                },
                {
                    text: "Structure",
                    items: [
                        { text: "Tabs", link: "/components/tabs" },
                        { text: "Accordion", link: "/components/accordion" },
                        { text: "Breadcrumb", link: "/components/breadcrumb" },
                    ],
                },
            ],
            "/primitives/": [
                {
                    text: "Foundation",
                    items: [
                        { text: "Overview", link: "/primitives/" },
                        { text: "Core", link: "/primitives/core" },
                        { text: "Events", link: "/primitives/events" },
                        { text: "DOM", link: "/primitives/dom" },
                        { text: "Accessibility", link: "/primitives/accessibility" },
                        { text: "Styling", link: "/primitives/styling" },
                        { text: "Validation", link: "/primitives/validation" },
                        { text: "Date adapters", link: "/primitives/date" },
                        { text: "Positioning", link: "/primitives/positioning" },
                    ],
                },
            ],
            "/utilities/": [
                {
                    text: "Utilities",
                    items: [
                        { text: "Overview", link: "/utilities/" },
                        { text: "HTTP client", link: "/utilities/http" },
                        { text: "Query", link: "/utilities/query" },
                        { text: "Head / SEO", link: "/utilities/head" },
                    ],
                },
            ],
            "/services/": [
                {
                    text: "Services",
                    items: [
                        { text: "Overview", link: "/services/" },
                        { text: "Auth controller", link: "/services/auth" },
                        { text: "HTTP client", link: "/services/http" },
                    ],
                },
            ],
            "/stores/": [
                {
                    text: "Stores",
                    items: [
                        { text: "Overview", link: "/stores/" },
                        { text: "Store", link: "/stores/store" },
                        { text: "Immer adapter", link: "/stores/store-immer" },
                        { text: "Theme store", link: "/stores/theme" },
                    ],
                },
            ],
            "/authentication/": [
                {
                    text: "Authentication",
                    items: [
                        { text: "Overview", link: "/authentication/" },
                        { text: "Installation", link: "/authentication/installation" },
                        { text: "Configuration", link: "/authentication/configuration" },
                        { text: "Local provider", link: "/authentication/local-provider" },
                        { text: "Firebase", link: "/authentication/firebase" },
                        { text: "Supabase", link: "/authentication/supabase" },
                        { text: "OIDC", link: "/authentication/oidc" },
                        { text: "Session management", link: "/authentication/session-management" },
                        { text: "Token refresh", link: "/authentication/token-refresh" },
                        { text: "Interceptors", link: "/authentication/interceptors" },
                        { text: "Authorization", link: "/authentication/authorization" },
                        { text: "Troubleshooting", link: "/authentication/troubleshooting" },
                    ],
                },
            ],
            "/theming/": [
                {
                    text: "Theming",
                    items: [
                        { text: "Overview", link: "/theming/" },
                        { text: "Installation", link: "/theming/installation" },
                        { text: "Tokens", link: "/theming/tokens" },
                        { text: "Themes", link: "/theming/themes" },
                        { text: "Runtime switching", link: "/theming/runtime-switching" },
                        { text: "CSS variables", link: "/theming/css-variables" },
                        { text: "Tailwind", link: "/theming/tailwind" },
                        { text: "Bootstrap", link: "/theming/bootstrap" },
                        { text: "Plain CSS", link: "/theming/plain-css" },
                    ],
                },
            ],
            "/forms/": [
                {
                    text: "Forms",
                    items: [
                        { text: "Overview", link: "/forms/" },
                        { text: "Fields", link: "/forms/fields" },
                        { text: "Validation", link: "/forms/validation" },
                        { text: "Async validation", link: "/forms/async-validation" },
                        { text: "Field arrays", link: "/forms/field-arrays" },
                        { text: "Server errors", link: "/forms/server-errors" },
                        { text: "Persistence", link: "/forms/persistence" },
                    ],
                },
            ],
            "/frameworks/": [
                {
                    text: "Overview",
                    items: [
                        { text: "Frameworks", link: "/frameworks/" },
                        { text: "Compatibility", link: "/frameworks/compatibility" },
                    ],
                },
                {
                    text: "Wave A, full adapters",
                    items: [
                        { text: "Vanilla / elements", link: "/frameworks/vanilla" },
                        { text: "React", link: "/frameworks/react" },
                        { text: "Vue", link: "/frameworks/vue" },
                    ],
                },
                {
                    text: "Wave B, store bind",
                    items: [
                        { text: "Angular", link: "/frameworks/angular" },
                        { text: "Svelte", link: "/frameworks/svelte" },
                        { text: "Solid", link: "/frameworks/solid" },
                        { text: "Preact", link: "/frameworks/preact" },
                    ],
                },
                {
                    text: "Wave C, HTML-first",
                    items: [
                        { text: "Alpine.js", link: "/frameworks/alpine" },
                        { text: "jQuery", link: "/frameworks/jquery" },
                        { text: "HTMX", link: "/frameworks/htmx" },
                    ],
                },
            ],
            "/api/": [
                {
                    text: "API reference",
                    items: [
                        { text: "Overview", link: "/api/" },
                        { text: "Package index", link: "/api/packages" },
                    ],
                },
            ],
            "/releases/": [
                {
                    text: "Releases",
                    items: [
                        { text: "Overview", link: "/releases/" },
                        { text: "Beta maturity", link: "/releases/beta" },
                        { text: "Changelog", link: "/releases/changelog" },
                    ],
                },
            ],
        },
        socialLinks: [{ icon: "github", link: "https://github.com/aitistack/sometic" }],
        footer: {
            message:
                '<p class="sometic-footer-kicker">Open source under the <a href="/legal/license">MIT License</a></p><nav class="sometic-footer-links" aria-label="Legal and trust"><a href="/guide/contributing">Contributing</a><a href="/legal/privacy">Privacy</a><a href="/legal/terms">Terms</a><a href="/legal/accessibility">Accessibility</a><a href="/legal/security">Security</a><a href="/llms.txt">llms.txt</a></nav>',
            copyright:
                '<div class="sometic-footer-brand"><img class="sometic-footer-logo light" src="/logo.png" alt="Sometic" /><img class="sometic-footer-logo dark" src="/logo-dark.png" alt="Sometic" /><p class="sometic-footer-by">by <a href="https://portfolio.aitistack.com" target="_blank" rel="noopener noreferrer">AitiStack</a></p></div>',
        },
        search: {
            provider: "local",
        },
        outline: {
            level: [2, 3],
        },
    },
});
