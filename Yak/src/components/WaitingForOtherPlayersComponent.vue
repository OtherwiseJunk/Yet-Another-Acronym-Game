<template>
    <h2 class="font">Submitted! Waiting for other players...</h2>
    <h4 class="smaller-font">{{ submission }}</h4>
</template>

<script setup lang="ts">
  const props = defineProps(['submissionText'])
</script>

<style scoped>

</style>