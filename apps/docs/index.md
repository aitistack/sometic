---
layout: home
title: Home
description: >-
    Sometic is an open-source TypeScript library (npm @sometic): portable
    application behavior for UI, forms, auth, HTTP, query, stores, theming, and
    app-shell with thin React, Vue, and Web Components adapters. Unstyled
    engines. Your design system.
hero:
    text: One behavior model for UI, forms, auth, HTTP, query, stores, and theme on every JavaScript stack.
    tagline: Shared engines. Thin React, Vue, and Web Components adapters. Your design system stays yours.
---

<section class="sometic-home-band sometic-home-band--legend">

<h2>How the system holds</h2>

<p>Not another component kit. A portable application behavior system. Install the spine above, then read the contract below.</p>

<dl class="sometic-home-legend">
<div>
<dt><HomeGlyph name="layers" /> One engine, three surfaces</dt>
<dd>Write behavior once in a framework-agnostic controller. Bind it through React, Vue, or <code>sometic-*</code> elements without forking state, focus, or keyboard rules. <a href="/concepts/architecture">Read the architecture</a>.</dd>
</div>
<div>
<dt><HomeGlyph name="spine" /> App spine</dt>
<dd>When a request gets 401, Sometic coordinates refresh and retries. Session epoch clears query and bound stores together. Start with <a href="/guide/app-shell">App shell</a> and <code>createSometicApp</code>.</dd>
</div>
<div>
<dt><HomeGlyph name="skin" /> Same engine, your skin</dt>
<dd>Zero forced theme. Slots, data-state attributes, and tokens plug into Tailwind, Bootstrap, CSS Modules, or plain CSS. <a href="/guide/styling">Styling contract</a>.</dd>
</div>
<div>
<dt><HomeGlyph name="a11y" /> Accessible by construction</dt>
<dd>Focus traps, dismiss layers, portals, and scroll locks live in the core and compose into overlays. They are not patched on after ship.</dd>
</div>
</dl>

</section>

<section class="sometic-home-band sometic-home-band--spec">

<h2>Built for production constraints</h2>

<p>Most UI kits assume your design system or force heavy third-party SDKs into your runtime. Sometic stays out of your way.</p>

<dl class="sometic-home-spec">
<div>
<dt><HomeGlyph name="bind" /> Framework-agnostic controllers</dt>
<dd>State, focus, and interaction logic are decoupled from framework lifecycles. Swap the view layer without rewriting core behavior.</dd>
</div>
<div>
<dt><HomeGlyph name="skin" /> Zero CSS contamination</dt>
<dd>No stylesheets, no default themes, no runtime CSS injection. You own design tokens and DOM structure.</dd>
</div>
<div>
<dt><HomeGlyph name="http" /> Zero-dependency HTTP core</dt>
<dd>Built on native fetch with an interceptor pipeline and token refresh queue. No mandatory Axios or networking SDK in core.</dd>
</div>
<div>
<dt><HomeGlyph name="ssr" /> SSR-safe from day one</dt>
<dd>Core controllers guard environment globals at import time, so Next.js, Nuxt, and Remix avoid hydration mismatches and window errors.</dd>
</div>
<div>
<dt><HomeGlyph name="tree" /> Tree-shakable subpath exports</dt>
<dd>Import only what you use. Feature-isolated packages keep production JavaScript lean.</dd>
</div>
<div>
<dt><HomeGlyph name="slots" /> Declarative slot architecture</dt>
<dd>Layouts rely on native DOM slots and state attributes for control over rendered nodes and the accessibility tree.</dd>
</div>
</dl>

</section>

<section class="sometic-home-band sometic-home-band--steps">

<h2>Where the adapters live</h2>

<p>The engine is shared. Adapters are how you mount it. Wave A is production-ready for React, Vue, and shipped <code>sometic-*</code> elements; B and C are experimental binds. Not every structure or data surface ships a custom element yet. See <a href="/guide/whats-included">What’s included</a>.</p>

<ol class="sometic-home-steps">
<li>
<span class="sometic-home-steps__mark">A</span>
<h3><HomeGlyph name="bind" /> Production adapters</h3>
<p>Thin wrappers over shared engines for React, Vue, and Vanilla Web Components (shipped custom-element set plus DOM controllers).</p>
</li>
<li>
<span class="sometic-home-steps__mark">B</span>
<h3><HomeGlyph name="store" /> Store bindings</h3>
<p>State-slice integrations for Angular, Svelte, Solid, and Preact. Experimental.</p>
</li>
<li>
<span class="sometic-home-steps__mark">C</span>
<h3><HomeGlyph name="html" /> HTML-first enhancements</h3>
<p>Progressive hooks for Alpine.js, jQuery, and HTMX. Experimental.</p>
</li>
</ol>

</section>

<section class="sometic-home-band sometic-home-band--close">

<h2>Start where the system is</h2>

<p>Enter through architecture and app services first. UI engines are included. They are not the product story.</p>

<p class="sometic-home-close"><a class="sometic-home-close__cta" href="/guide/app-shell">Open App shell</a></p>

</section>
