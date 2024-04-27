<script setup lang="ts">
// import ChatWindow from './components/ChatWindow.vue';
// import AnimatedTypingComponent from './components/AnimatedTypingComponent.vue';
import { ref } from 'vue';
import SplashScreen from './components/SplashScreen.vue'
import AnswerSubmission from './components/AnswerSubmissionScreen.vue'
// import { useDiscordStore } from './stores/discordStore';
import { useGameStore } from './stores/gameStore';

// const title = "Yet Another Acronym Game";
// const discord = useDiscordStore();
const cable = useGameStore();
let phase = ref(0)
let animationComplete = ref(false);
let acronym = ref("");
cable.$subscribe((_, state) =>{
  phase.value = state.gameState.game_phase
  acronym.value = state.gameState.current_acronym
})

function onComplete(){
  animationComplete.value = true;
}
function onStart(){
  cable.startGame();
}
function onSubmit(answer: string){
  cable.submitAnswer(answer);
}

</script>

<template>
  <SplashScreen v-if="phase === 0 || !animationComplete" @animation-complete="onComplete()" @start="onStart()"></SplashScreen>
  <AnswerSubmission :acronym="acronym" v-if="phase === 1 && animationComplete" @submit="(answer) => onSubmit(answer)"></AnswerSubmission>
</template>

<style scoped>
@font-face {
  font-family: 'Orbitron';
  src: url("https://1219391019515121716.discordsays.com/assets/Orbitron.ttf");
}
SplashScreen{
  top: 0px;
}
</style>
