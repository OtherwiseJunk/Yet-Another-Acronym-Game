<template>
    <h2 class="font">Submitted! Waiting for other players...</h2>
    <h4 class="smaller-font">{{ props.submissionText }}</h4>
</template>

<script setup lang="ts">
  const props = defineProps(['submissionText'])
</script>

<style scoped>
.font {
    font-size: 2em;
    font-family: 'Orbitron';
    font-weight: 800;
    font-style: normal;
}

.smaller-font {
    font-size: 1.5em;
    font-family: 'Orbitron';
    font-weight: 800;
    font-style: normal;
}
</style>