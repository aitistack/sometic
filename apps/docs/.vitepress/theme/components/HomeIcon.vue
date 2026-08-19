<script setup lang="ts">
import { computed } from "vue";
import {
    ArrowLeftRight,
    ArrowRight,
    Atom,
    Check,
    CodeXml,
    Copy,
    Database,
    Download,
    Frame,
    KeyRound,
    ListChecks,
    Network,
    Package,
    RotateCcw,
    SwatchBook,
    Triangle,
    Workflow,
} from "@lucide/vue";

const props = defineProps<{
    name:
        | "arrow"
        | "architecture"
        | "copy"
        | "check"
        | "retry"
        | "spine"
        | "auth"
        | "http"
        | "query"
        | "store"
        | "bind"
        | "forms"
        | "theme"
        | "install"
        | "react"
        | "vue"
        | "elements";
}>();

const icons = {
    arrow: ArrowRight,
    architecture: Network,
    copy: Copy,
    check: Check,
    retry: RotateCcw,
    spine: Workflow,
    auth: KeyRound,
    http: ArrowLeftRight,
    query: Database,
    store: Package,
    bind: Frame,
    forms: ListChecks,
    theme: SwatchBook,
    install: Download,
    react: Atom,
    vue: Triangle,
    elements: CodeXml,
} as const;

const icon = computed(() => icons[props.name]);
const size = computed(() => (props.name === "spine" ? 24 : 20));
</script>

<template>
    <component
        :is="icon"
        class="sometic-home-icon"
        :size="size"
        :stroke-width="2"
        aria-hidden="true"
        focusable="false"
    />
</template>
