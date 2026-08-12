<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("overview");
</script>

<template>
    <DemoFrame title="Preview" hint="Tabs" stack>
        <div role="tablist" aria-orientation="horizontal" class="pg-tabs-list">
            <button
                type="button"
                class="pg-tab"
                role="tab"
                :aria-selected="value === 'overview'"
                :data-state="value === 'overview' ? 'active' : 'inactive'"
                @click="value = 'overview'"
            >
                Overview
            </button>
            <button
                type="button"
                class="pg-tab"
                role="tab"
                :aria-selected="value === 'api'"
                :data-state="value === 'api' ? 'active' : 'inactive'"
                @click="value = 'api'"
            >
                API
            </button>
            <button
                type="button"
                class="pg-tab"
                role="tab"
                :aria-selected="value === 'a11y'"
                :data-state="value === 'a11y' ? 'active' : 'inactive'"
                @click="value = 'a11y'"
            >
                A11y
            </button>
        </div>
        <div v-if="value === 'overview'" role="tabpanel" class="pg-tab-panel" data-state="active">
            Portable tab selection with ARIA resolve.
        </div>
        <div v-else-if="value === 'api'" role="tabpanel" class="pg-tab-panel" data-state="active">
            createTabsController + resolveTabTrigger/Panel.
        </div>
        <div v-else role="tabpanel" class="pg-tab-panel" data-state="active">
            Selected tab is tabindex 0; inactive tabs are -1.
        </div>
    </DemoFrame>
</template>
