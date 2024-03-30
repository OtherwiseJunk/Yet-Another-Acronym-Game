<template>
    <p class="typingEffect font" :class="{ showAnimatedCursor: showAnimatedCursor}">{{ text }}</p>
</template>

<style scoped>

.font {
  font-size: 2em;
  font-family: 'Honk';
  font-weight: 800;
  font-style: normal;
}
.showAnimatedCursor {
    border-right: .15em solid orange; /* The typwriter cursor */
    animation:
        blink-caret .75s step-end 3.5s,
        typing 3.5s steps(40, end)
}

.typingEffect {
  overflow: hidden; /* Ensures the content is not revealed until the animation */
  white-space: nowrap; /* Keeps the content on a single line */
  margin: 0 auto; /* Gives that scrolling effect as the typing happens */
  letter-spacing: .15em; /* Adjust as needed */
  animation: 
    typing 3.5s steps(40, end),
}

/* The typing effect */
@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

/* The typewriter cursor effect */
@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: orange; }
}
</style>

<script setup lang="ts">
import { ref } from '@vue/runtime-dom';

    defineProps<{
        text: string
    }>();
    let showAnimatedCursor = ref(true);

    setTimeout(() =>{
        showAnimatedCursor.value = false;
    }, 3200)
</script>
