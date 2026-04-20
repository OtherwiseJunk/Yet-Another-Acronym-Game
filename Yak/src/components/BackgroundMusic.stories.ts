import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import BackgroundMusic, { DEFAULT_BGM_PATTERN } from "./BackgroundMusic.vue";

const meta: Meta<typeof BackgroundMusic> = {
  title: "Audio/BackgroundMusic",
  component: BackgroundMusic,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div style="padding: 2rem; background: #1a1a2e; min-height: 200px; display: flex; align-items: center; justify-content: center;"><story/></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LivePatternEditor: Story = {
  render: () => ({
    components: { BackgroundMusic },
    setup() {
      const draft = ref(DEFAULT_BGM_PATTERN);
      const applied = ref(DEFAULT_BGM_PATTERN);
      const apply = () => {
        applied.value = draft.value;
      };
      const reset = () => {
        draft.value = DEFAULT_BGM_PATTERN;
        applied.value = DEFAULT_BGM_PATTERN;
      };
      return { draft, applied, apply, reset };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;width:100%;max-width:720px;color:#fff;font-family:monospace;">
        <label style="font-size:0.85rem;opacity:0.8;">Strudel pattern</label>
        <textarea
          v-model="draft"
          spellcheck="false"
          rows="16"
          style="width:100%;padding:0.75rem;background:#0e0e1a;color:#e6e6f0;border:1px solid rgba(255,255,255,0.15);border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.85rem;line-height:1.5;resize:vertical;"
        ></textarea>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
          <button
            @click="apply"
            style="padding:0.5rem 1rem;background:rgba(120,180,255,0.2);color:#fff;border:1px solid rgba(120,180,255,0.5);border-radius:6px;cursor:pointer;"
          >Apply Pattern</button>
          <button
            @click="reset"
            style="padding:0.5rem 1rem;background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;"
          >Reset to Default</button>
          <BackgroundMusic :pattern="applied" />
        </div>
        <p style="font-size:0.75rem;opacity:0.6;margin:0;">
          Edit the pattern, then hit <strong>Apply Pattern</strong>. If music is already playing, it hot-reloads on apply.
        </p>
      </div>
    `,
  }),
};
