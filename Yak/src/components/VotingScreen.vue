<template>
    <!-- guard rendering until the stories / parent have passed props -->
    <div v-if="submissionsByUserId" class="container">
        <div class="header">
            <p class="font header-text">{{ resultsMode ? "Results" : `Vote - ${timeRemaining}` }}</p>
            <p v-show="skipVoting" class="font header-subtext">voting skipped as there aren't enough players</p>
        </div>
        <div class="voting-container">
            <div v-for="(votingCardInfo) in votingSubmissions" class="voting-card" @click="vote(votingCardInfo.userId)"
                :id="votingCardInfo.userId" :key="votingCardInfo.userId"
                @mouseenter="setShouldAnimate(votingCardInfo.userId, true)"
                @mouseleave="setShouldAnimate(votingCardInfo.userId, false)" :style="{
                'background': `${colors.hexToRGB(votingCardInfo.color, 0.08)}`,
                'box-shadow': `1px 1px 6px ${votingCardInfo.color}`
            }">
                <div class="submitter-info">
                    <Avatar v-show="resultsMode" class="avatar" :avatarDecorationUrl="votingCardInfo.decoratorUrl"
                        :avatarUrl="votingCardInfo.avatarUrl"
                        :shouldAnimate="shouldAnimateByUserId.get(Number(votingCardInfo.userId))"></Avatar>
                    <p v-show="resultsMode" class="submitter-info-text">{{ votingCardInfo.displayName }}</p>
                    <p class="time submitter-info-text">{{ votingCardInfo.submissionTime }} s</p>
                </div>
                <p class="submission-text" :id='"p." + votingCardInfo.userId'> {{ votingCardInfo.submissionText }}
                    <!--<span v-for="(word, wordIndex) in votingCardInfo.submissionText.split(' ')"
                        :style="{ 'color': `${colors.acronymPallette[wordIndex % colors.acronymPallette.length].shades[1]}` }">{{
                `${word} ` }} </span>-->
                </p>
            </div>
        </div>
        <div v-show="props.resultsMode" class="controls">
            <button class="next-round-button font gradient" @click="nextRound()">Next Round</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { UserSubmission } from '../models'
import { useDiscordStore } from '../stores/discordStore';
import Avatar from './Avatar.vue';
import { VotingCardInfo } from '../models/votingCardInfo';
import { ref, watch, computed } from 'vue';
import { usePalletteStore } from '../stores/palletteStore';
const props = defineProps({
    submissionsByUserId: {
        type: Object,
        required: true
    },
    resultsMode: {
        type: Boolean,
        required: true
    },
    skipVoting: {
        type: Boolean,
        required: true
    },
    timeRemaining: {
        type: Number,
        required: true
    }
})
// expose prop values as computed refs so they're available directly on $setup
const submissionsByUserId = computed(() => props.submissionsByUserId);
const resultsMode = computed(() => props.resultsMode);
const skipVoting = computed(() => props.skipVoting);
const timeRemaining = computed(() => props.timeRemaining);

// Debug: log the incoming prop values so you can inspect them in the Storybook console.
// Remove these lines after debugging.
try {
    // We log the raw values (unwrapped) so source mapping and console inspection are easy.
    // When Storybook is open with DevTools, check the Console to see this output.
    // If you want the debugger to pause here, uncomment the `debugger;` line below.
    // debugger;
    // eslint-disable-next-line no-console
    console.log('[VotingScreen] incoming props', {
        submissionsByUserId: submissionsByUserId.value,
        resultsMode: resultsMode.value,
        skipVoting: skipVoting.value,
        timeRemaining: timeRemaining.value,
    });
} catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[VotingScreen] error logging props', e);
}
const emits = defineEmits(['vote', 'next-round'])
const discord = useDiscordStore();
const colors = usePalletteStore();
// initialize selectedGradient early so Vue's CSS var binding can access it during setup
const selectedGradient = colors.acronymPallette.map(color => color.main);

let shouldAnimateByUserId = ref<Map<number, boolean>>(new Map());
let votingSubmissions = ref<VotingCardInfo[]>([]);
let hasVoted = ref<boolean>(resultsMode.value);

