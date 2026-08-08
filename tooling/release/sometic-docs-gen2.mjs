import fs from "node:fs";
import path from "node:path";

const root = "apps/docs";
function write(rel, body) {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body.trimStart());
}

const install = (pkg) => `## Installation

::: code-group
\`\`\`bash [npm]
npm install ${pkg}
\`\`\`
\`\`\`bash [pnpm]
pnpm add ${pkg}
\`\`\`
\`\`\`bash [yarn]
yarn add ${pkg}
\`\`\`
\`\`\`bash [bun]
bun add ${pkg}
\`\`\`
:::
`;

write(
    "authentication/index.md",
    `# Authentication

Provider-independent auth orchestration plus optional adapters.

- [Installation](/authentication/installation)
- [Configuration](/authentication/configuration)
- [Local provider](/authentication/local-provider)
- [Firebase](/authentication/firebase)
- [Supabase](/authentication/supabase)
- [OIDC](/authentication/oidc)
- [Session management](/authentication/session-management)
- [Token refresh](/authentication/token-refresh)
- [Interceptors](/authentication/interceptors)
- [Authorization](/authentication/authorization)
- [Troubleshooting](/authentication/troubleshooting)

Security: client adapters do not secure APIs. Servers enforce authorization.
`,
);

write(
    "authentication/installation.md",
    `# Auth installation

${install("@sometic/auth")}

Add a provider package as needed: \`auth-local\`, \`auth-firebase\`, \`auth-supabase\`, \`auth-oidc\`.
`,
);

write(
    "authentication/configuration.md",
    `# Configuration

\`\`\`ts
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";

const auth = createAuth({
    provider: createLocalAuthProvider({ baseUrl: "https://api.example.com" }),
    storage: createMemoryAuthStorage(),
});
\`\`\`

Await \`auth.whenReady\` before relying on session state.
`,
);

write(
    "authentication/local-provider.md",
    `# Local REST provider

${install("@sometic/auth-local")}

\`\`\`ts
import { createLocalAuthProvider } from "@sometic/auth-local";
\`\`\`

Configurable JSON REST endpoints. Inject \`fetcher\` for tests or custom HTTP.
`,
);

write(
    "authentication/firebase.md",
    `# Firebase provider

${install("@sometic/auth-firebase")}

Peer: \`firebase\`. Pass your Auth instance into \`createFirebaseAuthProvider({ auth })\`.
`,
);

write(
    "authentication/supabase.md",
    `# Supabase provider

${install("@sometic/auth-supabase")}

Peer: \`@supabase/supabase-js\`. Pass \`client.auth\` into \`createSupabaseAuthProvider\`.
`,
);

write(
    "authentication/oidc.md",
    `# OIDC provider

${install("@sometic/auth-oidc")}

Authorization Code + PKCE via \`fetch\` and Web Crypto. No OIDC SDK peer required.
`,
);

write(
    "authentication/session-management.md",
    `# Session management

Sessions live in configured storage (memory, custom). Use \`getSession\`, \`subscribe\`, and \`ensureFreshSession\` from the auth controller.
`,
);

write(
    "authentication/token-refresh.md",
    `# Token refresh

Refresh is single-flight in auth core. HTTP can call \`handleUnauthorized\` once per request via \`createAuthInterceptor\`.
`,
);

write(
    "authentication/interceptors.md",
    `# Auth HTTP interceptors

\`\`\`ts
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";

const http = createHttp({
    interceptors: [createAuthInterceptor({ auth })],
});
\`\`\`
`,
);

write(
    "authentication/authorization.md",
    `# Authorization

\`auth.can(permission)\` is for UX only (hide/disable). Always enforce permissions on the server.
`,
);

write(
    "authentication/troubleshooting.md",
    `# Auth troubleshooting

- Unsupported capability: check \`auth.supports(...)\` / provider capability matrix
- OIDC state mismatch: restart the OAuth flow
- 401 loops: ensure refresh credentials exist and interceptor replays once
`,
);

write(
    "theming/index.md",
    `# Theming

Runtime tokens and theme switching with \`@sometic/theme\`.
`,
);
write("theming/installation.md", `# Installation\n\n${install("@sometic/theme")}\n`);
write(
    "theming/tokens.md",
    `# Tokens

Define token maps and resolve CSS variables through the theme controller.
`,
);
write(
    "theming/themes.md",
    `# Themes

Register named themes and switch by id/mode.
`,
);
write(
    "theming/runtime-switching.md",
    `# Runtime switching

\`\`\`ts
import { createThemeController } from "@sometic/theme";
const theme = createThemeController({ defaultMode: "system" });
theme.setMode("dark");
\`\`\`
`,
);
write(
    "theming/css-variables.md",
    `# CSS variables

Theme mount writes CSS custom properties on a root element for plain CSS consumption.
`,
);
write(
    "theming/tailwind.md",
    `# Tailwind

Map Sometic CSS variables into Tailwind theme extensions. Sometic does not bundle Tailwind.
`,
);
write(
    "theming/bootstrap.md",
    `# Bootstrap

Use Bootstrap utility classes via styling slots. Sometic does not bundle Bootstrap.
`,
);
write(
    "theming/plain-css.md",
    `# Plain CSS

Style against state attributes and CSS variables without a CSS framework.
`,
);

