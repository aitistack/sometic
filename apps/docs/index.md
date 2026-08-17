---
layout: home
title: Home
description: >-
    Sometic is an open-source TypeScript library (npm @sometic): portable
    application behavior for UI, forms, auth, HTTP, query, stores, theming, and
    app-shell with thin React, Vue, and Web Components adapters. Unstyled
    engines. Your design system.
hero:
    text: One behavior model for UI, forms, auth, HTTP, query, stores, and theming across every JavaScript stack.
    tagline: Shared controllers power the app. Thin adapters for React, Vue, and Web Components. Your design system stays yours. Swap the view layer without rewriting core logic.
features:
    - title: Same controller, any view
      details: React, Vue, and sometic-* custom elements are thin shells over one engine. Behavior is portable; the framework is not the source of truth.
    - title: Auth, HTTP, and query as first-class
      details: Session orchestration, fetch interceptors, query cache, and app-shell composition ship beside UI, not bolted on later, not locked to one SDK.
    - title: Unstyled on purpose
      details: Zero forced theme. Slots, data-state attributes, and tokens plug into Tailwind, Bootstrap, CSS Modules, or plain CSS.
    - title: Accessible by construction
      details: Focus traps, dismiss layers, portals, and scroll locks live in the core, composed into overlays, not patched after ship.
---

<section class="sometic-home-band sometic-home-band--proofs">

<h2>What makes Sometic different</h2>

<p>Not another component kit. A portable application behavior system. Prove it in three moves.</p>

<div class="sometic-home-proofs">
<article class="sometic-home-proof">
<span class="sometic-home-proof__index" aria-hidden="true">01</span>
<h3>One engine → three surfaces</h3>
<p>Write behavior once in a framework-agnostic controller. Bind it through React, Vue, or <code>sometic-*</code> elements without forking state, focus, or keyboard rules.</p>
<p class="sometic-home-proof__link"><a href="/concepts/architecture">See the architecture →</a></p>
</article>
<article class="sometic-home-proof">
<span class="sometic-home-proof__index" aria-hidden="true">02</span>
<h3>App spine: auth + HTTP + query</h3>
<p>When a request gets 401, Sometic coordinates refresh and retries. Session epoch clears query and bound stores together. Start with <a href="/guide/app-shell">App shell</a> / <code>createSometicApp</code>.</p>
<p class="sometic-home-proof__link"><a href="/authentication/">Authentication →</a> · <a href="/utilities/http">HTTP →</a> · <a href="/utilities/query">Query →</a></p>
</article>
<article class="sometic-home-proof">
<span class="sometic-home-proof__index" aria-hidden="true">03</span>
<h3>Same engine, your skin</h3>
<p>No default look. Style with slots and state attributes. Keep brand CSS intact while the behavior layer stays patchable via npm or CDN for shipped custom elements.</p>
<p class="sometic-home-proof__link"><a href="/guide/styling">Styling contract →</a></p>
</article>
</div>

</section>

<section class="sometic-home-band sometic-home-band--constraints">

<h2>Built for real production constraints</h2>

<p>Most UI kits assume your design system or force heavy third-party SDKs into your runtime. Sometic stays out of your way.</p>

<div class="sometic-home-constraints">
<article class="sometic-home-constraint">
<span class="sometic-home-constraint__index" aria-hidden="true">i</span>
<h3>Framework-agnostic controllers</h3>
<p>State, focus, and interaction logic are completely decoupled from framework lifecycles. Swap your view layer tomorrow without rewriting a single line of core behavior.</p>
</article>
<article class="sometic-home-constraint">
<span class="sometic-home-constraint__index" aria-hidden="true">ii</span>
<h3>Zero CSS contamination</h3>
<p>No stylesheets, no default themes, no runtime CSS injection. You own design tokens and DOM structure completely.</p>
</article>
<article class="sometic-home-constraint">
<span class="sometic-home-constraint__index" aria-hidden="true">iii</span>
<h3>Zero-dependency HTTP core</h3>
<p>Built on native fetch with an interceptor pipeline and token refresh queue. No mandatory Axios or networking SDK in core.</p>
</article>
<article class="sometic-home-constraint">
<span class="sometic-home-constraint__index" aria-hidden="true">iv</span>
<h3>SSR-safe from day one</h3>
<p>Core controllers guard environment globals at import time, so Next.js, Nuxt, and Remix avoid hydration mismatches and window errors.</p>
</article>
<article class="sometic-home-constraint">
<span class="sometic-home-constraint__index" aria-hidden="true">v</span>
<h3>Tree-shakable subpath exports</h3>
<p>Import only what you use. Feature-isolated packages keep production JavaScript lean and fast.</p>
</article>
<article class="sometic-home-constraint">
<span class="sometic-home-constraint__index" aria-hidden="true">vi</span>
<h3>Declarative slot architecture</h3>
<p>Layouts rely on native DOM slots and state attributes for precise control over rendered nodes and the accessibility tree.</p>
</article>
</div>

</section>

<section class="sometic-home-band sometic-home-band--waves">

<h2>Where the adapters live</h2>

<p>The engine is shared. Adapters are how you mount it. Wave A is production-ready for React, Vue, and shipped <code>sometic-*</code> elements; B and C are experimental binds. Not every structure or data surface ships a custom element yet. See <a href="/guide/whats-included">What’s included</a>.</p>

<div class="sometic-home-waves">
<article class="sometic-home-wave" data-wave="A">
<span class="sometic-home-wave__mark" aria-hidden="true">A</span>
<div class="sometic-home-wave__body">
<p class="sometic-home-wave__label">Production adapters</p>
<p class="sometic-home-wave__copy">Thin wrappers over shared engines for React, Vue, and Vanilla Web Components (shipped CE set + DOM controllers).</p>
</div>
</article>
<article class="sometic-home-wave" data-wave="B">
<span class="sometic-home-wave__mark" aria-hidden="true">B</span>
<div class="sometic-home-wave__body">
<p class="sometic-home-wave__label">Store bindings <em>Experimental</em></p>
<p class="sometic-home-wave__copy">State-slice integrations for Angular, Svelte, Solid, and Preact.</p>
</div>
</article>
<article class="sometic-home-wave" data-wave="C">
<span class="sometic-home-wave__mark" aria-hidden="true">C</span>
<div class="sometic-home-wave__body">
<p class="sometic-home-wave__label">HTML-first enhancements <em>Experimental</em></p>
<p class="sometic-home-wave__copy">Progressive hooks for Alpine.js, jQuery, and HTMX.</p>
</div>
</article>
</div>

</section>

<section class="sometic-home-band sometic-home-band--paths">

<h2>Start where the system is</h2>

<p>Enter through architecture and app services first. UI engines are included. They are not the product story.</p>

<div class="sometic-home-destinations">
<a class="sometic-home-dest" href="/guide/app-shell">
<span class="sometic-home-dest__kicker">App shell</span>
<span class="sometic-home-dest__title">createSometicApp spine for auth, HTTP, and query</span>
<span class="sometic-home-dest__hint">Start here</span>
</a>
<a class="sometic-home-dest" href="/concepts/architecture">
<span class="sometic-home-dest__kicker">Architecture</span>
<span class="sometic-home-dest__title">Controllers, layers, and adapters</span>
<span class="sometic-home-dest__hint">Read the model</span>
</a>
<a class="sometic-home-dest" href="/authentication/">
<span class="sometic-home-dest__kicker">Auth + HTTP + Query</span>
<span class="sometic-home-dest__title">Sessions, refresh, fetch, and cache</span>
<span class="sometic-home-dest__hint">Open services</span>
</a>
</div>

</section>
