<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("pro");
</script>

<template>
    <DemoFrame title="Preview">
        <fieldset class="pg-radio-group">
            <legend>Plan</legend>
            <label class="pg-radio-option" style="cursor: pointer">
                <input v-model="value" class="pg-radio" type="radio" name="plan" value="free" />
                Free
            </label>
            <label class="pg-radio-option" style="cursor: pointer">
                <input v-model="value" class="pg-radio" type="radio" name="plan" value="pro" />
                Pro
            </label>
            <label class="pg-radio-option" style="cursor: pointer">
                <input v-model="value" class="pg-radio" type="radio" name="plan" value="team" />
                Team
            </label>
        </fieldset>
    </DemoFrame>
</template>
