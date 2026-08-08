/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: "no-circular",
            severity: "error",
            comment: "Circular dependencies are forbidden by architecture.",
            from: {},
            to: { circular: true },
        },
        {
            name: "no-core-to-framework",
            severity: "error",
            comment: "Foundation packages must not import framework adapters.",
            from: {
                path: "^packages/(core|events|store|styling|accessibility|date-core|dom|validation)/",
            },
            to: {
                path: "^packages/(react|vue|angular|svelte|solid|preact|jquery|alpine|htmx|angularjs)/",
            },
        },
        {
            name: "no-foundation-to-theme",
            severity: "error",
            comment: "Foundation packages must not import theme.",
            from: {
                path: "^packages/(core|events|store|styling|accessibility|date-core|dom|validation)/",
            },
            to: { path: "^packages/theme/" },
        },
        {
            name: "no-dom-to-elements-or-frameworks",
            severity: "error",
            comment: "DOM engines must not import elements or framework adapters.",
            from: { path: "^packages/dom/" },
            to: { path: "^packages/(elements|react|vue|angular|svelte|solid|preact)/" },
        },
        {
            name: "no-forms-to-frameworks",
            severity: "error",
            comment: "Forms engine must not import framework adapters.",
            from: { path: "^packages/(forms|validation)/" },
            to: { path: "^packages/(elements|react|vue|angular|svelte|solid|preact)/" },
        },
        {
            name: "no-auth-to-providers-or-frameworks",
            severity: "error",
            comment: "Auth core must not import provider SDKs or framework adapters.",
            from: { path: "^packages/auth/" },
            to: {
                path: "^packages/(auth-local|auth-firebase|auth-supabase|auth-oidc|elements|react|vue|angular|svelte|solid|preact|http)/",
            },
        },
        {
            name: "no-auth-providers-to-frameworks",
            severity: "error",
            comment: "Auth provider adapters must not import framework packages.",
            from: { path: "^packages/auth-(local|firebase|supabase|oidc)/" },
            to: { path: "^packages/(elements|react|vue|angular|svelte|solid|preact)/" },
        },
        {
            name: "no-http-to-frameworks",
            severity: "error",
            comment: "HTTP engine must not import framework adapters.",
            from: { path: "^packages/http/" },
            to: { path: "^packages/(elements|react|vue|angular|svelte|solid|preact)/" },
        },
        {
            name: "no-styling-to-theme",
            severity: "error",
            comment: "Styling must not depend on theme.",
            from: { path: "^packages/styling/" },
            to: { path: "^packages/theme/" },
        },
        {
            name: "no-adapter-contract-to-frameworks",
            severity: "error",
            comment: "Shared adapter contract must stay framework-agnostic.",
            from: { path: "^packages/adapter-contract/" },
            to: {
                path: "^packages/(react|vue|angular|svelte|solid|preact|elements|jquery|alpine|htmx)/",
            },
        },
        {
            name: "no-packages-to-apps",
            severity: "error",
            from: { path: "^packages/" },
            to: { path: "^apps/" },
        },
    ],
    options: {
        doNotFollow: { path: "node_modules" },
        exclude: {
            path: "(^|/)(node_modules|dist|\\.vitepress/dist|\\.vitepress/cache)(/|$)",
        },
        tsPreCompilationDeps: true,
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            conditionNames: ["import", "require", "node", "default", "types"],
        },
    },
};
