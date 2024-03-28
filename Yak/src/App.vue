<script setup lang="ts">
import ChatWindow from './components/ChatWindow.vue'
</script>

<template>
  <div>
    <img src="./assets/yaag_yak.svg" class="logo" alt="YAAG logo" />
    <h2>Yet Another Acronym Game</h2>
  </div>
  <ChatWindow/>
</template>

<style scoped>
.logo {
  height: 6em;
  will-change: filter;
  transition: filter 300ms;
  margin: 0px;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #ac69ff);
}
</style>
