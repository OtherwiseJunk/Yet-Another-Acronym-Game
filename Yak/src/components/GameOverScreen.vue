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
      v-if="allRevealed && props.isHost"
      class="play-again-container entry-reveal"
      :style="{ animationDelay: `${revealedEntries.length * 0.6 + 0.3}s` }"
    >
      <div v-if="!selectedMode" class="mode-buttons">
        <button class="font mode-btn" @click="selectedMode = 'deadline'">Deadline</button>
        <button class="font mode-btn" @click="selectedMode = 'fixed_rounds'">Fixed Rounds</button>
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

    <div
      v-if="allRevealed && !props.isHost"
      class="play-again-container entry-reveal"
      :style="{ animationDelay: `${revealedEntries.length * 0.6 + 0.3}s` }"
    >
      <p class="font waiting-text">Waiting for host...</p>
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
  isHost: {
    type: Boolean,
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
  padding: 20px;
}

.game-over-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.font {
  font-family: "Orbitron";
  font-weight: 800;
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 550px;
}

.leaderboard-entry {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.leaderboard-entry:hover {
  background: rgba(255, 255, 255, 0.08);
}

.first-place {
  padding: 20px 24px;
  background: rgba(255, 215, 0, 0.06);
  border: 2px solid rgba(255, 215, 0, 0.25);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.08);
}

.first-place:hover {
  background: rgba(255, 215, 0, 0.1);
}

.entry-reveal {
  animation: slideUp 0.5s ease-out forwards;
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Orbitron";
  font-weight: 800;
  font-size: 0.9em;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

.rank-1 {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
}

.rank-2 {
  background: rgba(192, 192, 192, 0.15);
  color: #c0c0c0;
}

.rank-3 {
  background: rgba(205, 127, 50, 0.15);
  color: #cd7f32;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.player-info-first {
  gap: 16px;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-wrapper-first {
  transform: scale(1.3);
  margin: 4px 8px 4px 4px;
}

.crown {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  color: #ffd700;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
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
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-first {
  font-size: 1.1em;
  color: #ffd700;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.score-value {
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.9);
}

.score-first .score-value {
  font-size: 1.6em;
  color: #ffd700;
}

.score-label {
  font-family: "Orbitron";
  font-size: 0.65em;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
}

.play-again-container {
  margin-top: 24px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.play-again-btn {
  font-size: 1.2em;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 14px 48px;
  border-radius: 35px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: saturate(150%) blur(10px);
}

.play-again-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.mode-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.mode-btn {
  font-size: 1em;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 12px 28px;
  border-radius: 35px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

.round-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.round-options {
  display: flex;
  gap: 10px;
}

.round-btn {
  font-size: 0.9em;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: white;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
}

.round-btn:hover {
  background: rgba(68, 170, 255, 0.15);
  border-color: #44aaff;
}

.round-selected {
  background: rgba(68, 170, 255, 0.25);
  border-color: #44aaff;
  box-shadow: 0 0 12px rgba(68, 170, 255, 0.4);
}

.waiting-text {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.4);
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
