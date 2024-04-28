<script setup lang="ts">
import { ref } from 'vue';
import SplashScreen from './components/SplashScreen.vue'
import AnswerSubmission from './components/AnswerSubmissionScreen.vue'
import VotingScreen from './components/VotingScreen.vue'
import { useGameStore } from './stores/gameStore';
import { UserSubmission } from './models/userSubmission';

const cable = useGameStore();
const phase = ref(0)
const animationComplete = ref(false);
const acronym = ref("");


let submissions: Map<number, UserSubmission>;
cable.$subscribe((_, state) => {
  phase.value = state.gameState.game_phase
  acronym.value = state.gameState.current_acronym
  submissions = state.gameState.submissions
})

function onComplete() {
  animationComplete.value = true;
}
function onStart() {
  cable.startGame();
}
function onSubmit(answer: string) {
  cable.submitAnswer(answer);
}

</script>

<template>
  <div class="yaag-root">
    <SplashScreen  v-if="phase === 0 || !animationComplete" @animation-complete="onComplete()" @start="onStart()">
    </SplashScreen>
    <AnswerSubmission :acronym="acronym" v-if="phase === 1 && animationComplete" @submit="(answer) => onSubmit(answer)">
    </AnswerSubmission>
    <VotingScreen :submissionsByUserId="submissions" :resultsMode="phase === 3" v-if="(phase === 2 || phase === 3) && animationComplete"></VotingScreen>
  </div>
</template>

<style scoped>
.yaag-root{
  max-width: 90%;
  max-height: 90%;
  
  
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
}
@font-face {
  font-family: 'Orbitron';
  src: url("https://1219391019515121716.discordsays.com/assets/Orbitron.ttf");
}
</style>