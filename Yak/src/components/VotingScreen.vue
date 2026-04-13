<template>
  <!-- guard rendering until the stories / parent have passed props -->
  <div v-if="props.submissionsByUserId" class="container">
    <div class="acronym-header">
      <StaticAcronym :letterArray="acronym.split('')" :colors="colorPallette" />
    </div>
    <div class="header">
      <p class="font header-text">
        {{ props.resultsMode ? "Results" : `Vote - ${props.timeRemaining}` }}
      </p>
      <p v-show="props.skipVoting" class="font header-subtext">
        voting skipped as there aren't enough players
      </p>
    </div>
    <div class="voting-container">
      <div
        v-for="votingCardInfo in votingSubmissions"
        class="voting-card"
        @click="vote(votingCardInfo.userId)"
        :id="votingCardInfo.userId"
        :key="votingCardInfo.userId"
        @mouseenter="setShouldAnimate(votingCardInfo.userId, true)"
        @mouseleave="setShouldAnimate(votingCardInfo.userId, false)"
        :style="{
          'border-left': `3px solid ${votingCardInfo.color}`,
        }"
      >
        <div class="card-top-row">
          <div class="submitter-info">
            <Avatar
              v-show="props.resultsMode"
              class="avatar"
              :avatarDecorationUrl="votingCardInfo.decoratorUrl"
              :avatarUrl="votingCardInfo.avatarUrl"
              :shouldAnimate="shouldAnimateByUserId.get(Number(votingCardInfo.userId))"
            ></Avatar>
            <p v-show="props.resultsMode" class="submitter-name font">
              {{ votingCardInfo.displayName }}
            </p>
          </div>
          <p class="time font">{{ votingCardInfo.submissionTime }} s</p>
        </div>
        <p class="submission-text" :id="'p.' + votingCardInfo.userId">
          {{ votingCardInfo.submissionText }}
        </p>
      </div>
    </div>
    <div v-show="props.resultsMode" class="controls">
      <button class="next-round-button font gradient" @click="nextRound()">Next Round</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserSubmission } from "../models";
import { useDiscordStore } from "../stores/discordStore";
import Avatar from "./Avatar.vue";
import StaticAcronym from "./StaticAcronym.vue";
import { Color } from "../models/color";
import { VotingCardInfo } from "../models/votingCardInfo";
import { computed, ref, watch } from "vue";
import { usePalletteStore } from "../stores/palletteStore";
const props = defineProps({
  submissionsByUserId: {
    type: Object,
    required: true,
  },
  resultsMode: {
    type: Boolean,
    required: true,
  },
  skipVoting: {
    type: Boolean,
    required: true,
  },
  timeRemaining: {
    type: Number,
    required: true,
  },
  acronym: {
    type: String,
    required: true,
  },
  colorPallette: {
    type: Array as () => Color[],
    required: true,
  },
});

const emits = defineEmits(["vote", "next-round"]);
const discord = useDiscordStore();
const colors = usePalletteStore();
// initialize selectedGradient early so Vue's CSS var binding can access it during setup
const selectedGradient = colors.acronymPallette.map((color) => color.main);

const votingSubmissions = computed(() => {
  const submissions = Object.keys(props.submissionsByUserId).map((userId) => {
    const userSubmission: UserSubmission = props.submissionsByUserId[userId];
    return new VotingCardInfo(
      userId,
      userSubmission.user_data.displayName,
      userSubmission.user_data.avatarUrl,
      userSubmission.user_data.decorationUrl,
      userSubmission.submission!,
      userSubmission.answer_time!,
    );
  });

  submissions.sort((current, next) => current.submissionTime - next.submissionTime);

  submissions.forEach((votingCardInfo: VotingCardInfo, index: number) => {
    if (colors.acronymPallette.length > 0) {
      votingCardInfo.color = colors.acronymPallette[index % colors.acronymPallette.length].main;
    } else {
      votingCardInfo.color = "#FFFFFF"; // Fallback color
    }
  });

  return submissions;
});

let shouldAnimateByUserId = ref<Map<number, boolean>>(new Map());
let hasVoted = ref<boolean>(props.resultsMode);

