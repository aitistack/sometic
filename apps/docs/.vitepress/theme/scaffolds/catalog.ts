export type ScaffoldFaq = {
    question: string;
    answer: string;
};

export type ScaffoldDocLink = {
    href: string;
    label: string;
};

export type ScaffoldEntry = {
    id: string;
    surface: string;
    title: string;
    description: string;
    features: string[];
    packages: string[];
    docs: ScaffoldDocLink[];
    explanations: string;
    styling: string;
    ssr: string;
    faq: ScaffoldFaq[];
};

export const scaffolds: ScaffoldEntry[] = [
    {
        id: "auth-e2e",
        surface: "scaffold-auth-e2e",
        title: "Auth app end-to-end",
        description:
            "Session-shaped product shell: sign-in, hydrate, refresh, protected routes, and dispose. Uses every System package that belongs in an authenticated app.",
        features: [
            "createAppShell with auth, http, query, head, theme, forms",
            "Provider-independent auth plus one optional adapter",
            "HTTP 401 refresh queue wired once, not per call site",
            "Sign-in / register forms with validation (auth.register, not signUp)",
            "Document head for auth and app chrome pages",
            "Delivery paths A/B/C (npm) or D1/D2 (CDN simple / modular)",
        ],
        packages: [
            "@sometic/app-shell",
            "@sometic/auth",
            "@sometic/auth-local (or auth-firebase / auth-supabase / auth-oidc)",
            "@sometic/http",
            "@sometic/query",
            "@sometic/forms",
            "@sometic/validation",
            "@sometic/theme",
            "@sometic/head",
            "@sometic/react | @sometic/vue | @sometic/elements + @sometic/dom | CDN (D1/D2)",
        ],
        docs: [
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
            { href: "https://sometic.dev/authentication/", label: "Authentication" },
            { href: "https://sometic.dev/utilities/http", label: "HTTP" },
            { href: "https://sometic.dev/utilities/query", label: "Query" },
            { href: "https://sometic.dev/forms/", label: "Forms" },
            { href: "https://sometic.dev/utilities/head", label: "Head / SEO" },
            { href: "https://sometic.dev/guide/ssr", label: "SSR" },
        ],
        explanations:
            "Auth owns session. HTTP owns transport and the refresh queue. Query owns server cache and must refetch after re-auth. App Shell shares one session epoch so privileged UI clears together. Forms never embed provider SDKs. Client can() helpers are UX-only; authorize on the server.",
        styling:
            "Packages ship unstyled. Style sign-in with your CSS or design tokens. Use @sometic/theme only for token/CSS variable plumbing, not as a forced look. Do not add Google Fonts CDN to publishable app packages; consumer fonts stay in the app shell.",
        ssr: "Create auth, http, query, and app-shell inside request or client bootstrap scopes. Never touch window, document, or storage at import time. Prefer cookie or explicit storage adapters that work on the server path you choose. Dispose the shell when the tree unmounts.",
        faq: [
            {
                question: "Which auth provider should the agent pick first?",
                answer: "Start with @sometic/auth-local against your REST API. Swap to auth-firebase, auth-supabase, or auth-oidc later without rewriting form UI. Keep provider SDKs out of field components.",
            },
            {
                question: "Do I really need App Shell for a login page?",
                answer: "For this scaffold yes. Once you have auth + http + query together, createAppShell (or createSometicApp) keeps session epoch and dispose honest so privileged UI clears as one graph.",
            },
            {
                question: "Where should 401 refresh live?",
                answer: "In @sometic/http via the auth interceptor and refresh queue. Do not sprinkle ad-hoc retries in every fetch call site.",
            },
            {
                question: "Is client can() enough for authorization?",
                answer: "No. Client helpers only hide UX. Every privileged API must authorize on the server.",
            },
            {
                question: "What happens on sign-out?",
                answer: "Clear the session through auth, then dispose or recreate the shell so query caches and bound stores tied to the epoch cannot leak the previous user.",
            },
            {
                question: "Can I use Elements for the whole auth app?",
                answer: "Option C (Elements + DOM) works for shipped controls (fields, sometic-auth-status). For complex route shells, pick A (React) or B (Vue) when the scaffold needs structure adapters that are not yet custom elements.",
            },
            {
                question: "How should storage work with SSR?",
                answer: "Pass an explicit storage strategy that is safe for your server path. Never read localStorage or cookies at import time.",
            },
        ],
    },
    {
        id: "saas-dashboard",
        surface: "scaffold-saas-dashboard",
        title: "B2B SaaS dashboard",
        description:
            "Signed-in product home: navigation chrome, server tables, notifications, command palette, and feature-flagged modules on one App Shell.",
        features: [
            "App Shell session + dispose graph",
            "Query-backed data tables and list pages",
            "Auth permissions for nav and actions",
            "Notification center + toast feedback",
            "Tabs, command palette, feature flags",
        ],
        packages: [
            "@sometic/app-shell",
            "@sometic/auth",
            "@sometic/http",
            "@sometic/query",
            "@sometic/data-table",
            "@sometic/notifications",
            "@sometic/feature-flags",
            "@sometic/react/structure or @sometic/vue/structure",
            "@sometic/react/data or @sometic/vue/data",
            "@sometic/theme",
            "@sometic/head",
        ],
        docs: [
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
            { href: "https://sometic.dev/guide/app-primitives", label: "App primitives" },
            { href: "https://sometic.dev/utilities/query", label: "Query" },
            { href: "https://sometic.dev/authentication/", label: "Authentication" },
            { href: "https://sometic.dev/components/", label: "Components" },
            { href: "https://sometic.dev/guide/whats-included", label: "What’s included" },
        ],
        explanations:
            "SaaS dashboards mix server lists (query + data-table) with client chrome (store). Feature flags gate modules without redeploying shells. Permissions hide actions in the UI only; the API still enforces access. Notifications are a first-class surface, not ad-hoc toast spam.",
        styling:
            "Build a dense product layout in your CSS. Structure components accept classes/slots. Do not expect a built-in dashboard theme from Sometic.",
        ssr: "Prefetch critical queries on the server when your framework allows. Hydrate App Shell on the client. Command palette and overlays mount only after document is available.",
        faq: [
            {
                question: "Store or query for the main table?",
                answer: "Query. Parking API lists in the client store fights cache invalidation and refresh-after-auth.",
            },
            {
                question: "Are Tabs and Command palette available as custom elements?",
                answer: "Not as dedicated CEs yet. Use React/Vue structure adapters or @sometic/dom controllers in Vanilla.",
            },
            {
                question: "How do I gate a whole module?",
                answer: "Evaluate createFeatureFlagController during bootstrap and skip routes or nav items when disabled. Still enforce entitlements on the server.",
            },
            {
                question: "Should the sidebar open state go in query?",
                answer: "No. That is UI chrome. Keep it in @sometic/store (ui/prefs). Keep server rows in query.",
            },
            {
                question: "How do notifications relate to toasts?",
                answer: "Use notifications for durable inbox-style events. Toasts are short confirmations after mutations. Do not spam toast for every background event.",
            },
            {
                question: "Can one dashboard host multiple products?",
                answer: "Yes under one App Shell. Share auth/http/query; split feature areas with tabs or routes and flag gates.",
            },
        ],
    },
    {
        id: "ai-workspace",
        surface: "scaffold-ai-workspace",
        title: "AI product workspace",
        description:
            "Chat-shaped product shell with drafts, offline queue, query history, and honest boundaries. Sometic owns app behavior; your model API stays yours.",
        features: [
            "Thread list + composer forms",
            "Draft persistence for unfinished prompts",
            "Offline queue for send-when-online",
            "Query cache for thread/message history",
            "Head titles per conversation",
        ],
        packages: [
            "@sometic/app-shell",
            "@sometic/forms",
            "@sometic/drafts",
            "@sometic/offline-queue",
            "@sometic/query",
            "@sometic/http",
            "@sometic/auth",
            "@sometic/head",
            "@sometic/store",
            "@sometic/react or @sometic/vue",
        ],
        docs: [
            { href: "https://sometic.dev/guide/app-primitives", label: "App primitives" },
            { href: "https://sometic.dev/forms/", label: "Forms" },
            { href: "https://sometic.dev/utilities/query", label: "Query" },
            { href: "https://sometic.dev/utilities/http", label: "HTTP" },
            { href: "https://sometic.dev/utilities/head", label: "Head / SEO" },
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
        ],
        explanations:
            "Sometic does not ship an AI SDK. Treat the model endpoint as any authenticated HTTP API. Drafts protect composer state. Offline queue retries transport, not model semantics. Query holds thread history; store holds UI chrome (sidebar width, selected model label).",
        styling:
            "Chat layouts are entirely consumer CSS. Keep message bubbles, streaming cursors, and markdown rendering in the app. Use Sometic controls for composer inputs and overlays only.",
        ssr: "Thread pages can SSR head titles and empty shells. Message lists usually hydrate client-side with query. Never read localStorage drafts at import time.",
        faq: [
            {
                question: "Does Sometic stream model tokens?",
                answer: "No. Implement streaming with fetch/ReadableStream in your app. Use @sometic/http for auth headers and abort on dispose.",
            },
            {
                question: "Is there an @sometic/ai package?",
                answer: "No. Do not invent one. Call your model provider or backend proxy through HTTP.",
            },
            {
                question: "Where do unfinished composer prompts go?",
                answer: "@sometic/drafts, with secrets omitted. Never persist API keys in drafts.",
            },
            {
                question: "What does the offline queue retry?",
                answer: "Transport failures for send mutations you enqueue. It does not reinterpret model output or tool calls.",
            },
            {
                question: "Thread list in store or query?",
                answer: "Query, keyed by user/workspace. Store only holds chrome like collapsed sidebar or selected model label.",
            },
            {
                question: "Should the browser hold provider API keys?",
                answer: "Prefer a backend proxy. If the browser must call a provider, never park secrets in drafts or the client store.",
            },
            {
                question: "How do I cancel an in-flight generation?",
                answer: "Abort the HTTP request tied to the turn. On shell dispose, in-flight requests should abort with the client.",
            },
            {
                question: "Markdown / code highlighting?",
                answer: "Bring your own renderer. Sometic does not ship a markdown package.",
            },
        ],
    },
    {
        id: "multi-tenant-admin",
        surface: "scaffold-multi-tenant-admin",
        title: "Multi-tenant admin console",
        description:
            "Org switcher, capability matrix, approvals, and audit activity for operators managing many tenants.",
        features: [
            "Tenant-scoped auth capabilities",
            "Permission matrix UI",
            "Approval queues",
            "Activity / audit feeds",
            "Tenant data tables",
        ],
        packages: [
            "@sometic/app-shell",
            "@sometic/auth",
            "@sometic/http",
            "@sometic/query",
            "@sometic/data-table",
            "@sometic/approval",
            "@sometic/activity",
            "@sometic/react/data (PermissionMatrix)",
            "@sometic/notifications",
        ],
        docs: [
            { href: "https://sometic.dev/authentication/", label: "Authentication" },
            { href: "https://sometic.dev/guide/app-primitives", label: "App primitives" },
            { href: "https://sometic.dev/utilities/query", label: "Query" },
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
        ],
        explanations:
            "Tenant id belongs in query keys and HTTP headers from your backend contract. Permissions and matrices are UX gates. Approvals and activity engines model workflows; they are not a hosted multi-tenant SaaS. Always re-check on the server when switching orgs.",
        styling:
            "Admin density: tight tables, clear danger actions. Use Alert/Dialog for irreversible tenant changes. Style severity with your tokens.",
        ssr: "Tenant context often comes from URL or cookie. Resolve it before creating query clients. Avoid flashing the wrong tenant’s data during hydrate.",
        faq: [
            {
                question: "Is there a @sometic/tenant package?",
                answer: "No. Model tenancy with auth capabilities, query key scoping, and your API. Do not invent a tenant package.",
            },
            {
                question: "Where does tenant id belong?",
                answer: "In the URL or cookie you choose, then in query keys and HTTP headers. Never trust tenant id from the client alone.",
            },
            {
                question: "What clears when I switch orgs?",
                answer: "Invalidate or remount tenant-scoped query keys. Re-run permission checks. Do not reuse the previous tenant’s cached rows.",
            },
            {
                question: "Is the permission matrix authoritative?",
                answer: "No. It is UX. The API must reject unauthorized actions even if the matrix looks open.",
            },
            {
                question: "Can approvals span tenants?",
                answer: "Only if your API allows it. Keep approval payloads tenant-scoped and re-authorize after every org switch.",
            },
        ],
    },
    {
        id: "analytics-desk",
        surface: "scaffold-analytics-desk",
        title: "Analytics / reporting desk",
        description:
            "Filterable reports, uploads of CSV exports, and query-builder driven tables. Charts stay outside Sometic by design.",
        features: [
            "Query builder filters",
            "Data table result sets",
            "Upload for export/import jobs",
            "Theme-aware contrast for dense UI",
            "Honest chart boundary (your chart lib)",
        ],
        packages: [
            "@sometic/query",
            "@sometic/query-builder",
            "@sometic/data-table",
            "@sometic/upload",
            "@sometic/http",
            "@sometic/theme",
            "@sometic/app-shell",
            "@sometic/auth",
            "@sometic/react/data or @sometic/vue/data",
        ],
        docs: [
            { href: "https://sometic.dev/utilities/query", label: "Query" },
            { href: "https://sometic.dev/theming/", label: "Theming" },
            { href: "https://sometic.dev/guide/whats-included", label: "What’s included" },
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
        ],
        explanations:
            "Query builder shapes filters; query caches responses; data-table presents rows. Upload owns transport boundaries for files. Visualization is explicitly out of scope for Sometic so the agent must pick a real chart library.",
        styling:
            "Dense report UI. Prefer high-contrast tokens from theme helpers. Keep chart colors in the chart library config, not in @sometic packages.",
        ssr: "Filter state can live in the URL. Prefetch the default report query when possible. Uploads are client-only.",
        faq: [
            {
                question: "Does Sometic include charts?",
                answer: "No. Pair data-table/query with visx, Chart.js, ECharts, or another library and document that boundary.",
            },
            {
                question: "Upload vs file input?",
                answer: "File/field inputs collect files. @sometic/upload owns transport, progress, and abort. Use both layers.",
            },
            {
                question: "Where should filter state live?",
                answer: "Prefer the URL for shareable reports. Cache result sets in query keyed by the serialized filter.",
            },
            {
                question: "Who serializes the query-builder AST?",
                answer: "Your app. Map the builder output to your API’s filter contract; Sometic does not invent your backend query language.",
            },
            {
                question: "Huge exports?",
                answer: "Stream or job-based download through your API. Use upload/download progress UI; do not block the main thread on multi-hundred-MB CSV parses in the browser.",
            },
            {
                question: "SSR for charts?",
                answer: "Only if your chart library supports it. When unsure, hydrate charts on the client after the table query resolves.",
            },
            {
                question: "Can agents claim a Sometic chart package?",
                answer: "No. That is a hard honesty rule for this scaffold.",
            },
        ],
    },
    {
        id: "ops-ticket-desk",
        surface: "scaffold-ops-ticket-desk",
        title: "Ops / support ticket desk",
        description:
            "Queue of support tickets with forms, status updates, notifications, and activity. Not a public Invoice Desk demo.",
        features: [
            "Ticket create / update forms",
            "Query-backed queues and detail panes",
            "Toast + dialog confirmations",
            "Notification center for assignments",
            "Activity timeline on each ticket",
        ],
        packages: [
            "@sometic/forms",
            "@sometic/query",
            "@sometic/http",
            "@sometic/auth",
            "@sometic/app-shell",
            "@sometic/notifications",
            "@sometic/activity",
            "@sometic/react/overlay or @sometic/vue/overlay",
            "@sometic/react/field",
        ],
        docs: [
            { href: "https://sometic.dev/forms/", label: "Forms" },
            { href: "https://sometic.dev/utilities/query", label: "Query" },
            { href: "https://sometic.dev/guide/app-primitives", label: "App primitives" },
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
        ],
        explanations:
            "Ticket desks are form + query products. Keep status machines on the server. Activity records audit; notifications push assignment events. This scaffold replaces missing public examples without advertising parked Invoice Desk apps.",
        styling:
            "Ops UI: clear priority colors in your CSS, not hardcoded in packages. Use Alert for SLA breaches.",
        ssr: "Queue pages can SSR empty shells. Detail views hydrate with query. Dialogs and toasts are client-only.",
        faq: [
            {
                question: "Is this Invoice Desk?",
                answer: "No. Build a support ticket product. Do not clone or link parked example-invoice apps.",
            },
            {
                question: "How do I get realtime updates?",
                answer: "Bring websocket or SSE yourself and invalidate query keys. Sometic does not ship a realtime transport.",
            },
            {
                question: "Who owns ticket status transitions?",
                answer: "Your API. Forms propose changes; activity records the accepted audit trail.",
            },
            {
                question: "Assignment notifications vs toasts?",
                answer: "Notifications for durable assignment events. Toasts for immediate confirmations after the operator acts.",
            },
            {
                question: "Should billing be in this prompt?",
                answer: "Not unless you intentionally merge another scaffold. Keep this brief on queues, detail, notifications, and activity.",
            },
            {
                question: "SLA timers?",
                answer: "Compute on the server or in your app clock. Sometic has no SLA package; use Alert styling for breaches in consumer CSS.",
            },
        ],
    },
    {
        id: "marketplace",
        surface: "scaffold-marketplace",
        title: "Marketplace listings",
        description:
            "Listing create flow, media upload, searchable catalog, and SEO-ready listing pages.",
        features: [
            "Listing forms with validation",
            "Image upload pipeline",
            "Query catalog + filters",
            "Select / combobox for categories",
            "Head SEO per listing",
        ],
        packages: [
            "@sometic/forms",
            "@sometic/validation",
            "@sometic/upload",
            "@sometic/query",
            "@sometic/http",
            "@sometic/head",
            "@sometic/head/seo",
            "@sometic/react/selection (Select, Combobox)",
            "@sometic/app-shell",
            "@sometic/auth",
        ],
        docs: [
            { href: "https://sometic.dev/forms/", label: "Forms" },
            { href: "https://sometic.dev/utilities/head", label: "Head / SEO" },
            { href: "https://sometic.dev/utilities/query", label: "Query" },
            { href: "https://sometic.dev/guide/whats-included", label: "What’s included" },
        ],
        explanations:
            "Marketplace honesty: payments and search rankings stay outside Sometic. Head owns document metadata for public listing URLs. Upload owns file transport. Combobox is adapter-backed, not a CE.",
        styling:
            "Card grids and hero images are consumer layout. Keep listing cards semantic (article/link). Do not fake browser chrome around previews.",
        ssr: "Public listing pages should SSR head tags and primary content when possible. Uploads and seller dashboards are client-heavy.",
        faq: [
            {
                question: "Where do payments go?",
                answer: "Stripe or similar, integrated by you. There is no @sometic/payments package.",
            },
            {
                question: "Combobox as a custom element?",
                answer: "Not shipped. Use React/Vue selection adapters or DOM controllers.",
            },
            {
                question: "How do listing pages get SEO tags?",
                answer: "Set title/description (and OG fields if you use them) through @sometic/head and head/seo on the listing route.",
            },
            {
                question: "Seller vs buyer access?",
                answer: "Protect create/edit with auth. Keep public catalog and listing detail unauthenticated when your product requires it.",
            },
            {
                question: "Search ranking?",
                answer: "Your search backend. Query caches pages of results; it does not rank marketplace inventory.",
            },
            {
                question: "Image CDN?",
                answer: "Upload through @sometic/upload to your storage; serve via your CDN. Sometic does not host media.",
            },
            {
                question: "Favorites / carts?",
                answer: "Model them in your API and query keys. Not part of this scaffold’s required surface.",
            },
        ],
    },
    {
        id: "api-portal",
        surface: "scaffold-api-portal",
        title: "Developer API portal",
        description:
            "Docs-like portal for API keys, OIDC login, HTTP demos, and structured navigation.",
        features: [
            "OIDC-capable auth path",
            "HTTP client demos with interceptors",
            "Head for docs routes",
            "Tabs / accordion / tree for API reference chrome",
            "Copy-friendly key forms",
        ],
        packages: [
            "@sometic/auth",
            "@sometic/auth-oidc",
            "@sometic/http",
            "@sometic/head",
            "@sometic/forms",
            "@sometic/app-shell",
            "@sometic/react/structure",
            "@sometic/query",
        ],
        docs: [
            { href: "https://sometic.dev/authentication/", label: "Authentication" },
            { href: "https://sometic.dev/utilities/http", label: "HTTP" },
            { href: "https://sometic.dev/utilities/head", label: "Head / SEO" },
            { href: "https://sometic.dev/guide/agents", label: "Agents" },
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
        ],
        explanations:
            "Portals teach HTTP and auth boundaries. Keep try-it panels behind auth. Tree/Tabs are React/Vue structure (no CEs). Point readers at sometic.dev agents and llms.txt rather than inventing a second docs system.",
        styling:
            "Editorial docs density with mono for payloads (JetBrains only if you choose it in the portal app; packages stay font-agnostic).",
        ssr: "Docs pages SSR well. Interactive try-it panels hydrate client-side. OIDC redirects are browser flows.",
        faq: [
            {
                question: "Does this replace sometic.dev?",
                answer: "No. Scaffold a customer-facing API portal for your product. Sometic’s own docs stay on sometic.dev.",
            },
            {
                question: "Is OIDC required?",
                answer: "Optional. Local or other adapters work; OIDC fits SSO developer portals.",
            },
            {
                question: "How should try-it panels call APIs?",
                answer: "Through @sometic/http with the same interceptors as production. Never hardcode live secrets into static pages.",
            },
            {
                question: "Where do API keys display?",
                answer: "Show secrets once after create, then store hashes server-side. Use forms with draft omit so secrets are not persisted in drafts.",
            },
            {
                question: "Should agents also read llms.txt?",
                answer: "Yes when teaching Sometic package boundaries. Pair with the Agents guide.",
            },
        ],
    },
    {
        id: "knowledge-cms",
        surface: "scaffold-knowledge-cms",
        title: "Knowledge base / CMS lite",
        description:
            "Editable articles with drafts, undo/redo history, conflict handling, and SEO head tags.",
        features: [
            "Article forms + validation",
            "Draft autosave",
            "History / undo stack",
            "Conflict detection on concurrent edits",
            "Head metadata per article",
        ],
        packages: [
            "@sometic/forms",
            "@sometic/drafts",
            "@sometic/history",
            "@sometic/conflict",
            "@sometic/query",
            "@sometic/http",
            "@sometic/head",
            "@sometic/app-shell",
            "@sometic/auth",
        ],
        docs: [
            { href: "https://sometic.dev/guide/app-primitives", label: "App primitives" },
            { href: "https://sometic.dev/forms/", label: "Forms" },
            { href: "https://sometic.dev/utilities/head", label: "Head / SEO" },
            { href: "https://sometic.dev/guide/ssr", label: "SSR" },
        ],
        explanations:
            "CMS lite means structured articles, not a full Notion clone. History and conflict engines protect editors. Rich text rendering is your component; Sometic owns form state and collaboration edges.",
        styling:
            "Editor chrome is yours. Keep focus rings visible. Prefer native inputs where possible for a11y.",
        ssr: "Published articles SSR. Editor routes client-hydrate with drafts. Conflict UI is client-only.",
        faq: [
            {
                question: "Is there a rich-text package?",
                answer: "No. Bring TipTap, Lexical, ProseMirror, or a textarea. Bind content through forms.",
            },
            {
                question: "Do drafts/history/conflict ship as CEs?",
                answer: "No. Call the engines from React, Vue, or Vanilla.",
            },
            {
                question: "How often should autosave run?",
                answer: "Debounce in the app. Drafts persist editor state; do not flood the API on every keystroke.",
            },
            {
                question: "Who wins on concurrent edits?",
                answer: "Your policy via @sometic/conflict. Prompt reload or merge; never silently overwrite without an audit trail.",
            },
            {
                question: "Version history UI?",
                answer: "@sometic/history supports undo/redo command stacks. Long-term revision lists still live in your API if you need them.",
            },
            {
                question: "Published vs draft SEO?",
                answer: "Only published routes should advertise canonical head tags. Keep draft editors noindex if they are public URLs.",
            },
            {
                question: "Media embeds?",
                answer: "Your editor + upload pipeline. Not required by this scaffold unless you extend it.",
            },
            {
                question: "Multi-author locking?",
                answer: "Optional presence is yours. Conflict handles save races; it is not a full CRDT collab suite.",
            },
        ],
    },
    {
        id: "onboarding-rollout",
        surface: "scaffold-onboarding-rollout",
        title: "Onboarding + gated rollout",
        description:
            "First-run checklist, command-driven actions, and feature-flag gates for gradual module rollout.",
        features: [
            "Onboarding form wizard",
            "Feature flag gates per step",
            "Command palette actions",
            "App Shell bootstrap",
            "Prefs store for checklist progress",
        ],
        packages: [
            "@sometic/feature-flags",
            "@sometic/commands",
            "@sometic/forms",
            "@sometic/app-shell",
            "@sometic/store",
            "@sometic/auth",
            "@sometic/react/structure (Command palette)",
            "@sometic/head",
        ],
        docs: [
            { href: "https://sometic.dev/guide/app-primitives", label: "App primitives" },
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
            { href: "https://sometic.dev/forms/", label: "Forms" },
            { href: "https://sometic.dev/stores/", label: "Stores" },
        ],
        explanations:
            "Flags decide what exists. Commands expose intentional actions (including palette). Onboarding progress is client prefs. Do not store server entitlements only in the client store; confirm with auth/query.",
        styling:
            "Friendly empty states in consumer CSS. Keep CTAs square if matching docs brand, or follow your product system.",
        ssr: "Flag evaluation may need bootstrap payload from the server. Avoid flashing gated modules before flags resolve.",
        faq: [
            {
                question: "Is feature-flags a hosted LaunchDarkly?",
                answer: "No. createFeatureFlagController evaluates rules you supply. Bring LaunchDarkly or your API for remote config if needed.",
            },
            {
                question: "Is there a Stepper component?",
                answer: "Not yet. Compose forms with your layout, or use tabs for steps.",
            },
            {
                question: "Flags vs paid entitlements?",
                answer: "Flags gate UX. Billing entitlements still come from your backend and auth capabilities.",
            },
            {
                question: "Where does checklist progress live?",
                answer: "Prefs in @sometic/store. Do not put it in query unless the server owns completion state.",
            },
            {
                question: "How do commands show in the UI?",
                answer: "Register with createCommandRegistry and expose them through the command palette structure adapter.",
            },
            {
                question: "Flash of gated content on load?",
                answer: "Resolve bootstrap flags before rendering gated routes, or show a neutral shell until evaluation finishes.",
            },
        ],
    },
    {
        id: "offline-field",
        surface: "scaffold-offline-field",
        title: "Offline-first field app",
        description:
            "Capture forms in the field, queue mutations while offline, resolve conflicts when back online.",
        features: [
            "Persistent store for field drafts",
            "Offline mutation queue",
            "Conflict resolution on sync",
            "Forms with validation",
            "Auth session hydrate when online",
        ],
        packages: [
            "@sometic/offline-queue",
            "@sometic/drafts",
            "@sometic/conflict",
            "@sometic/forms",
            "@sometic/store",
            "@sometic/http",
            "@sometic/auth",
            "@sometic/query",
            "@sometic/app-shell",
        ],
        docs: [
            { href: "https://sometic.dev/guide/app-primitives", label: "App primitives" },
            { href: "https://sometic.dev/stores/", label: "Stores" },
            { href: "https://sometic.dev/forms/", label: "Forms" },
            { href: "https://sometic.dev/guide/ssr", label: "SSR" },
            { href: "https://sometic.dev/guide/app-shell", label: "App Shell" },
        ],
        explanations:
            "Offline-first is an orchestration problem. Queue owns retry. Conflict owns merge policy. Store persistence is for client state; server truth returns through query after sync. Do not pretend every API is offline-safe.",
        styling:
            "Large touch targets for field devices. High contrast. Prefer native inputs for mobile keyboards.",
        ssr: "Field apps are mostly client/PWA. If you SSR a shell, do not assume navigator.onLine at import time.",
        faq: [
            {
                question: "Does Sometic include a service worker?",
                answer: "No. Add Workbox or platform PWA tooling yourself. Sometic owns queue, draft, and conflict behavior.",
            },
            {
                question: "What survives a reload?",
                answer: "Whatever you persist on purpose (drafts, queue storage). Rehydrate auth when online before flushing privileged mutations.",
            },
            {
                question: "Can every endpoint work offline?",
                answer: "No. Only enqueue mutations your API can accept idempotently later. Reference data may need a local cache you own.",
            },
            {
                question: "When do I detect offline?",
                answer: "In app runtime (online/offline events). Never read navigator at import time.",
            },
            {
                question: "Order of reconnect?",
                answer: "Hydrate auth if needed, flush the offline queue, run conflict strategies, then invalidate query so UI shows server truth.",
            },
            {
                question: "Photo capture in the field?",
                answer: "Use native file/camera inputs plus upload when online. Queue metadata mutations carefully if binaries cannot upload yet.",
            },
            {
                question: "GPS / maps?",
                answer: "Outside Sometic. Keep coordinates in your form model and API.",
            },
            {
                question: "Dispose while queued?",
                answer: "Follow engine dispose contracts for listeners and in-flight HTTP. Document whether your queue storage outlives the page.",
            },
            {
                question: "Conflict UI on a phone?",
                answer: "Keep it simple: show server vs local fields and let the operator choose. Avoid dense merge UIs on small screens.",
            },
        ],
    },
    {
        id: "compliance-approval",
        surface: "scaffold-compliance-approval",
        title: "Compliance / approval workflow",
        description:
            "Policy reviews with approval steps, activity audit, notifications, and permission-gated actions.",
        features: [
            "Approval step engine",
            "Activity audit trail",
            "Notification fan-out",
            "Permission matrix for reviewers",
            "Dialog / drawer review panels",
        ],
        packages: [
            "@sometic/approval",
            "@sometic/activity",
            "@sometic/notifications",
            "@sometic/auth",
            "@sometic/query",
            "@sometic/http",
            "@sometic/app-shell",
            "@sometic/react/overlay (Dialog, Drawer)",
            "@sometic/react/data (PermissionMatrix)",
        ],
        docs: [
            { href: "https://sometic.dev/guide/app-primitives", label: "App primitives" },
            { href: "https://sometic.dev/authentication/", label: "Authentication" },
            { href: "https://sometic.dev/components/", label: "Components" },
            { href: "https://sometic.dev/guide/agents", label: "Agents" },
        ],
        explanations:
            "Compliance UIs need durable audit (activity), explicit decisions (approval), and gated buttons (permissions). Notifications inform; they do not authorize. Keep legal policy text in your CMS; Sometic orchestrates the workflow chrome.",
        styling:
            "Conservative, high-contrast. Make approve/reject unmistakable. Prefer clear language over playful motion.",
        ssr: "Case detail can SSR summary. Approval actions are client mutations with server enforcement.",
        faq: [
            {
                question: "Is approval a legal system of record?",
                answer: "No. It models steps and UI state. Your backend remains authoritative for compliance outcomes.",
            },
            {
                question: "Is Drawer available as a custom element?",
                answer: "Not shipped. Use React/Vue Drawer or @sometic/dom controllers.",
            },
            {
                question: "Do notifications authorize reviewers?",
                answer: "No. They inform. Approve/reject still requires server authorization and permission checks.",
            },
            {
                question: "Where does the audit trail live?",
                answer: "Activity events in the product, persisted by your API. Do not treat toast history as audit.",
            },
            {
                question: "Four-eyes / dual control?",
                answer: "Encode that in your approval steps and server rules. The engine will not invent regulatory policy for you.",
            },
            {
                question: "Export for auditors?",
                answer: "Build an export from your activity store/API. Sometic does not ship a compliance export format.",
            },
            {
                question: "Can agents use this prompt as-is?",
                answer: "Yes. Paste into Cursor/Claude/Copilot, then open the linked docs for package APIs.",
            },
        ],
    },
];

export function getScaffold(id: string): ScaffoldEntry | undefined {
    return scaffolds.find((entry) => entry.id === id);
}
