<template>
  <div class="bgm-controls">
    <button class="bgm-button font" @click="toggle">
      {{ playing ? "Stop Music" : "Play Music" }}
    </button>
  </div>
</template>

<style scoped>
.bgm-controls {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.bgm-button {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  font-size: var(--font-size-sm);
  backdrop-filter: blur(8px);
  transition: background 0.2s;
}

.bgm-button:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>

<script lang="ts">
export const DEFAULT_BGM_PATTERN = `
setCps(70/60/4);

stack(
  note("<[c3 g2] [f3 c2]*2 [eb3 g3] [bb2 c3]>")
  .sound("sawtooth")
  .lpf(perlin.range(400, 2000).seg(8))
  .lpq(10)
  .delay(0.5).delaytime(0.25)
  .room(0.8).size(0.9)
  .gain(0.6),

  s("white!8")
  .decay(0.05)
  .gain(perlin.range(0.05, 0.15))
  .lpf(3000)
)
`;
</script>

<script setup lang="ts">
import { ref, onUnmounted, watch } from "vue";

const props = withDefaults(defineProps<{ pattern?: string }>(), {
  pattern: DEFAULT_BGM_PATTERN,
});

const playing = ref(false);
let initialized = false;

async function startMusic() {
  const { initStrudel, evaluate } = await import("@strudel/web");
  if (!initialized) {
    await initStrudel();
    initialized = true;
  }
  await evaluate(props.pattern);
  playing.value = true;
}

watch(
  () => props.pattern,
  async (next) => {
    if (!playing.value) return;
    const { evaluate } = await import("@strudel/web");
    await evaluate(next);
  },
);

async function stopMusic() {
  const { hush } = await import("@strudel/web");
  hush();
  playing.value = false;
}

function toggle() {
  if (playing.value) {
    stopMusic();
  } else {
    startMusic();
  }
}

onUnmounted(() => {
  if (playing.value) {
    stopMusic();
  }
});
</script>
