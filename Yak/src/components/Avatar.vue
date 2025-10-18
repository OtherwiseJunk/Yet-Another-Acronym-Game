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
  { immediate: true }
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
    <img
      v-if="decorationUrl"
      class="avatar-decoration avatar"
      :src="decorationUrl"
    />
    <img
      class="avatar-icon avatar"
      :src="
        displayAvatarUrl ??
        'https://1219391019515121716.discordsays.com/media/yak.png'
      "
    />
  </div>
</template>

<style scoped>
.avatar-decoration {
  z-index: 1;
  height: var(--decoration-size);
}

.avatar-icon {
  height: var(--icon-size);
  z-index: -1;
}

.avatar {
  position: absolute;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.avatar-container {
  position: relative;
  margin-right: 25px;
  width: var(--container-size);
  height: var(--container-size);
}
</style>
