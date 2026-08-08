<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
</script>

<template>
    <DemoFrame title="Preview" hint="Inline alert" stack>
        <div class="pg-row">
            <button type="button" class="pg-btn" @click="open = !open">
                {{ open ? "Hide alert" : "Show alert" }}
            </button>
        </div>
        <div v-if="open" class="pg-alert" role="status">Heads up, alert status surface.</div>
    </DemoFrame>
</template>
