<script setup lang="ts">
import { watch, ref } from "vue";

const props = defineProps({
  avatarDecorationUrl: String,
  avatarUrl: String,
  shouldAnimate: Boolean,
  size: {
    type: Number,
    default: 40,
  },
});

const decorationUrl = ref<string | undefined>();
const displayAvatarUrl = ref<string | undefined>();

function setImageSources(shouldAnimate: boolean) {
  if (props.avatarDecorationUrl) {
    decorationUrl.value = shouldAnimate
      ? props.avatarDecorationUrl
      : `${props.avatarDecorationUrl}&passthrough=false`;
  } else {
    decorationUrl.value = undefined;
  }

  if (props.avatarUrl) {
    // Use the non-animated version if shouldAnimate is false
    displayAvatarUrl.value = shouldAnimate
      ? props.avatarUrl
      : props.avatarUrl.replace(".gif", ".webp");
  } else {
    displayAvatarUrl.value = undefined;
  }
}

// Watch the prop directly for changes, and run immediately to set the initial state.
watch(
  () => props.shouldAnimate,
  (newValue) => {
    setImageSources(newValue);
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="avatar-container"
    :style="{
      '--icon-size': `${props.size}px`,
      '--decoration-size': `${props.size * 1.2}px`,
      '--container-size': `${props.size * 1.2}px`,
    }"
  >
    <img v-if="decorationUrl" class="avatar-decoration" :src="decorationUrl" />
    <img
      class="avatar-icon"
      :src="displayAvatarUrl ?? 'https://1219391019515121716.discordsays.com/media/yak.png'"
    />
  </div>
</template>

<style scoped>
.avatar-container {
  position: relative;
  width: var(--container-size);
  height: var(--container-size);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-decoration {
  position: absolute;
  z-index: 1;
  height: var(--decoration-size);
  width: var(--decoration-size);
  object-fit: contain;
  border-radius: 50%;
}

.avatar-icon {
  height: var(--icon-size);
  width: var(--icon-size);
  object-fit: cover;
  border-radius: 50%;
}
</style>