write(
    "forms/index.md",
    `# Forms

Framework-independent form engine with validation.

${install("@sometic/forms @sometic/validation")}
`,
);
write(
    "forms/fields.md",
    `# Fields

Bind field controllers to inputs. Compose with Field UI from \`@sometic/react\` / elements.
`,
);
write(
    "forms/validation.md",
    `# Validation

Use \`@sometic/validation\` validators and form-level composition (\`pipe\` / \`all\` / \`refine\`).
`,
);
write(
    "forms/async-validation.md",
    `# Async validation

Run async validators through the form engine; surface issues on fields without blocking unrelated inputs incorrectly.
`,
);
write(
    "forms/field-arrays.md",
    `# Field arrays

Manage repeating field groups through form array helpers exported by \`@sometic/forms\`.
`,
);
write(
    "forms/server-errors.md",
    `# Server errors

Map API error payloads onto field paths using the form error APIs.
`,
);
write(
    "forms/persistence.md",
    `# Persistence

Persist draft form state with store persistence helpers when needed. Do not store secrets in durable storage.
`,
);

write(
    "frameworks/index.md",
    `# Frameworks

Shipped today:

- [Vanilla / elements](/frameworks/vanilla)
- [React](/frameworks/react)
- [Vue](/frameworks/vue)

Angular, Svelte, Solid, Preact, Alpine, jQuery and HTMX adapters are on the roadmap and not documented as available yet.
`,
);
write(
    "frameworks/vanilla.md",
    `# Vanilla / Web Components

${install("@sometic/elements")}

Register \`sometic-*\` custom elements and compose with core engines directly.
`,
);
write(
    "frameworks/react.md",
    `# React

${install("@sometic/react")}

Import components from subpaths such as \`@sometic/react/button\`.
`,
);
write(
    "frameworks/vue.md",
    `# Vue

${install("@sometic/vue")}

Use Vue SFCs/composables exported by the package entries.
`,
);

write(
    "migration/from-aitistack-to-sometic.md",
    `# Migrate from @aitistack to @sometic

Sometic is the public product name. Packages moved from \`@aitistack/*\` to \`@sometic/*\`. Custom elements moved from \`aiti-*\` to \`sometic-*\`.

## Why

Official brand identity (ADR-0012). Early clones used a temporary scope that was never published to npm.

## Package mapping

Replace the scope in every dependency and import:

\`@aitistack/<name>\` → \`@sometic/<name>\`

Examples: \`core\`, \`react\`, \`vue\`, \`auth\`, \`http\`, \`elements\`.

## Installation

::: code-group
\`\`\`bash [npm]
npm uninstall @aitistack/core
npm install @sometic/core
\`\`\`
\`\`\`bash [pnpm]
pnpm remove @aitistack/core
pnpm add @sometic/core
\`\`\`
\`\`\`bash [yarn]
yarn remove @aitistack/core
yarn add @sometic/core
\`\`\`
\`\`\`bash [bun]
bun remove @aitistack/core
bun add @sometic/core
\`\`\`
:::

## Imports

\`\`\`ts
// before
import { createStore } from "@aitistack/store";
// after
import { createStore } from "@sometic/store";
\`\`\`

## Custom elements

\`\`\`html
<!-- before -->
<aiti-button>Save</aiti-button>
<!-- after -->
<sometic-button>Save</sometic-button>
\`\`\`

## Breaking changes

- Package names
- Custom element tag names and \`Sometic*\` class names
- No runtime compatibility shims

## Troubleshooting

If a package is not found, confirm you are not still requesting \`@aitistack/*\`.
`,
);

write(
    "api/index.md",
    `# API reference

Public packages are listed in [Package index](/api/packages). Prefer hand-written guides in Components / Primitives / Services for usage; declaration files are the source of truth for exact signatures.
`,
);

write(
    "api/packages.md",
    `# Package index

| Package | Role |
| --- | --- |
| \`@sometic/core\` | Foundation contracts |
| \`@sometic/events\` | Events |
| \`@sometic/store\` | Store |
| \`@sometic/store-immer\` | Immer adapter |
| \`@sometic/styling\` | Styling resolvers |
| \`@sometic/theme\` | Theme |
| \`@sometic/accessibility\` | A11y helpers |
| \`@sometic/dom\` | DOM engines |
| \`@sometic/validation\` | Validation |
| \`@sometic/forms\` | Forms |
| \`@sometic/auth\` | Auth core |
| \`@sometic/auth-local\` | Local provider |
| \`@sometic/auth-firebase\` | Firebase provider |
| \`@sometic/auth-supabase\` | Supabase provider |
| \`@sometic/auth-oidc\` | OIDC provider |
| \`@sometic/http\` | HTTP client |
| \`@sometic/elements\` | Custom elements |
| \`@sometic/react\` | React adapters |
| \`@sometic/vue\` | Vue adapters |
| \`@sometic/date-core\` | Date contracts |
| \`@sometic/date-native\` | Native date adapter |
| \`@sometic/date-dayjs\` | Day.js adapter |
| \`@sometic/date-fns\` | date-fns adapter |
| \`@sometic/eslint-config\` | ESLint shareable config |
`,
);

write(
    "releases/index.md",
    `# Releases

Packages are currently pre-release (\`0.0.x\`). See [Changelog](/releases/changelog).
`,
);

write(
    "releases/changelog.md",
    `# Changelog

## 0.0.x — Sometic identity

- Public scope \`@sometic\`
- Custom elements \`sometic-*\`
- Consumer documentation site branded Sometic

Historical package changelogs live in each package \`CHANGELOG.md\`.
`,
);

write(
    "public/robots.txt",
    `User-agent: *
Allow: /
Sitemap: https://sometic.aitistack.com/sitemap.xml
`,
);

console.log("auth/forms/frameworks/migration written");
