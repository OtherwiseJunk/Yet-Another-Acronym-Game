<template>
  <p class="font" :class="cursorClass">{{ displayedText }}</p>
</template>

<style scoped>
.font {
  font-size: var(--font-size-3xl);
  font-family: var(--font-family);
  font-weight: 800;
  font-style: normal;
  display: inline-block;
  letter-spacing: 0.15em;
  padding-right: 0.1em;
}

.typing-cursor {
  border-right: 0.15em solid var(--color-cursor);
  animation: blink-caret 0.75s step-end infinite;
}

.blinking-out-cursor {
  border-right: 0.15em solid var(--color-cursor);
  animation: blink-out 0.75s steps(2, end) 2 forwards;
}

@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: var(--color-cursor);
  }
}

@keyframes blink-out {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: var(--color-cursor);
  }
}
</style>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  text: string;
}>();

const displayedText = ref("");
const cursorClass = ref("typing-cursor");
let typingIntervalId: number | undefined = undefined;

const typingSpeedMs = 80;

const startOrRestartAnimation = () => {
  // Clear any ongoing animations
  if (typingIntervalId) clearInterval(typingIntervalId);

  displayedText.value = "";
  cursorClass.value = "typing-cursor";
  let charIndex = 0;

  if (!props.text || props.text.length === 0) {
    // If text is empty, just show a blinking cursor
    cursorClass.value = "typing-cursor";
    return;
  }

  typingIntervalId = window.setInterval(() => {
    if (charIndex < props.text.length) {
      displayedText.value += props.text[charIndex];
      charIndex++;
    } else {
      // Typing finished
      clearInterval(typingIntervalId);

      // Switch to the 3-blink-then-disappear animation
      cursorClass.value = "blinking-out-cursor";
    }
  }, typingSpeedMs);
};

watch(() => props.text, startOrRestartAnimation, { immediate: true });
</script>
