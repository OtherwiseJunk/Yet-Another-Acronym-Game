<template>
    <div class="container">
        <div v-for="(votingCardInfo, cardIndex) in votingSubmissions" class="voting-card" @click="vote"
            :key="votingCardInfo.userId" @mouseenter="shouldAnimateByUserId.set(Number(votingCardInfo.userId), true)"
            @mouseleave="shouldAnimateByUserId.set(Number(votingCardInfo.userId), false)"
            :style="{
                'background': `${hexToRGB(colors.acronymPallette[cardIndex % colors.acronymPallette.length].main, 0.08)}`,
                'box-shadow': `1px 1px 6px ${colors.acronymPallette[cardIndex % colors.acronymPallette.length].main}`}">
            <div class="submitter-info">
                <Avatar v-show="props.resultsMode" class="avatar" :avatarDecorationUrl="votingCardInfo.decoratorUrl"
                    :avatarUrl="votingCardInfo.avatarUrl"
                    :shouldAnimate="shouldAnimateByUserId.get(Number(votingCardInfo.userId))"></Avatar>
                <p v-show="props.resultsMode" class="name">{{ votingCardInfo.displayName }}</p>
                <p class="time">{{ votingCardInfo.submissionTime }} s</p>
            </div>
            <p class="submission-text">
                <span v-for="(word, wordIndex) in votingCardInfo.submissionText.split(' ')" :style="{'color': `${colors.acronymPallette[wordIndex].main}`}">{{ `${word} ` }} </span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { UserSubmission } from '../models'
import { useDiscordStore } from '../stores/discordStore';
import Avatar from './Avatar.vue';
import { VotingCardInfo } from '../models/votingCardInfo';
import { ref } from 'vue';
import { usePalletteStore } from '../stores/palletteStore';
const props = defineProps({
    submissionsByUserId: {
        type: Object,
        required: true
    },
    resultsMode: {
        type: Boolean,
        required: true
    }
})
const emits = defineEmits(['vote'])
const discord = useDiscordStore();
const colors = usePalletteStore();

let shouldAnimateByUserId = ref<Map<number, boolean>>(new Map());
let votingSubmissions = ref<VotingCardInfo[]>([]);

Object.keys(props.submissionsByUserId).forEach(userId => {
    let userSubmission: UserSubmission = props.submissionsByUserId[userId];
    discord.getUserInformation(`${userId}`).then((userData) => {
        votingSubmissions.value.push(new VotingCardInfo(
            userId,
            userData.displayName,
            userData.avatarUrl,
            userData.decorationUrl,
            userSubmission.submission!,
            userSubmission.answer_time!
        ));

        if (votingSubmissions.value.length === Object.keys(props.submissionsByUserId).length) {
            votingSubmissions.value.sort((current, next) => current.submissionTime - next.submissionTime)
        }
    });
});

function hexToRGB(hex: string, alpha: number) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

function vote(clickEvent: MouseEvent) {
    console.log(clickEvent)
    emits('vote')
}
</script>

<style scoped>
.avatar {
    margin-right: 50px;
}

.name {
    margin-top: 5px;
}

.time {
    margin-top: 5px;
    position: absolute;
    right: 0px;
    margin-left: 20px;
}

.submitter-info {
    margin-bottom: 25px;
    display: flex;
    flex-direction: row;
    font-weight: 800;
    position: relative;
}

.voting-card {
    padding: 10px;
    margin: 6px;
    max-width: 50%;
    max-height: 50%;
    display: flex;
    flex-direction: column;
    font-size: 1.25em;
    font-family: 'Orbitron';
    font-weight: 600;
    font-style: normal;
    border: 4px solid black;
    transition: 1s;
    position: relative;
}

.voting-card:hover{
    top: -10px;
    font-weight: 800;
}

.container {
    margin: 20px;
    max-width: 95%;
    max-height: 500px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
}
span{
    -webkit-text-stroke: 0.5px #444;
}
</style>../stores/palletteStore