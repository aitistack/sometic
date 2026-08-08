<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
</script>

<template>
    <DemoFrame title="Preview" hint="Toast queue item" stack>
        <div class="pg-row">
            <button type="button" class="pg-btn" @click="open = !open">
                {{ open ? "Dismiss toast" : "Show toast" }}
            </button>
        </div>
        <div v-if="open" class="pg-toast-region">
            <div data-slot="toast" role="status">
                <strong>Saved</strong>, Your changes are live.
            </div>
        </div>
    </DemoFrame>
</template>
