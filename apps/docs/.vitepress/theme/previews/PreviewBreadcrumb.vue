<script setup lang="ts">
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview" hint="Breadcrumb">
        <nav aria-label="Breadcrumb" class="pg-breadcrumb-nav">
            <ol class="pg-breadcrumb">
                <li data-slot="item"><a href="#">Docs</a></li>
                <li data-slot="item"><a href="#">Components</a></li>
                <li data-slot="item" aria-current="page" data-current="">Breadcrumb</li>
            </ol>
        </nav>
    </DemoFrame>
</template>

<style scoped>
.pg-breadcrumb-nav {
    width: 100%;
}
.pg-breadcrumb {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
    white-space: nowrap;
}
.pg-breadcrumb li {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    white-space: nowrap;
}
.pg-breadcrumb li:not(:last-child)::after {
    content: "/";
    margin: 0 0.5rem;
    color: var(--vp-c-text-3);
}
.pg-breadcrumb a {
    color: var(--vp-c-brand-1);
    text-decoration: underline;
    text-underline-offset: 0.12em;
}
.pg-breadcrumb [aria-current="page"] {
    color: var(--vp-c-text-1);
    font-weight: 600;
}
</style>
