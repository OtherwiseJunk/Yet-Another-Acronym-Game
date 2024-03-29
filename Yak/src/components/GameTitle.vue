<template>
    <AnimatedTypingComponent :text="fullTitle"></AnimatedTypingComponent>
</template>

<style scoped>

</style>

<script setup lang="ts">
import AnimatedTypingComponent from './AnimatedTypingComponent.vue';

const fullTitle = "Yet Another Acronym Game";
</script>