watch(resultsMode, (newValue, _) =>{
    if(newValue){
        Object.keys(submissionsByUserId.value).forEach(userId =>{
            document.getElementById(userId)?.classList.remove('gradient');
            document.getElementById(userId)?.classList.remove('selected-text');

        })
    }
})

Object.keys(submissionsByUserId.value).forEach(userId => {
    let userSubmission: UserSubmission = submissionsByUserId.value[userId];
    votingSubmissions.value.push(new VotingCardInfo(
        userId,
        userSubmission.user_data.displayName,
        userSubmission.user_data.avatarUrl,
        userSubmission.user_data.decorationUrl,
        userSubmission.submission!,
        userSubmission.answer_time!
    ));
});

votingSubmissions.value.sort((current, next) => current.submissionTime - next.submissionTime)
votingSubmissions.value.forEach((votingCardInfo: VotingCardInfo, index: number) => {
    votingCardInfo.color = colors.acronymPallette[index % colors.acronymPallette.length].main
});

function vote(userId: string) {
    if (discord.auth.user.id != userId && !hasVoted.value && !resultsMode.value) {
        let selectedElement = document.getElementById(userId)!
        let selectedElementChildParagraph = document.getElementById(`p.${userId}`)!
        let userSubmission: UserSubmission = props.submissionsByUserId[userId];
        emits('vote', userId)
        hasVoted.value = true;
        selectedElement.classList.add('gradient')
            // set the CSS variable on the selected element so the pseudo-element can read it
            // format: a comma-separated list of color stops (e.g. "#ff0000, #00ff00, #0000ff")
            selectedElement.style.setProperty('--selectedGradient', selectedGradient.join(', '));
        selectedElementChildParagraph.innerHTML = userSubmission.submission;
        selectedElementChildParagraph.classList.add('selected-text')
    }
}

function setShouldAnimate(shouldAnimateKey: string, value: boolean) {
    shouldAnimateByUserId.value.set(Number(shouldAnimateKey), value)
}

function nextRound(){
    emits('next-round')
}
</script>

<style scoped>
.avatar {
    margin-right: 50px;
}

.submitter-info-text {
    margin-top: 5px;
}

.header {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.header-text {
    margin-bottom: 0px;
    font-size: 2em;
}

.header-subtext {
    font-size: 1.2em;
}

.time {
    position: absolute;
    right: 0px;
    margin-left: 20px;
}

.submitter-info {
    display: flex;
    flex-direction: row;
    font-weight: 800;
    position: relative;
    font-family: 'Orbitron';
    height: 50px;
}

.font {
    font-family: 'Orbitron';
}

.voting-card {
    padding: 10px;
    margin: 0.5%;
    width: 40%;
    display: flex;
    flex-direction: column;
    font-size: 1.1em;
    font-family: 'Orbitron';
    font-weight: 700;
    font-style: normal;
    border: 4px solid black;
    transition: 1s;
    position: relative;
}

.voting-card:hover {
    top: -10px;
    font-weight: 800;
}

.voting-container {
    overflow-y: scroll;
    overflow-x: scroll;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
}

.container {
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
}

.selected-text {
    font-size: 1em;
}

/* submission text uses default styles */

.next-round-button {
    height: 40px;
    margin-top: 10px;
    border-width: 2px;
    border-style: solid;
}

.controls{
    margin-bottom: auto;
}
.gradient {
    --borderWidth: 3px;
    background: #1D1F20;
    position: relative;
    border-radius: var(--borderWidth);
}

.gradient:after {
    content: '';
    position: absolute;
    top: calc(-1 * var(--borderWidth));
    left: calc(-1 * var(--borderWidth));
    height: calc(100% + var(--borderWidth) * 2);
    width: calc(100% + var(--borderWidth) * 2);
    /* use a runtime CSS variable set on the selected element; fallback to a simple gradient */
    background: linear-gradient(60deg, var(--selectedGradient, #FF7F24, #FF2AFF, #00FFDE));
    border-radius: calc(2 * var(--borderWidth));
    z-index: -1;
    animation: animated-gradient 3s ease alternate infinite;
    background-size: 300% 300%;
}


@keyframes animated-gradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}
</style>
