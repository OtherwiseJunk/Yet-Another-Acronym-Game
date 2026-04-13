<template>
  <div class="floating-actions">
    <!-- Settings cog -->
    <div class="action-wrapper" ref="settingsRef">
      <button class="action-btn" @click="toggleSettings" :class="{ active: showSettings }">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
      </button>

      <!-- Settings popover -->
      <div v-if="showSettings" class="popover">
        <div class="popover-row">
          <span class="popover-label">Theme</span>
          <button class="theme-toggle" @click="toggleTheme">
            {{ isDark ? "Dark" : "Light" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Help -->
    <button class="action-btn" @click="showHelp = true">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </button>
  </div>

  <!-- Help modal backdrop -->
  <Teleport to="body">
    <div v-if="showHelp" class="modal-backdrop" @click="showHelp = false">
      <div class="modal" @click.stop>
        <button class="modal-close" @click="showHelp = false">&times;</button>
        <h2 class="modal-title">How to Play</h2>
        <p class="modal-body">
          Each round, players get a random acronym. Type a phrase where each word starts with the
          matching letter. After submissions close, vote for your favorite. Votes = points. Acronyms
          get longer as rounds progress.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const showSettings = ref(false);
const showHelp = ref(false);
const settingsRef = ref<HTMLElement | null>(null);

const isDark = ref(true);

function toggleSettings() {
  showSettings.value = !showSettings.value;
}

function toggleTheme() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("yaag-theme");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("yaag-theme", "light");
  }
}

function onClickOutside(e: MouseEvent) {
  if (showSettings.value && settingsRef.value && !settingsRef.value.contains(e.target as Node)) {
    showSettings.value = false;
  }
}

onMounted(() => {
  const saved = localStorage.getItem("yaag-theme");
  if (saved === "light") {
    isDark.value = false;
    document.documentElement.setAttribute("data-theme", "light");
  }
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
.floating-actions {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  z-index: 100;
  opacity: 0.4;
  transition: opacity var(--transition-normal);
}

.floating-actions:hover {
  opacity: 1;
}

.action-wrapper {
  position: relative;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-circle);
  border: var(--border-thin) solid var(--glass-bg-prominent);
  background: var(--glass-bg-solid);
  backdrop-filter: var(--glass-backdrop);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all var(--transition-normal);
}

.action-btn:hover,
.action-btn.active {
  color: var(--text-primary);
  background: var(--glass-bg-heavy);
  border-color: var(--glass-bg-heavy);
}

/* ── Settings popover ──────────────────────────── */
.popover {
  position: absolute;
  bottom: calc(100% + var(--space-xs));
  right: 0;
  background: var(--glass-bg-solid);
  backdrop-filter: var(--glass-backdrop);
  border: var(--border-thin) solid var(--glass-bg-prominent);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  min-width: 140px;
  z-index: 101;
}

.popover-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.popover-label {
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-secondary);
}

.theme-toggle {
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  font-weight: 700;
  background: var(--glass-bg-medium);
  border: var(--border-thin) solid var(--glass-bg-prominent);
  border-radius: var(--radius-pill);
  color: var(--text-primary);
  padding: var(--space-2xs) var(--space-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.theme-toggle:hover {
  background: var(--glass-bg-prominent);
}

/* ── Help modal ────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  position: relative;
  background: var(--glass-bg-solid);
  backdrop-filter: var(--glass-backdrop);
  border: var(--border-thin) solid var(--glass-bg-prominent);
  border-radius: var(--radius-sm);
  padding: var(--space-2xl) var(--space-3xl);
  max-width: 420px;
  width: 90%;
}

.modal-close {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-md);
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: var(--font-size-3xl);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color var(--transition-fast);
}

.modal-close:hover {
  color: var(--text-primary);
}

.modal-title {
  font-family: var(--font-family);
  font-weight: 800;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin: 0 0 var(--space-lg) 0;
}

.modal-body {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}
</style>
