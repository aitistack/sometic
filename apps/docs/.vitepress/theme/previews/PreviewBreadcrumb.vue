<script setup lang="ts">
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview" hint="Breadcrumb">
        <nav aria-label="Breadcrumb" class="pg-breadcrumb" data-breadcrumb>
            <ol class="pg-breadcrumb-list">
                <li class="pg-breadcrumb-item" data-breadcrumb-item>
                    <a href="#">Docs</a>
                </li>
                <li class="pg-breadcrumb-item" data-breadcrumb-item>
                    <a href="#">Components</a>
                </li>
                <li
                    class="pg-breadcrumb-item"
                    data-breadcrumb-item
                    data-current-page
                    aria-current="page"
                >
                    Structure
                </li>
            </ol>
        </nav>
    </DemoFrame>
</template>
