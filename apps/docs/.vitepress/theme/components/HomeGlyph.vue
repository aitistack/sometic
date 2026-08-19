<script setup lang="ts">
defineProps<{
    name:
        | "arrow"
        | "layers"
        | "copy"
        | "check"
        | "retry"
        | "spine"
        | "auth"
        | "http"
        | "query"
        | "store"
        | "bind"
        | "forms"
        | "theme"
        | "install"
        | "react"
        | "vue"
        | "elements"
        | "a11y"
        | "skin"
        | "ssr"
        | "tree"
        | "slots"
        | "html";
}>();
</script>

<template>
    <svg class="sometic-home-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path v-if="name === 'arrow'" d="M5 12h12M13 6l6 6-6 6" />
        <path v-else-if="name === 'layers'" d="M4 9h11v11H4zM9 4h11v11" />
        <g v-else-if="name === 'copy'">
            <path d="M8 7h11v14H8z" />
            <path d="M5 17V3h11" />
        </g>
        <path v-else-if="name === 'check'" d="M5 12l5 5 9-10" />
        <g v-else-if="name === 'retry'">
            <path d="M5 9V5h4" />
            <path d="M5 5a8 8 0 1 1-1.5 6" />
        </g>
        <g v-else-if="name === 'spine'">
            <path d="M12 8v8M8 12h8" />
            <path d="M10 10h4v4h-4z" />
            <path d="M4 11h3v2H4zM17 11h3v2h-3zM11 4h2v3h-2zM11 17h2v3h-2z" />
        </g>
        <g v-else-if="name === 'auth'">
            <path d="M5 7h6v6H5z" />
            <path d="M10 10h10v3h-3v3h-3v-3" />
        </g>
        <g v-else-if="name === 'http'">
            <path d="M4 12h16" />
            <path d="M15 7l5 5-5 5" />
            <path d="M9 17l-5-5 5-5" />
        </g>
        <g v-else-if="name === 'query'">
            <path d="M5 7c0-1.4 3.1-2.5 7-2.5S19 5.6 19 7v10c0 1.4-3.1 2.5-7 2.5S5 18.4 5 17z" />
            <path d="M5 7c0 1.4 3.1 2.5 7 2.5S19 8.4 19 7" />
            <path d="M5 12c0 1.4 3.1 2.5 7 2.5S19 13.4 19 12" />
        </g>
        <g v-else-if="name === 'store'">
            <path d="M4 8l8-4 8 4v9l-8 4-8-4z" />
            <path d="M4 8l8 4 8-4M12 12v9" />
        </g>
        <g v-else-if="name === 'bind'">
            <path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" />
            <path d="M8 8h8v8H8z" />
        </g>
        <g v-else-if="name === 'forms'">
            <path d="M6 7h12M6 12h12M6 17h7" />
            <path d="M16 15l2 2 3-4" />
        </g>
        <g v-else-if="name === 'theme'">
            <path d="M5 5h14v14H5z" />
            <path d="M12 5v14" />
        </g>
        <g v-else-if="name === 'install'">
            <path d="M12 4v11" />
            <path d="M8 11l4 4 4-4" />
            <path d="M5 19h14" />
        </g>
        <g v-else-if="name === 'react'">
            <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />
        </g>
        <g v-else-if="name === 'vue'">
            <path d="M4 6h16L12 20z" />
            <path d="M8 6l4 8 4-8" />
        </g>
        <g v-else-if="name === 'elements'">
            <path d="M9 8l-4 4 4 4" />
            <path d="M15 8l4 4-4 4" />
        </g>
        <g v-else-if="name === 'a11y'">
            <path d="M5 5h14v14H5z" />
            <path d="M9 9h6v6H9z" />
        </g>
        <g v-else-if="name === 'skin'">
            <path d="M5 5h14v14H5z" />
            <path d="M5 5l14 14" />
        </g>
        <g v-else-if="name === 'ssr'">
            <path d="M4 6h12v12H4z" />
            <path d="M8 4h12v12" />
        </g>
        <g v-else-if="name === 'tree'">
            <path d="M6 6h12" />
            <path d="M6 12h8" />
            <path d="M6 18h5" />
        </g>
        <g v-else-if="name === 'slots'">
            <path d="M5 6h14v4H5z" />
            <path d="M5 14h9v4H5z" />
        </g>
        <g v-else-if="name === 'html'">
            <path d="M4 6h16v12H4z" />
            <path d="M8 10h8M8 14h5" />
        </g>
    </svg>
</template>
