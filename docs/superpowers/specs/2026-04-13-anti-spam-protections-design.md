# Anti-Spam Structural Protections

## Problem

In deadline mode, the game ends when a round completes with zero submissions. A player can survive indefinitely by submitting low-effort nonsense that technically passes validation (e.g., "A B C" for acronym ABC). Current validation only checks that each word starts with the correct letter — single-character words are accepted, and there's no pressure beyond natural acronym difficulty scaling.

This lets a spammer outlast legitimate players who burn out trying to be creative.

## Solution

Two independent structural mechanics that raise the minimum effort floor without introducing any player-driven moderation (which carries abuse risk in small lobbies).

## Mechanic 1: Minimum Word Length with Short-Word Allowlist

### Rule

Every word in a submission must be 3 or more characters, unless it appears in a curated allowlist of valid 1-2 letter English words.

### Allowlist

**1-letter words (2):** a, i

**2-letter words (53):** ah, am, an, as, at, aw, ax, ba, be, by, do, eh, em, ew, gi, go, ha, he, hi, hm, ho, id, if, in, is, it, ki, lo, ma, me, my, no, of, oh, oi, ok, on, or, ow, ox, pa, pi, qi, sh, so, ta, to, uh, um, up, us, we, ya, ye

Stored as a `Set<string>`, checked case-insensitively.

### Client-Side Behavior

- The existing `submittable` computed in `AnswerSubmissionScreen.vue` expands to per-word validation status.
- Words that fail (fewer than 3 characters AND not in the allowlist) are highlighted with a red underline or red text color as the user types.
- The submit button remains disabled until all words pass (same UX as today, just stricter).
- No error toast or modal — inline highlighting is the feedback.

### Server-Side Behavior

- `handle_player_submission` in `game_state.rb` validates the same rule before accepting the submission.
- Rejected submissions return an error response that the frontend surfaces with the same inline word highlighting treatment as client-side validation. The player sees which words are invalid and can correct them.

### File Locations

- **Frontend:** `Yak/src/constants/shortWords.ts` — exported `Set<string>`.
- **Backend:** `YakBak/app/models/short_words.rb` — frozen `Set` constant.
- Two copies of the same data. The list is small enough (55 entries) that manual sync is trivial.

### Examples

| Acronym | Submission | Result |
|---------|-----------|--------|
| HAF | Hug a Frog | Pass ("a" is in allowlist) |
| ABC | A B C | Fail ("B" and "C" are not in allowlist) |
| ABC | Apes Buy Cars | Pass (all words 3+ characters) |
| THE | To He E | Fail ("E" not in allowlist) |
| THE | To He Eat | Pass ("To" and "He" in allowlist, "Eat" is 3+ chars) |

## Mechanic 2: Deadline Timer Decay

### Rule

In deadline mode, once a submission round completes where fewer than all players submitted, subsequent rounds have progressively shorter submission timers. This applies to all players equally.

### Decay Schedule

| Decay Level | Timer | Trigger |
|-------------|-------|---------|
| 0 (default) | 60s | — |
| 1 | 45s | First incomplete round |
| 2 | 30s | Second incomplete round |
| 3 | 20s | Third incomplete round |
| 4 | 15s | Fourth+ incomplete round |

The floor is 15 seconds. Decay never resets within a game.

### Key Behaviors

- Decay only activates in deadline mode. Hard stop mode always uses 60s.
- Decay is triggered when `submissions.count < players.count` at the end of a submission phase.
- Applies to ALL players equally — no per-player timers.
- The decayed timer value is broadcast to clients via the existing `round_time_remaining` field. No frontend changes needed for the countdown display.
- A brief message is shown when decay first kicks in (e.g., "Not everyone submitted — time is tightening!") so the pressure feels intentional, not like a bug.

### Implementation

- `GameState` gains a `@deadline_decay_level` integer field (0-4), persisted in Redis alongside other game state.
- `GameState` gains a `submission_timer` method that returns the timer duration for the current decay level.
- `GameChannel#broadcast_round_countdown` uses `submission_timer` instead of the hardcoded 60-second value.
- The decay level increments in `next_phase` (or equivalent) when transitioning out of SUBMITTING and `submissions.count < players.count`.

## What This Does NOT Do

- No dictionary enforcement for real words (slang/creativity is fine).
- No player-driven moderation (no kick, no report, no downvote).
- No per-player penalties (everyone faces the same timer).
- No cross-round submission tracking or duplicate detection.
- No content filtering or profanity checks.

## Why This Is Enough

The combination creates layered pressure:

1. **Word length validation** closes the trivial-spam exploit (can't type one letter per word).
2. **Timer decay** ensures deadline mode converges to an ending — even a spammer typing fast real-ish words faces 15-second rounds with 9-12 letter acronyms.
3. **Voting** remains the social quality filter — genuinely bad answers get zero votes, so spammers never win even if they survive.
4. **Acronym length scaling** (already implemented) makes later rounds inherently harder.

No single mechanic solves the problem alone, but together they make low-effort survival significantly harder without ever judging content quality or giving players weapons to abuse.
