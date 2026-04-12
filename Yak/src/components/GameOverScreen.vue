<template>
  <div class="game-over-container">
    <div class="game-over-header">
      <Acronym :letterArray="gameOverLetters" :colors="gameOverColors"></Acronym>
    </div>

    <div class="leaderboard" ref="leaderboardRef">
      <div
        v-for="(entry, index) in revealedEntries"
        :key="entry.userId"
        class="leaderboard-entry"
        :class="{
          'first-place': entry.rank === 1,
          'entry-reveal': true,
        }"
        :style="{ animationDelay: `${index * 0.6}s` }"
      >
        <div class="rank-badge" :class="`rank-${entry.rank}`">
          {{ entry.rank }}
        </div>

        <div class="player-info" :class="{ 'player-info-first': entry.rank === 1 }">
          <div class="avatar-wrapper" :class="{ 'avatar-wrapper-first': entry.rank === 1 }">
            <span v-if="entry.rank === 1" class="crown">&#9812;</span>
            <Avatar
              :avatarUrl="entry.avatarUrl"
              :avatarDecorationUrl="entry.decorationUrl"
              :shouldAnimate="true"
            />
          </div>
          <span class="player-name font" :class="{ 'name-first': entry.rank === 1 }">
            {{ entry.displayName }}
          </span>
        </div>

        <div class="score-display" :class="{ 'score-first': entry.rank === 1 }">
          <span class="score-value font">{{ entry.score }}</span>
          <span class="score-label">pts</span>
        </div>
      </div>
    </div>

    <div
      v-if="allRevealed"
      class="play-again-container entry-reveal"
      :style="{ animationDelay: `${revealedEntries.length * 0.6 + 0.3}s` }"
    >
      <div v-if="!selectedMode" class="mode-buttons">
        <button class="font mode-btn" @click="selectedMode = 'deadline'">Deadline</button>
        <button class="font mode-btn" @click="selectedMode = 'fixed_rounds'">Hard Stop</button>
      </div>
      <div v-if="selectedMode === 'fixed_rounds'" class="round-picker">
        <div class="round-options">
          <button
            v-for="count in [5, 10, 15, 20]"
            :key="count"
            class="font round-btn"
            :class="{ 'round-selected': selectedRounds === count }"
            @click="selectedRounds = count"
          >
            {{ count }}
          </button>
        </div>
        <button class="font play-again-btn" @click="startWithConfig()">Go</button>
      </div>
      <div v-if="selectedMode === 'deadline'">
        <button class="font play-again-btn" @click="startWithConfig()">Go</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { UserSubmission } from "../models";
import Avatar from "./Avatar.vue";
import Acronym from "./Acronym.vue";
import { Color } from "../models/color";

const props = defineProps({
  scores: {
    type: Object,
    required: true,
  },
  players: {
    type: Array as () => string[],
    required: true,
  },
  submissions: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits(["play-again"]);

const selectedMode = ref<string | null>(null);
const selectedRounds = ref<number>(10);

function startWithConfig() {
  emits("play-again", {
    mode: selectedMode.value,
    max_rounds: selectedMode.value === "fixed_rounds" ? selectedRounds.value : null,
  });
}

const gameOverLetters = ["G", "A", "M", "E", " ", "O", "V", "E", "R"];

const gameOverColors = [
  new Color("#FF0000", ["#CC0000", "#990000", "#FF3333", "#FF6666"]),
  new Color("#DD0000", ["#BB0000", "#880000", "#EE2222", "#FF4444"]),
  new Color("#BB0000", ["#990000", "#770000", "#CC1111", "#DD3333"]),
  new Color("#FF1111", ["#DD0000", "#AA0000", "#FF4444", "#FF5555"]),
  new Color("#FF0000", ["#CC0000", "#990000", "#FF3333", "#FF6666"]),
  new Color("#CC0000", ["#AA0000", "#880000", "#DD2222", "#EE3333"]),
  new Color("#EE0000", ["#CC0000", "#990000", "#FF2222", "#FF4444"]),
  new Color("#DD1111", ["#BB0000", "#990000", "#EE3333", "#FF4444"]),
  new Color("#FF0000", ["#DD0000", "#AA0000", "#FF3333", "#FF5555"]),
];

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string;
  decorationUrl: string;
  score: number;
  rank: number;
}

const leaderboardRef = ref<HTMLElement | null>(null);
const revealCount = ref(0);

const sortedEntries = computed((): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = props.players.map((playerId: string) => {
    const score = props.scores[playerId] || 0;
    const sub: UserSubmission | undefined = props.submissions[playerId];
    return {
      userId: playerId,
      displayName: sub?.user_data?.displayName || playerId,
      avatarUrl: sub?.user_data?.avatarUrl || "",
      decorationUrl: sub?.user_data?.decorationUrl || "",
      score,
      rank: 0,
    };
  });

  entries.sort((a, b) => b.score - a.score);
  entries.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  return entries;
});

