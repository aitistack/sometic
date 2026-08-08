import "./styles.css";
import { mountThemeSection } from "./sections/theme.js";
import { mountA11ySection } from "./sections/a11y.js";
import { mountButtonsSection } from "./sections/buttons.js";
import { mountInputSection } from "./sections/input.js";
import { mountFormsSection } from "./sections/forms.js";
import { mountSelectionSection } from "./sections/selection.js";
import { mountOverlaySection } from "./sections/overlay.js";
import { mountStructureSection } from "./sections/structure.js";
import { mountHeadSection } from "./sections/head.js";
import { mountAuthSection } from "./sections/auth.js";
import { mountHttpSection } from "./sections/http.js";
import { mountAuthProvidersSection } from "./sections/auth-providers.js";
import { mountQuerySection } from "./sections/query.js";
import { mountAppShellSection } from "./sections/app-shell.js";
import Logo from "./assets/logo.png";

const app = document.querySelector("#app");
if (!(app instanceof HTMLElement)) {
    throw new Error("Missing #app root");
}

app.innerHTML = `
  <header class="pg-hero">
    <div class="pg-brand"><img data-pg-logo alt="Sometic" class="pg-brand-logo" /></div>
    <h1>Vanilla playground</h1>
    <p>
      Click-through harness for Theme, Accessibility, Buttons, Input/Field, Forms, Structure,
      Overlay, Head, Auth, HTTP, Query, and App Shell. Use this page after each phase ships interactive surfaces.
    </p>
    <nav class="pg-nav" aria-label="Sections">
      <a href="#theme">Theme</a>
      <a href="#a11y">Accessibility</a>
      <a href="#buttons">Buttons</a>
      <a href="#input">Input</a>
      <a href="#selection">Selection</a>
      <a href="#structure">Structure</a>
      <a href="#overlay">Overlay</a>
      <a href="#head">Head</a>
      <a href="#forms">Forms</a>
      <a href="#auth">Auth</a>
      <a href="#auth-providers">Providers</a>
      <a href="#http">HTTP</a>
      <a href="#query">Query</a>
      <a href="#app-shell">App Shell</a>
    </nav>
  </header>

  <section class="pg-section" id="theme">
    <h2>Theme</h2>
    <p class="pg-lead">Switch mode, density, and direction. Watch <code>data-*</code> and CSS variables on <code>&lt;html&gt;</code>.</p>
    <div class="pg-row">
      <span class="pg-label">Mode</span>
      <button type="button" class="pg-btn" data-theme-mode="light">Light</button>
      <button type="button" class="pg-btn" data-theme-mode="dark">Dark</button>
      <button type="button" class="pg-btn" data-theme-mode="system">System</button>
    </div>
    <div class="pg-row">
      <span class="pg-label">Density</span>
      <button type="button" class="pg-btn" data-theme-density="comfortable">Comfortable</button>
      <button type="button" class="pg-btn" data-theme-density="compact">Compact</button>
      <button type="button" class="pg-btn" data-theme-density="spacious">Spacious</button>
    </div>
    <div class="pg-row">
      <span class="pg-label">Direction</span>
      <button type="button" class="pg-btn" data-theme-dir="ltr">LTR</button>
      <button type="button" class="pg-btn" data-theme-dir="rtl">RTL</button>
    </div>
    <div class="pg-row">
      <span class="pg-label">Tokens</span>
      <div class="pg-swatch">color.bg / fg</div>
    </div>
    <p class="pg-status" data-theme-status></p>
  </section>

  <section class="pg-section" id="a11y">
    <h2>Accessibility</h2>
    <p class="pg-lead">Focus trap, nested dismissable layers, scroll lock, and live announcer.</p>
    <div class="pg-row pg-tools">
      <button type="button" class="pg-btn" data-a11y-open>Open dialog</button>
      <button type="button" class="pg-btn" data-a11y-lock>Lock body scroll</button>
      <button type="button" class="pg-btn" data-a11y-announce>Announce status</button>
    </div>
    <div class="pg-scroll-box">
      <p>Scrollable sample content.</p>
      <p>Line 2</p><p>Line 3</p><p>Line 4</p><p>Line 5</p>
      <p>Line 6</p><p>Line 7</p><p>Line 8</p>
    </div>
    <p class="pg-status" data-a11y-status></p>
    <div class="pg-dialog" data-a11y-dialog data-open="false" role="presentation">
      <div class="pg-dialog-card" data-a11y-dialog-card role="dialog" aria-modal="true" aria-labelledby="a11y-dialog-title">
        <h3 id="a11y-dialog-title">Focus trap demo</h3>
        <p>Tab should cycle inside. Escape or outside click dismisses. Nest another layer to test the stack.</p>
        <div class="pg-row pg-tools">
          <button type="button" class="pg-btn" data-a11y-nest>Toggle nested layer</button>
          <button type="button" class="pg-btn" data-a11y-close>Close</button>
        </div>
      </div>
    </div>
  </section>

  <section class="pg-section" id="buttons">
    <h2>Buttons</h2>
    <p class="pg-lead">Web Components from <code>@sometic/elements</code> plus Vanilla <code>bindButton</code>. Light DOM default; <code>shadow</code> attribute for embeds.</p>
    <div class="pg-row pg-tools">
      <button type="button" class="pg-btn" data-buttons-loading>Set loading</button>
    </div>
    <div class="pg-buttons-demo">
      <sometic-button data-demo="basic">Save</sometic-button>
      <sometic-button data-demo="loading">Async look</sometic-button>
      <sometic-async-button data-demo="async">Run action</sometic-async-button>
      <sometic-icon-button aria-label="Close">×</sometic-icon-button>
      <sometic-toggle-button>Toggle</sometic-toggle-button>
      <sometic-button-group orientation="horizontal">
        <sometic-button>One</sometic-button>
        <sometic-button>Two</sometic-button>
      </sometic-button-group>
      <button type="button" id="vanilla-bind">Vanilla bind</button>
    </div>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Light vs Shadow</h3>
      <p class="pg-demo-hint">Same tag; Shadow isolates internals (page CSS does not reach the inner button unless you style <code>:host</code> / inject rules).</p>
      <div class="pg-buttons-demo">
        <sometic-button data-demo="light-mode">Light DOM</sometic-button>
        <sometic-button shadow data-demo="shadow-mode">Shadow DOM</sometic-button>
      </div>
    </div>
    <p class="pg-status" data-buttons-status></p>
  </section>

  <section class="pg-section" id="input">
    <h2>Input &amp; Field</h2>
    <p class="pg-lead">Field labeling, text bind, password reveal, multi-digit OTP, mask, currency, date adapter, and WC inputs.</p>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Field</h3>
      <div class="pg-field" data-field-host></div>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Text · Password · Mask · Currency · Date</h3>
      <div class="pg-input-grid">
        <label class="pg-control">
          <span>Text</span>
          <input class="pg-input" data-input-text placeholder="Type here" />
        </label>
        <label class="pg-control">
          <span>Password</span>
          <div class="pg-password" data-password-shell>
            <input class="pg-input pg-password-input" data-input-password placeholder="Secret" autocomplete="current-password" />
            <button type="button" class="pg-password-toggle" data-input-reveal aria-label="Show password" aria-pressed="false">
              <span data-reveal-label>Show</span>
            </button>
          </div>
        </label>
        <label class="pg-control">
          <span>Phone mask</span>
          <input class="pg-input" data-input-mask placeholder="(###) ###-####" inputmode="tel" />
        </label>
        <label class="pg-control">
          <span>Currency</span>
          <input class="pg-input" data-input-currency placeholder="$0.00" inputmode="decimal" />
        </label>
        <label class="pg-control">
          <span>Date</span>
          <input class="pg-input" data-input-date type="date" />
        </label>
      </div>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">OTP · multi-digit</h3>
      <p class="pg-demo-hint">Paste a full code into any cell · arrows / Home / End jump · Backspace retreats smoothly.</p>
      <div class="pg-otp" data-input-otp role="group" aria-label="One-time code"></div>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Web Components</h3>
      <div class="pg-input-grid">
        <label class="pg-control">
          <span>sometic-field</span>
          <sometic-field class="pg-ce-field">
            <sometic-input class="pg-ce-input" value="" placeholder="Inside field"></sometic-input>
          </sometic-field>
        </label>
        <label class="pg-control">
          <span>sometic-input</span>
          <sometic-input class="pg-ce-input" data-demo="text" value="" placeholder="WC text"></sometic-input>
        </label>
        <label class="pg-control">
          <span>sometic-password-input</span>
          <sometic-password-input class="pg-ce-input" placeholder="WC password"></sometic-password-input>
        </label>
        <label class="pg-control">
          <span>sometic-otp-input</span>
          <sometic-otp-input class="pg-ce-input" length="6" value=""></sometic-otp-input>
        </label>
        <label class="pg-control">
          <span>sometic-number-input</span>
          <sometic-number-input class="pg-ce-input" min="0" max="100" value="3"></sometic-number-input>
        </label>
        <label class="pg-control">
          <span>sometic-masked-input</span>
          <sometic-masked-input class="pg-ce-input" mask="(###) ###-####" placeholder="Phone"></sometic-masked-input>
        </label>
        <label class="pg-control">
          <span>sometic-currency-input</span>
          <sometic-currency-input class="pg-ce-input" currency="USD" value="12.5"></sometic-currency-input>
        </label>
        <label class="pg-control">
          <span>sometic-date-input</span>
          <sometic-date-input class="pg-ce-input"></sometic-date-input>
        </label>
        <label class="pg-control">
          <span>sometic-file-input</span>
          <sometic-file-input
            class="pg-ce-input pg-file-input"
            accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.pdf,.txt,.csv,.zip,.mp3,.mp4,.doc,.docx,.xls,.xlsx,image/*,application/pdf,audio/*,video/*"
          ></sometic-file-input>
        </label>
        <label class="pg-control">
          <span>sometic-input (shadow)</span>
          <sometic-input shadow class="pg-ce-input" data-demo="shadow-input" placeholder="Shadow input"></sometic-input>
        </label>
      </div>
    </div>

    <p class="pg-status" data-input-status></p>
  </section>

  <section class="pg-section" id="selection">
    <h2>Selection</h2>
    <p class="pg-lead">Checkbox, switch, radio group, and select engines plus <code>sometic-*</code> custom elements.</p>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Native binds</h3>
      <div class="pg-input-grid pg-selection-grid">
        <label class="pg-control pg-selection-row">
          <span>Checkbox</span>
          <input type="checkbox" class="pg-check" data-selection-checkbox />
        </label>
        <label class="pg-control pg-selection-row">
          <span>Switch</span>
          <input type="checkbox" role="switch" class="pg-switch" data-selection-switch />
        </label>
        <fieldset class="pg-control pg-radio-group">
          <legend>Plan</legend>
          <label class="pg-radio-option"><input type="radio" class="pg-radio" name="plan" value="free" /> Free</label>
          <label class="pg-radio-option"><input type="radio" class="pg-radio" name="plan" value="pro" checked /> Pro</label>
        </fieldset>
        <label class="pg-control">
          <span>Country</span>
          <select class="pg-input pg-select" data-selection-select></select>
        </label>
      </div>
    </div>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Web Components</h3>
      <div class="pg-input-grid pg-selection-grid">
        <label class="pg-control pg-selection-row">
          <span>sometic-checkbox</span>
          <sometic-checkbox class="pg-ce-check"></sometic-checkbox>
        </label>
        <label class="pg-control pg-selection-row">
          <span>sometic-switch</span>
          <sometic-switch class="pg-ce-switch"></sometic-switch>
        </label>
      </div>
    </div>
    <p class="pg-status" data-selection-status></p>
  </section>

  <section class="pg-section" id="structure">
    <h2>Structure &amp; feedback</h2>
    <p class="pg-lead">
      Tabs, accordion, combobox, and breadcrumb via <code>@sometic/dom</code> controllers/resolve,
      plus <code>sometic-badge|progress|spinner|skeleton</code> custom elements.
    </p>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Tabs</h3>
      <div data-tabs-root>
        <div class="pg-tabs-list" data-tabs-list>
          <button type="button" class="pg-tab" data-tab="overview">Overview</button>
          <button type="button" class="pg-tab" data-tab="api">API</button>
          <button type="button" class="pg-tab" data-tab="a11y">A11y</button>
        </div>
        <div class="pg-tab-panel" data-tab-panel="overview">Portable tab selection with ARIA resolve.</div>
        <div class="pg-tab-panel" data-tab-panel="api" hidden>createTabsController + resolveTabTrigger/Panel.</div>
        <div class="pg-tab-panel" data-tab-panel="a11y" hidden>Selected tab is tabindex 0; inactive tabs are -1.</div>
      </div>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Accordion</h3>
      <div class="pg-accordion" data-accordion-root>
        <div class="pg-accordion-item" data-accordion-item="a">
          <button type="button" class="pg-accordion-trigger" data-accordion-trigger>Shipping</button>
          <div class="pg-accordion-panel" data-accordion-panel>Single-type accordion opens one item at a time.</div>
        </div>
        <div class="pg-accordion-item" data-accordion-item="b">
          <button type="button" class="pg-accordion-trigger" data-accordion-trigger>Returns</button>
          <div class="pg-accordion-panel" data-accordion-panel hidden>Toggle calls createAccordionController.</div>
        </div>
      </div>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Combobox</h3>
      <div class="pg-combobox" data-combobox-root>
        <input class="pg-input" data-combobox-input placeholder="Filter frameworks" autocomplete="off" />
        <ul class="pg-combobox-list" data-combobox-list hidden>
          <li class="pg-combobox-option" data-combobox-option="react">React</li>
          <li class="pg-combobox-option" data-combobox-option="vue">Vue</li>
          <li class="pg-combobox-option" data-combobox-option="vanilla">Vanilla</li>
          <li class="pg-combobox-option" data-combobox-option="svelte">Svelte</li>
        </ul>
      </div>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Breadcrumb</h3>
      <nav class="pg-breadcrumb" data-breadcrumb>
        <ol class="pg-breadcrumb-list">
          <li class="pg-breadcrumb-item" data-breadcrumb-item><a href="#structure">Docs</a></li>
          <li class="pg-breadcrumb-item" data-breadcrumb-item><a href="#structure">Components</a></li>
          <li class="pg-breadcrumb-item" data-breadcrumb-item data-current-page>Structure</li>
        </ol>
      </nav>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Badge · Progress · Spinner · Skeleton</h3>
      <div class="pg-feedback-row">
        <sometic-badge class="pg-badge" tone="neutral">Neutral</sometic-badge>
        <sometic-badge class="pg-badge" tone="info">Info</sometic-badge>
        <sometic-badge class="pg-badge" tone="success">Success</sometic-badge>
        <sometic-badge class="pg-badge" tone="warning">Warning</sometic-badge>
        <sometic-badge class="pg-badge" tone="danger">Danger</sometic-badge>
      </div>
      <div class="pg-feedback-row">
        <sometic-progress class="pg-progress" value="40" max="100"></sometic-progress>
        <button type="button" class="pg-btn" data-progress-bump>Bump progress</button>
      </div>
      <div class="pg-feedback-row">
        <sometic-spinner class="pg-spinner" label="Loading demos"></sometic-spinner>
        <sometic-skeleton class="pg-skeleton"></sometic-skeleton>
        <sometic-skeleton class="pg-skeleton pg-skeleton-wide"></sometic-skeleton>
      </div>
    </div>

    <p class="pg-status" data-structure-status></p>
  </section>

  <section class="pg-section" id="overlay">
    <h2>Overlay &amp; feedback</h2>
    <p class="pg-lead">Dialog, drawer, menu, toast queue, and alert — CE where shipped, DOM controllers otherwise.</p>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Dialog</h3>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-open-dialog>Open dialog</button>
      </div>
      <sometic-dialog>
        <div class="pg-overlay-panel">
          <h4>Confirm</h4>
          <p>Nested Escape and focus restore are wired through the overlay controller.</p>
          <button type="button" class="pg-btn" data-close-dialog>Close</button>
        </div>
      </sometic-dialog>
    </div>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Drawer</h3>
      <p class="pg-demo-hint">Modal side panel via <code>createDrawerController</code> (no CE yet).</p>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-open-drawer>Open drawer</button>
      </div>
      <div class="pg-drawer" data-drawer-panel hidden>
        <h4 id="pg-drawer-title">Account settings</h4>
        <p>Escape dismisses · focus trap · body scroll lock.</p>
        <button type="button" class="pg-btn" data-close-drawer>Close</button>
      </div>
    </div>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Menu</h3>
      <p class="pg-demo-hint">Non-modal menu via <code>createMenuController</code> + positioning.</p>
      <div class="pg-menu-shell">
        <button type="button" class="pg-btn" data-menu-trigger>Actions</button>
        <div class="pg-menu" data-menu-panel hidden>
          <button type="button" class="pg-menu-item" data-menu-item>Edit</button>
          <button type="button" class="pg-menu-item" data-menu-item>Duplicate</button>
          <button type="button" class="pg-menu-item" data-menu-item data-disabled>Delete (disabled)</button>
        </div>
      </div>
    </div>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Toast + Alert</h3>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-push-toast>Push toast</button>
      </div>
      <sometic-toast-region class="pg-toast-region"></sometic-toast-region>
      <sometic-alert tone="info" class="pg-alert"></sometic-alert>
    </div>
    <p class="pg-status" data-overlay-status></p>
  </section>

  <section class="pg-section" id="head">
    <h2>Document head</h2>
    <p class="pg-lead">
      <code>@sometic/head</code> patches title (with template) and meta, then <code>applyHead</code> writes to the live document.
    </p>
    <div class="pg-demo-block">
      <div class="pg-input-grid">
        <label class="pg-control">
          <span>Page title</span>
          <input class="pg-input" data-head-title placeholder="Vanilla playground" />
        </label>
      </div>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-head-apply>Apply title</button>
        <button type="button" class="pg-btn" data-head-reset>Reset</button>
      </div>
      <p class="pg-demo-hint">Live <code>document.title</code>: <strong data-head-live></strong></p>
    </div>
    <p class="pg-status" data-head-status></p>
  </section>

  <section class="pg-section" id="forms">
    <h2>Validation &amp; Forms</h2>
    <p class="pg-lead">Login validation, server errors, field arrays, multi-step, async username, drafts, FormData, and <code>sometic-form</code>.</p>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Login</h3>
      <div class="pg-input-grid">
        <label class="pg-control">
          <span>Email</span>
          <input class="pg-input" data-login-email name="email" autocomplete="username" />
          <span class="pg-field-error" data-login-email-error></span>
        </label>
        <label class="pg-control">
          <span>Password</span>
          <input class="pg-input" data-login-password name="password" type="password" autocomplete="current-password" />
          <span class="pg-field-error" data-login-password-error></span>
        </label>
      </div>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-login-submit>Submit login</button>
        <button type="button" class="pg-btn" data-login-server>Inject server error</button>
        <button type="button" class="pg-btn" data-formdata-dump>Dump FormData</button>
      </div>
      <p class="pg-status" data-forms-summary role="status"></p>
      <p class="pg-form-feedback" data-login-feedback hidden></p>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Define schema (native)</h3>
      <p class="pg-demo-hint">
        <code>@sometic/validation/define</code> object schema via <code>fromSchema</code> (Zod/Yup adapters use the same seam).
      </p>
      <div class="pg-input-grid">
        <label class="pg-control">
          <span>Email</span>
          <input class="pg-input" data-schema-email name="schemaEmail" />
          <span class="pg-field-error" data-schema-email-error></span>
        </label>
        <label class="pg-control">
          <span>Age</span>
          <input class="pg-input" data-schema-age name="schemaAge" inputmode="numeric" />
          <span class="pg-field-error" data-schema-age-error></span>
        </label>
      </div>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-schema-submit>Validate schema form</button>
      </div>
      <p class="pg-status" data-schema-status role="status"></p>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Field array</h3>
      <div data-array-list></div>
      <button type="button" class="pg-btn" data-array-add>Add item</button>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Multi-step</h3>
      <p class="pg-demo-hint" data-step-label>Step</p>
      <div class="pg-step-fields" data-step-fields></div>
      <p class="pg-form-feedback" data-step-feedback hidden></p>
      <div class="pg-row pg-tools pg-step-actions">
        <button type="button" class="pg-btn" data-step-back>Back</button>
        <button type="button" class="pg-btn" data-step-next>Next</button>
        <button type="button" class="pg-btn" data-step-submit hidden>Finish</button>
      </div>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Async username · Draft</h3>
      <div class="pg-input-grid">
        <label class="pg-control">
          <span class="pg-control-label">Username (try admin)</span>
          <input class="pg-input" data-async-username name="username" />
          <span class="pg-field-error" data-async-username-error></span>
        </label>
        <label class="pg-control">
          <span class="pg-control-label">Draft note</span>
          <input class="pg-input" data-draft-note />
          <span class="pg-field-error" aria-hidden="true"></span>
        </label>
      </div>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-draft-save>Save draft</button>
        <button type="button" class="pg-btn" data-draft-load>Load draft</button>
      </div>
    </div>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">sometic-form</h3>
      <sometic-form>
        <label class="pg-control">
          <span>Name</span>
          <input class="pg-input" name="name" required />
        </label>
        <button type="submit" class="pg-btn">Submit element form</button>
      </sometic-form>
      <p class="pg-status" data-elements-form-status></p>
    </div>

    <p class="pg-status" data-forms-status></p>
  </section>

  <section class="pg-section" id="auth">
    <h2>Auth core</h2>
    <p class="pg-lead">
      Test provider sign-in, refresh, storage toggle, and UX-only <code>can()</code>.
      Production providers ship in Phase 12. Client checks are not API security.
    </p>

    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Session</h3>
      <div class="pg-input-grid">
        <label class="pg-control">
          <span class="pg-control-label">Email</span>
          <input class="pg-input" data-auth-email autocomplete="username" />
          <span class="pg-field-error" aria-hidden="true"></span>
        </label>
        <label class="pg-control">
          <span class="pg-control-label">Password</span>
          <input class="pg-input" data-auth-password type="password" autocomplete="current-password" />
          <span class="pg-field-error" aria-hidden="true"></span>
        </label>
      </div>
      <label class="pg-control" style="max-width:16rem;margin-top:0.75rem">
        <span class="pg-control-label">Storage</span>
        <select class="pg-input" data-auth-storage>
          <option value="memory">memory</option>
          <option value="session">sessionStorage</option>
        </select>
        <span class="pg-field-error" aria-hidden="true"></span>
      </label>
      <div class="pg-row pg-tools" style="margin-top:1rem">
        <button type="button" class="pg-btn" data-auth-signin>Sign in</button>
        <button type="button" class="pg-btn" data-auth-signout>Sign out</button>
        <button type="button" class="pg-btn" data-auth-refresh>Refresh</button>
        <button type="button" class="pg-btn" data-auth-expire>Force expire</button>
        <button type="button" class="pg-btn" data-auth-unauthorized>handleUnauthorized</button>
      </div>
      <p class="pg-demo-hint" style="margin-top:0.85rem">
        Element status: <sometic-auth-status></sometic-auth-status>
      </p>
      <pre class="pg-auth-session" data-auth-session></pre>
      <p class="pg-status" data-auth-can></p>
      <p class="pg-status" data-auth-status></p>
    </div>
  </section>

  <section class="pg-section" id="auth-providers">
    <h2>Auth providers</h2>
    <p class="pg-lead">
      Switch Test / Local REST / Firebase / Supabase / OIDC adapters. All demos use in-playground mocks — no cloud API keys required.
      Real apps pass their Firebase/Supabase clients as peers.
    </p>
    <div class="pg-demo-block">
      <label class="pg-control" style="max-width:18rem">
        <span class="pg-control-label">Provider</span>
        <select class="pg-input" data-providers-select>
          <option value="test">test</option>
          <option value="local">local REST</option>
          <option value="firebase">firebase (mock)</option>
          <option value="supabase">supabase (mock)</option>
          <option value="oidc">oidc PKCE (mock)</option>
        </select>
        <span class="pg-field-error" aria-hidden="true"></span>
      </label>
      <div class="pg-input-grid" style="margin-top:1rem">
        <label class="pg-control">
          <span class="pg-control-label">Email</span>
          <input class="pg-input" data-providers-email autocomplete="username" />
          <span class="pg-field-error" aria-hidden="true"></span>
        </label>
        <label class="pg-control">
          <span class="pg-control-label">Password</span>
          <input class="pg-input" data-providers-password type="password" autocomplete="current-password" />
          <span class="pg-field-error" aria-hidden="true"></span>
        </label>
      </div>
      <div class="pg-row pg-tools" style="margin-top:1rem">
        <button type="button" class="pg-btn" data-providers-signin>Sign in</button>
        <button type="button" class="pg-btn" data-providers-signout>Sign out</button>
        <button type="button" class="pg-btn" data-providers-refresh>Refresh</button>
        <button type="button" class="pg-btn" data-providers-oauth-start>Start OAuth</button>
        <button type="button" class="pg-btn" data-providers-oauth-complete>Complete OAuth</button>
      </div>
      <p class="pg-demo-hint" data-providers-caps style="margin-top:0.85rem"></p>
      <pre class="pg-auth-session" data-providers-oauth style="max-height:6rem"></pre>
      <pre class="pg-auth-session" data-providers-session></pre>
      <p class="pg-status" data-providers-status></p>
    </div>
  </section>

  <section class="pg-section" id="http">
    <h2>HTTP client</h2>
    <p class="pg-lead">
      Fetch-first client with mock transport, retry, abort, and 401→auth refresh queue.
      No real network required.
    </p>
    <div class="pg-demo-block">
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-http-get>GET /ok</button>
        <button type="button" class="pg-btn" data-http-auth>401 → refresh → replay</button>
        <button type="button" class="pg-btn" data-http-abort>Abort request</button>
      </div>
      <pre class="pg-auth-session" data-http-log></pre>
      <p class="pg-status" data-http-status></p>
    </div>
  </section>

  <section class="pg-section" id="query">
    <h2>Query</h2>
    <p class="pg-lead">
      <code>@sometic/query</code> list via <code>createQueryClient</code> + <code>createQueryObserver</code>,
      plus a mutation with optimistic update and <code>invalidateKeys</code>.
    </p>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Items</h3>
      <ul class="pg-query-list" data-query-list></ul>
      <div class="pg-input-grid" style="margin-top:0.75rem">
        <label class="pg-control">
          <span>New item</span>
          <input class="pg-input" data-query-title placeholder="Title" />
        </label>
      </div>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-query-add>Add (optimistic)</button>
        <button type="button" class="pg-btn" data-query-refetch>Refetch</button>
      </div>
    </div>
    <p class="pg-status" data-query-status></p>
  </section>

  <section class="pg-section" id="app-shell">
    <h2>App Shell</h2>
    <p class="pg-lead">
      <code>createAppShell</code> — shared session epoch clears query cache on sign-out,
      theme syncs head <code>color-scheme</code>, drafts omit secrets, mutation form bind.
    </p>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Session epoch</h3>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-shell-signin>Sign in</button>
        <button type="button" class="pg-btn" data-shell-signout>Sign out</button>
        <span class="pg-label">Epoch <strong data-shell-epoch>0</strong></span>
      </div>
      <ul class="pg-query-list" data-shell-list></ul>
    </div>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Theme ↔ head</h3>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-shell-theme-light>Light</button>
        <button type="button" class="pg-btn" data-shell-theme-dark>Dark</button>
      </div>
      <p class="pg-demo-hint">Head attrs: <code data-shell-scheme></code></p>
    </div>
    <div class="pg-demo-block">
      <h3 class="pg-demo-title">Draft omit + mutation form</h3>
      <div class="pg-input-grid">
        <label class="pg-control">
          <span>Title</span>
          <input class="pg-input" data-shell-title placeholder="Item title" />
        </label>
        <label class="pg-control">
          <span>Secret (omitted from draft)</span>
          <input class="pg-input" data-shell-secret type="password" placeholder="never persisted" />
        </label>
      </div>
      <div class="pg-row pg-tools">
        <button type="button" class="pg-btn" data-shell-draft-save>Save draft</button>
        <button type="button" class="pg-btn" data-shell-submit>Submit mutation</button>
      </div>
      <pre class="pg-auth-session" data-shell-draft style="max-height:6rem"></pre>
    </div>
    <p class="pg-status" data-shell-status></p>
  </section>
`;

const logoEl = app.querySelector<HTMLImageElement>("[data-pg-logo]");
if (logoEl) {
    logoEl.src = Logo;
}

const cleanups = [
    mountThemeSection(app),
    mountA11ySection(app),
    mountButtonsSection(app),
    mountInputSection(app),
    mountSelectionSection(app),
    mountStructureSection(app),
    mountOverlaySection(app),
    mountHeadSection(app),
    mountAuthSection(app),
    mountAuthProvidersSection(app),
    mountHttpSection(app),
    mountQuerySection(app),
    mountAppShellSection(app),
];
mountFormsSection(app);

window.addEventListener("pagehide", () => {
    for (const cleanup of cleanups) {
        cleanup();
    }
});
