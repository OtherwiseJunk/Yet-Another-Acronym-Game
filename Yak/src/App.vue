<script setup lang="ts">
// import ChatWindow from './components/ChatWindow.vue';
// import AnimatedTypingComponent from './components/AnimatedTypingComponent.vue';
import SplashScreen from './components/SplashScreen.vue'

// const title = "Yet Another Acronym Game";
Array.prototype.shuffle = function(){
    var i = this.length, j, temp;
  while(--i > 0){
    j = Math.floor(Math.random()*(i+1));
    temp = this[j];
    this[j] = this[i];
    this[i] = temp;
  }
}
</script>

<template>
  <SplashScreen></SplashScreen>
</template>

<style scoped>
@font-face {
  font-family: 'Honk';
  src: url("https://1219391019515121716.discordsays.com/assets/Orbitron.ttf");
}
SplashScreen{
  top: 0px;
}
</style>
