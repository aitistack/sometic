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

function componentPage(c) {
    return `# ${c.title}

${c.summary}

${install(c.pkg)}

## Import

\`\`\`ts
${c.importLine}
\`\`\`

## Quick start

### React

\`\`\`tsx
${c.importLine}

export function Example() {
    return <${c.reactTag ?? c.title.replace(/ /g, "")} />;
}
\`\`\`

### Vanilla

\`\`\`html
<${c.tag}></${c.tag}>
\`\`\`

Register via \`@sometic/elements\` define helpers before use.

## When to use

${c.when}

## When not to use

${c.whenNot}

## Framework examples

React, Vue and vanilla custom elements are supported for this control. Prefer subpath imports.

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| disabled | boolean | false | no | Disables interaction |
| className / class | string | — | no | Host class |

Exact prop types ship in package declaration files.

## Slots

Map styling slots with \`classes\` / \`styles\` from the styling contract.

## Events

Native events bubble; adapters forward framework handlers (\`onClick\`, \`onChange\`).

## Methods

Controllers expose focus and value helpers where applicable. Dispose on unmount.

## Controlled usage

Pass value + change handler from app state.

## Uncontrolled usage

Omit value; read on submit through forms APIs.

## Styling

Unstyled by default. Use classes, CSS variables from \`@sometic/theme\`, and state attributes.

## Accessibility

Keep native semantics. Provide accessible names for icon-only controls.

## Form integration

Compatible with \`@sometic/forms\` and native form submit.

## SSR

No browser globals at import time. Register custom elements only in the browser.

## Troubleshooting

Use \`sometic-*\` tags (not \`aiti-*\`). Call element registrars before first use.

## Related APIs

- [Forms](/forms/)
- [Styling slots](/concepts/styling-slots)
`;
}

write(
    "components/index.md",
    `# Components

- [Button](/components/button)
- [Icon button](/components/icon-button)
- [Button group](/components/button-group)
- [Toggle button](/components/toggle-button)
- [Input](/components/input)
- [Field](/components/field)
- [Password input](/components/password-input)
- [OTP input](/components/otp-input)
`,
);

const components = [
    {
        file: "button.md",
        title: "Button",
        reactTag: "Button",
        summary: "Accessible button primitive with controller bindings.",
        pkg: "@sometic/react @sometic/elements",
        importLine: 'import { Button } from "@sometic/react/button";',
        tag: "sometic-button",
        when: "Primary actions and submits.",
        whenNot: "Navigation that should be a link.",
    },
    {
        file: "icon-button.md",
        title: "Icon button",
        reactTag: "IconButton",
        summary: "Icon-only button requiring an accessible name.",
        pkg: "@sometic/react @sometic/elements",
        importLine: 'import { IconButton } from "@sometic/react/button";',
        tag: "sometic-icon-button",
        when: "Compact toolbars.",
        whenNot: "Text-labeled actions — use Button.",
    },
    {
        file: "button-group.md",
        title: "Button group",
        reactTag: "ButtonGroup",
        summary: "Groups related buttons.",
        pkg: "@sometic/react @sometic/elements",
        importLine: 'import { ButtonGroup } from "@sometic/react/button";',
        tag: "sometic-button-group",
        when: "Segmented related actions.",
        whenNot: "Unrelated scattered actions.",
    },
    {
        file: "toggle-button.md",
        title: "Toggle button",
        reactTag: "ToggleButton",
        summary: "Pressed/unpressed toggle button.",
        pkg: "@sometic/react @sometic/elements",
        importLine: 'import { ToggleButton } from "@sometic/react/button";',
        tag: "sometic-toggle-button",
        when: "Binary mode presented as a button.",
        whenNot: "Prefer checkbox patterns for form booleans when available.",
    },
    {
        file: "input.md",
        title: "Input",
        reactTag: "Input",
        summary: "Text input with field integration hooks.",
        pkg: "@sometic/react @sometic/elements",
        importLine: 'import { Input } from "@sometic/react/input";',
        tag: "sometic-input",
        when: "Single-line text entry.",
        whenNot: "Multi-line text — use textarea until shipped.",
    },
    {
        file: "field.md",
        title: "Field",
        reactTag: "Field",
        summary: "Label, description and error composition.",
        pkg: "@sometic/react @sometic/elements",
        importLine: 'import { Field } from "@sometic/react/input";',
        tag: "sometic-field",
        when: "Consistent field chrome.",
        whenNot: "Bare controls without label/error structure.",
    },
    {
        file: "password-input.md",
        title: "Password input",
        reactTag: "PasswordInput",
        summary: "Password field patterns.",
        pkg: "@sometic/react @sometic/elements",
        importLine: 'import { PasswordInput } from "@sometic/react/input";',
        tag: "sometic-password-input",
        when: "Credentials entry.",
        whenNot: "OTP codes — use OTP input.",
    },
    {
        file: "otp-input.md",
        title: "OTP input",
        reactTag: "OtpInput",
        summary: "One-time passcode input.",
        pkg: "@sometic/react @sometic/elements",
        importLine: 'import { OtpInput } from "@sometic/react/input";',
        tag: "sometic-otp-input",
        when: "MFA / email codes.",
        whenNot: "Long free-text secrets.",
    },
];

