<script setup lang="ts">
import { ref, onMounted } from "vue";
import SplashScreen from "./components/SplashScreen.vue";
import AnswerSubmission from "./components/AnswerSubmissionScreen.vue";
import VotingScreen from "./components/VotingScreen.vue";
import GameOverScreen from "./components/GameOverScreen.vue";
import FloatingActions from "./components/FloatingActions.vue";
import { useGameStore } from "./stores/gameStore";
import { useDiscordStore } from "./stores/discordStore";
import { usePalletteStore } from "./stores/palletteStore";
import { UserSubmission } from "./models/userSubmission";
import { UserData } from "./models/userData";
import type { RoundScoringEntry } from "./models/gameState";
import type { StartGameData } from "./models/CableCommands/startGameCommand";

const discord = useDiscordStore();
const cable = useGameStore();
const colors = usePalletteStore();

onMounted(async () => {
  await discord.setup();
  await cable.setup(
    discord.auth!.access_token,
    discord.instanceId,
    discord.currentUserData,
    discord.auth!.user.id,
  );
});
const phase = ref(0);
const animationComplete = ref(false);
const acronym = ref("");
const playerCount = ref(1);
const roundTimeRemaining = ref(0);
const scores = ref<Record<string, number>>({});
const players = ref<string[]>([]);
const votes = ref<Record<string, string>>({});
const lastRoundScoring = ref<Record<string, RoundScoringEntry>>({});
const lastRoundWinnerId = ref<string | null>(null);
const cumulativeTimes = ref<Record<string, number>>({});
const overallFastestPlayerIds = ref<string[]>([]);

let submissions: Record<string, UserSubmission> = {};
const playerDataById = ref<Record<string, UserData>>({});

cable.$subscribe((_, state) => {
  phase.value = state.gameState.game_phase;
  acronym.value = state.gameState.current_acronym;
  colors.setAcronymPallette(acronym.value);
  submissions = state.gameState.submissions;
  playerCount.value = state.gameState.players.length;
  roundTimeRemaining.value = state.gameState.round_time_remaining;
  scores.value = state.gameState.scores || {};
  players.value = state.gameState.players || [];
  votes.value = state.gameState.votes || {};
  lastRoundScoring.value = state.gameState.last_round_scoring || {};
  lastRoundWinnerId.value = state.gameState.last_round_winner_id || null;
  cumulativeTimes.value = state.gameState.cumulative_times || {};
  overallFastestPlayerIds.value = state.gameState.overall_fastest_player_ids || [];

  // Accumulate player data from submissions so GameOverScreen
  // can display names/avatars even if last round had no submissions.
  for (const [userId, sub] of Object.entries(submissions)) {
    if (sub?.user_data?.displayName) {
      playerDataById.value[userId] = sub.user_data;
    }
  }
});

function onComplete() {
  animationComplete.value = true;
}
function onStart(config: StartGameData) {
  cable.startGame(config);
}
function onSubmit(answer: string) {
  cable.submitAnswer(answer);
}
function onVote(submissionUserId: string) {
  cable.submitVote(submissionUserId);
}
function onNextRound() {
  cable.startGame();
}
function onPlayAgain(config: StartGameData) {
  cable.startGame(config);
}
</script>

<template>
  <div class="yaag-root">
    <SplashScreen
      v-if="(phase === 0 || !animationComplete) && phase !== 4"
      @animation-complete="onComplete()"
      @start="(config) => onStart(config)"
    >
    </SplashScreen>
    <AnswerSubmission
      :timeRemaining="roundTimeRemaining"
      :acronym="acronym"
      :colorPallette="colors.acronymPallette"
      :submissions="submissions"
      :players="players"
      v-if="phase === 1 && animationComplete"
      @submit="(answer) => onSubmit(answer)"
    >
    </AnswerSubmission>
    <VotingScreen
      :submissionsByUserId="submissions"
      :resultsMode="phase === 3"
      :skipVoting="playerCount <= 2"
      :timeRemaining="roundTimeRemaining"
      :acronym="acronym"
      :colorPallette="colors.acronymPallette"
      :lastRoundScoring="lastRoundScoring"
      :lastRoundWinnerId="lastRoundWinnerId"
      :votes="votes"
      v-if="(phase === 2 || phase === 3) && animationComplete"
      @vote="(submissionUserId) => onVote(submissionUserId)"
      @next-round="onNextRound()"
    >
    </VotingScreen>
    <GameOverScreen
      v-if="phase === 4"
      :scores="scores"
      :players="players"
      :submissions="submissions"
      :playerData="playerDataById"
      :cumulativeTimes="cumulativeTimes"
      :overallFastestPlayerIds="overallFastestPlayerIds"
      @play-again="(config) => onPlayAgain(config)"
    >
    </GameOverScreen>
    <FloatingActions />
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
  overflow: hidden;
}

@font-face {
  font-family: "Orbitron";
  src: url("https://1219391019515121716.discordsays.com/media/Orbitron.ttf");
}
</style>
