<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("secret");
const revealed = ref(false);
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control">
            <span class="pg-control-label">Password</span>
            <div class="pg-password" :data-revealed="revealed ? 'true' : undefined">
                <input
                    v-model="value"
                    class="pg-input pg-password-input"
                    :type="revealed ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="Secret"
                />
                <button
                    type="button"
                    class="pg-password-toggle"
                    :aria-pressed="revealed ? 'true' : 'false'"
                    :aria-label="revealed ? 'Hide password' : 'Show password'"
                    @click="revealed = !revealed"
                >
                    {{ revealed ? "Hide" : "Show" }}
                </button>
            </div>
        </label>
    </DemoFrame>
</template>