for (const c of components) {
    write(`components/${c.file}`, componentPage(c));
}

function prim(title, pkg, purpose, detail) {
    return `# ${title}

${purpose}

${install(pkg)}

## Import

\`\`\`ts
import {} from "${pkg}";
\`\`\`

Use named exports from the package entry and documented subpaths.

## Details

${detail}

## SSR

No browser globals during module initialization.

## Related

[API packages](/api/packages)
`;
}

write(
    "primitives/index.md",
    `# Primitives

- [Core](/primitives/core)
- [Events](/primitives/events)
- [DOM](/primitives/dom)
- [Accessibility](/primitives/accessibility)
- [Styling](/primitives/styling)
- [Validation](/primitives/validation)
- [Date adapters](/primitives/date)
`,
);

write(
    "primitives/core.md",
    prim(
        "Core",
        "@sometic/core",
        "Lifecycle, environment and shared primitive contracts.",
        "Subpaths include environment, id, disposable, error, result, contracts, controllable-state, async-operation, utils.",
    ),
);
write(
    "primitives/events.md",
    prim(
        "Events",
        "@sometic/events",
        "Typed event emitters.",
        "Create emitters and subscribe without framework coupling.",
    ),
);
write(
    "primitives/dom.md",
    prim(
        "DOM",
        "@sometic/dom",
        "Portal, scroll lock and observers.",
        "Use inside browser lifecycles.",
    ),
);
write(
    "primitives/accessibility.md",
    prim(
        "Accessibility",
        "@sometic/accessibility",
        "Focus, keyboard, dismissable and announcer helpers.",
        "Compose into overlays and complex widgets.",
    ),
);
write(
    "primitives/styling.md",
    prim(
        "Styling",
        "@sometic/styling",
        "Class/style/slot resolvers.",
        "Keep components unstyled and themeable.",
    ),
);
write(
    "primitives/validation.md",
    prim(
        "Validation",
        "@sometic/validation",
        "Native validators and schema-adapter contracts.",
        "Compose with forms; optional schema libraries stay outside core.",
    ),
);
write(
    "primitives/date.md",
    `# Date adapters

${install("@sometic/date-core @sometic/date-native")}

Optional peers: \`@sometic/date-dayjs\`, \`@sometic/date-fns\`.
`,
);

write("utilities/index.md", `# Utilities\n\n- [HTTP client](/utilities/http)\n`);
write(
    "utilities/http.md",
    `# HTTP client

Fetch-first client with interceptors, retry, dedupe and optional auth refresh.

${install("@sometic/http")}

## Import

\`\`\`ts
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";
\`\`\`

## Signature

\`\`\`ts
createHttp(options?: HttpClientOptions): HttpClient
\`\`\`

## Related

[Auth interceptors](/authentication/interceptors)
`,
);

write("services/index.md", `# Services\n\n- [Auth](/services/auth)\n- [HTTP](/services/http)\n`);
write(
    "services/auth.md",
    `# Auth controller

${install("@sometic/auth")}

\`\`\`ts
import { createAuth } from "@sometic/auth";
\`\`\`

Client \`can()\` is UX-only. Backends enforce access.
`,
);
write("services/http.md", `# HTTP service\n\nSee [HTTP utility](/utilities/http).\n`);

write(
    "stores/index.md",
    `# Stores\n\n- [Store](/stores/store)\n- [Immer](/stores/store-immer)\n- [Theme](/stores/theme)\n`,
);
write(
    "stores/store.md",
    `# Store

${install("@sometic/store")}

\`\`\`ts
import { createStore } from "@sometic/store";
const store = createStore({ count: 0 });
\`\`\`
`,
);
write(
    "stores/store-immer.md",
    `# Immer adapter

${install("@sometic/store-immer")}
`,
);
write("stores/theme.md", `# Theme store\n\nSee [Theming](/theming/).\n`);

console.log("ok");
