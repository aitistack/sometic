<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const email = ref("");
const name = ref("");
</script>

<template>
    <DemoFrame title="Preview" hint="Form layout example" stack>
        <form class="pg-step-fields" @submit.prevent>
            <label class="pg-control">
                <span class="pg-control-label">Name</span>
                <input id="demo-form-name" v-model="name" class="pg-input" type="text" />
            </label>
            <label class="pg-control">
                <span class="pg-control-label">Email</span>
                <input id="demo-form-email" v-model="email" class="pg-input" type="email" />
            </label>
            <div class="pg-row">
                <button type="submit" class="pg-btn">Submit</button>
            </div>
        </form>
    </DemoFrame>
</template>
