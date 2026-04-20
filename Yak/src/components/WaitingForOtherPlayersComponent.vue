<template>
  <div class="waiting-wrapper">
    <h2 class="font">Submitted! Waiting for other players...</h2>
    <h4 class="smaller-font submission-echo">{{ props.submissionText }}</h4>
    <div v-if="showProgress" class="status-row">
      <span class="status-chip font">
        {{ props.submittedCount }}/{{ props.totalPlayers }} submitted
      </span>
      <span v-if="showCountdown" class="status-chip font time-chip">
        {{ props.timeRemaining }}s
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  submissionText: {
    type: String,
    default: "",
  },
  submittedCount: {
    type: Number,
    default: 0,
  },
  totalPlayers: {
    type: Number,
    default: 0,
  },
  timeRemaining: {
    type: Number,
    default: 0,
  },
});

const showProgress = computed(() => props.totalPlayers > 0);
const showCountdown = computed(() => props.timeRemaining > 0);
</script>

<style scoped>
.waiting-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.font {
  font-size: var(--font-size-3xl);
  font-family: var(--font-family);
  font-weight: 800;
  font-style: normal;
}

.smaller-font {
  font-size: 1.5em;
  font-family: var(--font-family);
  font-weight: 800;
  font-style: normal;
}

.submission-echo {
  color: var(--text-secondary);
  margin: 0;
}

.status-row {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-sm);
}

.status-chip {
  font-size: var(--font-size-lg);
  padding: var(--space-xs) var(--space-lg);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-subtle);
  border: var(--border-thin) solid var(--glass-bg-medium);
  color: var(--text-primary);
}

.time-chip {
  color: var(--text-subtle);
}
</style>
