<script setup lang="ts">
import { computed, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const digits = ref(["1", "2", "3", "", "", ""]);

const progress = computed(() => digits.value.filter((d) => d.length > 0).length);
</script>

<template>
    <DemoFrame title="Preview" hint="OTP cells">
        <div class="pg-otp" role="group" aria-label="One-time code" :data-progress="progress">
            <input
                v-for="(d, i) in digits"
                :key="i"
                v-model="digits[i]"
                class="pg-otp-cell"
                maxlength="1"
                inputmode="numeric"
                :data-filled="d ? 'true' : undefined"
                :aria-label="`Digit ${i + 1}`"
            />
        </div>
    </DemoFrame>
</template>