// Reversed for bottom-to-top reveal
const entriesBottomUp = computed(() => [...sortedEntries.value].reverse());

const revealedEntries = computed(() => entriesBottomUp.value.slice(0, revealCount.value));

const allRevealed = ref(false);

onMounted(() => {
  const total = entriesBottomUp.value.length;
  let i = 0;

  const interval = window.setInterval(() => {
    i++;
    revealCount.value = i;
    if (i >= total) {
      clearInterval(interval);
      setTimeout(() => {
        allRevealed.value = true;
      }, 800);
    }
  }, 600);
});
</script>

<style scoped>
.game-over-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding: var(--space-xl);
}

.game-over-header {
  margin-bottom: var(--space-2xl);
  flex-shrink: 0;
}

.font {
  font-family: var(--font-family);
  font-weight: 800;
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  width: 100%;
  max-width: var(--leaderboard-max-width);
}

.leaderboard-entry {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-sm);
  background: var(--glass-bg-subtle);
  border: var(--border-thin) solid var(--glass-bg-medium);
  transition: all var(--transition-normal);
}

.leaderboard-entry:hover {
  background: var(--glass-bg-medium);
}

.first-place {
  padding: var(--space-xl) var(--space-2xl);
  background: var(--color-gold-bg-subtle);
  border: var(--border-default) solid var(--color-gold-border);
  box-shadow: var(--shadow-glow-xl) var(--color-gold-shadow);
}

.first-place:hover {
  background: var(--color-gold-bg-medium);
}

.entry-reveal {
  animation: slideUp var(--transition-slow) forwards;
  opacity: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rank-badge {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family);
  font-weight: 800;
  font-size: var(--font-size-sm);
  flex-shrink: 0;
  background: var(--glass-bg-medium);
  color: var(--text-subtle);
}

.rank-1 {
  background: var(--color-gold-bg-strong);
  color: var(--color-gold);
  box-shadow: var(--shadow-glow-sm) var(--color-gold-glow-medium);
}

.rank-2 {
  background: var(--color-silver-bg);
  color: var(--color-silver);
}

.rank-3 {
  background: var(--color-bronze-bg);
  color: var(--color-bronze);
}

.player-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
  min-width: 0;
}

.player-info-first {
  gap: var(--space-lg);
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-wrapper-first {
  transform: scale(1.3);
  margin: var(--space-2xs) var(--space-xs) var(--space-2xs) var(--space-2xs);
}

.crown {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  color: var(--color-gold);
  filter: drop-shadow(0 0 4px var(--color-gold-glow-strong));
  z-index: 1;
  animation: crownBob 2s ease-in-out infinite;
}

@keyframes crownBob {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-3px);
  }
}

.player-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-first {
  font-size: var(--font-size-md);
  color: var(--color-gold);
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: var(--space-2xs);
  flex-shrink: 0;
}

.score-value {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.score-first .score-value {
  font-size: var(--font-size-2xl);
  color: var(--color-gold);
}

.score-label {
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  color: var(--text-ghost);
  text-transform: uppercase;
}

.play-again-container {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-xl);
  flex-shrink: 0;
}

.play-again-btn {
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

.play-again-btn:hover {
  background: var(--glass-bg-prominent);
  box-shadow: var(--shadow-glow-lg) var(--glass-bg-heavy);
  transform: translateY(-2px);
}

.mode-buttons {
  display: flex;
  gap: var(--space-lg);
  justify-content: center;
}

.mode-btn {
  font-size: var(--font-size-base);
  background: var(--glass-bg-light);
  border: var(--border-default) solid var(--glass-bg-prominent);
  color: var(--text-primary);
  padding: var(--space-md) 28px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.mode-btn:hover {
  background: var(--glass-bg-prominent);
  box-shadow: var(--shadow-glow-md) var(--glass-bg-heavy);
}

.round-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.round-options {
  display: flex;
  gap: var(--space-sm);
}

.round-btn {
  font-size: var(--font-size-sm);
  background: var(--glass-bg-light);
  border: var(--border-default) solid var(--glass-bg-prominent);
  color: var(--text-primary);
  width: 52px;
  height: 52px;
  border-radius: var(--radius-circle);
  cursor: pointer;
  transition: all 0.25s ease;
}

.round-btn:hover {
  background: var(--color-primary-glow-subtle);
  border-color: var(--color-primary);
}

.round-selected {
  background: var(--color-primary-glow-medium);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow-sm) var(--color-primary-glow-intense);
}

.waiting-text {
  font-size: var(--font-size-sm);
  color: var(--text-faint);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
