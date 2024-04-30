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
const playerCount = ref(1);
const roundTimeRemaining = ref(0);

let submissions: Map<number, UserSubmission>;
cable.$subscribe((_, state) => {
  phase.value = state.gameState.game_phase
  acronym.value = state.gameState.current_acronym
  submissions = state.gameState.submissions
  playerCount.value = state.gameState.players.length
  roundTimeRemaining.value = state.gameState.round_time_remaining;
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
function onVote(submissionUserId: string) {
  console.log('got an OnVote trigger!');
  console.log(submissionUserId);
}
function onNextRound(){
  cable.startGame();
}

</script>

<template>
  <div class="yaag-root">
    <SplashScreen v-if="phase === 0 || !animationComplete" @animation-complete="onComplete()" @start="onStart()">
    </SplashScreen>
    <AnswerSubmission :timeRemaining="roundTimeRemaining" :acronym="acronym" v-if="phase === 1 && animationComplete" @submit="(answer) => onSubmit(answer)">
    </AnswerSubmission>
    <VotingScreen 
      :submissionsByUserId="submissions" 
      :resultsMode="phase === 3"
      :skipVoting="playerCount <= 2"
      v-if="(phase === 2 || phase === 3) && animationComplete" 
      @vote="(submissionUserId) => onVote(submissionUserId)"
      @next-round="onNextRound()">
    </VotingScreen>
  </div>
</template>

<style scoped>
.yaag-root {
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0px;
  top: 0px;
  right: 0px;
  bottom: 0px;
}

@font-face {
  font-family: 'Orbitron';
  src: url("https://1219391019515121716.discordsays.com/media/Orbitron.ttf");
}
</style>