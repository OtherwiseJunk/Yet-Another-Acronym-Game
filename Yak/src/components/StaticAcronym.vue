<template>
  <div class="static-acronym">
    <span
      v-for="(letter, index) in letterArray"
      :key="index"
      class="letter"
      :style="{ color: colors?.length ? colors[index % colors.length].main : '#fff' }"
      >{{ letter }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { Color } from "../models/color";

withDefaults(
  defineProps<{
    letterArray: string[];
    colors?: Color[];
  }>(),
  {
    colors: () => [],
  },
);
</script>

<style scoped>
.static-acronym {
  display: flex;
  justify-content: center;
  gap: var(--space-xs);
  user-select: none;
}

.letter {
  font-family: var(--font-family);
  font-size: var(--font-size-display);
  font-weight: 800;
  text-transform: lowercase;
}
</style>
