<script setup lang="ts">
import ChatWindow from './components/ChatWindow.vue';
import AnimatedTypingComponent from './components/AnimatedTypingComponent.vue';

const title = "Yet Another Acronym Game";
</script>

<template>
  <div>
    <AnimatedTypingComponent :text="title" />
  </div>
  <ChatWindow/>
</template>

<style scoped>

</style>
