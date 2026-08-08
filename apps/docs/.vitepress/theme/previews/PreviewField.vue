<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("");
</script>

<template>
    <DemoFrame title="Preview" stack>
        <div class="pg-field">
            <label class="pg-field-label" for="demo-field-email">Email</label>
            <input
                id="demo-field-email"
                v-model="value"
                class="pg-input"
                type="email"
                placeholder="you@example.com"
                aria-describedby="demo-field-hint"
            />
            <p id="demo-field-hint" class="pg-field-description">We’ll never share this.</p>
        </div>
    </DemoFrame>
</template>
