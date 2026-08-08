<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const label = ref("Choose a file");

function onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    label.value = file ? file.name : "Choose a file";
}
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control">
            <span class="pg-control-label">File</span>
            <button type="button" class="pg-btn" style="position: relative; overflow: hidden">
                {{ label }}
                <input
                    type="file"
                    style="position: absolute; inset: 0; opacity: 0; cursor: pointer"
                    @change="onChange"
                />
            </button>
        </label>
    </DemoFrame>
</template>
