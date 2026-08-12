<script setup lang="ts">
import { computed, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const title = ref("");
const count = ref(1);
const published = ref(false);

const values = computed(() => ({
    title: title.value,
    count: count.value,
    published: published.value,
}));

const valuesJson = computed(() => JSON.stringify(values.value, null, 2));

function reset(): void {
    title.value = "";
    count.value = 1;
    published.value = false;
}
</script>

<template>
    <DemoFrame title="Preview" hint="Schema form" stack>
        <form class="pg-step-fields" @submit.prevent>
            <label class="pg-control">
                <span class="pg-control-label">title</span>
                <input v-model="title" class="pg-input" type="text" name="title" />
            </label>
            <label class="pg-control">
                <span class="pg-control-label">count</span>
                <input v-model.number="count" class="pg-input" type="number" name="count" />
            </label>
            <label class="pg-control pg-selection-row">
                <span class="pg-control-label">published</span>
                <input v-model="published" class="pg-check" type="checkbox" name="published" />
            </label>
            <div class="pg-row">
                <button type="button" class="pg-btn" @click="reset">Reset</button>
            </div>
        </form>
        <pre class="pg-status">{{ valuesJson }}</pre>
    </DemoFrame>
</template>