watch(
  () => props.resultsMode,
  (newValue) => {
    if (newValue) {
      Object.keys(props.submissionsByUserId).forEach((userId) => {
        document.getElementById(userId)?.classList.remove("gradient");
        document.getElementById(userId)?.classList.remove("selected-text");
      });
    }
  },
);

function vote(userId: string) {
  if (discord.auth.user.id != userId && !hasVoted.value && !props.resultsMode) {
    let selectedElement = document.getElementById(userId)!;
    let selectedElementChildParagraph = document.getElementById(`p.${userId}`)!;
    let userSubmission: UserSubmission = props.submissionsByUserId[userId];
    emits("vote", userId);
    hasVoted.value = true;
    selectedElement.classList.add("gradient");
    // set the CSS variable on the selected element so the pseudo-element can read it
    // format: a comma-separated list of color stops (e.g. "#ff0000, #00ff00, #0000ff")
    selectedElement.style.setProperty("--selectedGradient", selectedGradient.join(", "));
    selectedElementChildParagraph.textContent = userSubmission.submission;
    selectedElementChildParagraph.classList.add("selected-text");
  }
}

function setShouldAnimate(shouldAnimateKey: string, value: boolean) {
  shouldAnimateByUserId.value.set(Number(shouldAnimateKey), value);
}

function nextRound() {
  emits("next-round");
}
</script>

<style scoped>
.container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow-y: auto;
  padding: var(--space-xl);
}

.acronym-header {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-sm);
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
}

.header-text {
  margin-bottom: 0;
  font-size: var(--font-size-3xl);
}

.header-subtext {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
}

.font {
  font-family: var(--font-family);
  font-weight: 800;
}

.voting-container {
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: var(--space-md) 0;
}

.voting-card {
  width: 100%;
  max-width: var(--leaderboard-max-width);
  display: flex;
  flex-direction: column;
  font-family: var(--font-family);
  font-weight: 700;
  font-style: normal;
  background: var(--glass-bg-subtle);
  border: var(--border-thin) solid var(--glass-bg-medium);
  border-radius: var(--radius-sm);
  padding: var(--space-md) var(--space-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.voting-card:hover {
  background: var(--glass-bg-medium);
  transform: translateY(-2px);
}

.card-top-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: var(--space-2xl);
}

.submitter-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-md);
}

.avatar {
  flex-shrink: 0;
}

.submitter-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font-size: var(--font-size-sm);
  color: var(--text-subtle);
  margin: 0;
  flex-shrink: 0;
}

.submission-text {
  font-size: var(--font-size-lg);
  text-align: center;
  color: var(--text-primary);
  margin: var(--space-md) 0 var(--space-xs);
}

.selected-text {
  font-size: var(--font-size-base);
}

.controls {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-xl);
  flex-shrink: 0;
}

.next-round-button {
  font-size: var(--font-size-lg);
  background: var(--glass-bg-light);
  border: var(--border-default) solid var(--glass-bg-prominent);
  color: var(--text-primary);
  padding: 14px var(--space-5xl);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: var(--glass-backdrop);
}

.next-round-button:hover {
  background: var(--glass-bg-prominent);
  box-shadow: var(--shadow-glow-lg) var(--glass-bg-heavy);
  transform: translateY(-2px);
}

.gradient {
  --borderWidth: 3px;
  background: var(--bg-surface);
  position: relative;
  border-radius: var(--borderWidth);
}

.gradient:after {
  content: "";
  position: absolute;
  top: calc(-1 * var(--borderWidth));
  left: calc(-1 * var(--borderWidth));
  height: calc(100% + var(--borderWidth) * 2);
  width: calc(100% + var(--borderWidth) * 2);
  /* use a runtime CSS variable set on the selected element; fallback to a simple gradient */
  background: linear-gradient(60deg, var(--selectedGradient, #ff7f24, #ff2aff, #00ffde));
  border-radius: calc(2 * var(--borderWidth));
  z-index: -1;
  animation: animated-gradient 3s ease alternate infinite;
  background-size: 300% 300%;
}

@keyframes animated-gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style>
