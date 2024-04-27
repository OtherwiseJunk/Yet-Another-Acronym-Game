<template>
    <div class="container">
        <div class="voting-card" @click="vote">
            <Avatar></Avatar>
        </div>
    </div>
</template>

<script setup lang="ts">
import { UserSubmission, UserData } from '../models'
import { useDiscordStore } from '../stores/discordStore';
const props = defineProps({
    submissionsByUserId: Map<string, UserSubmission>
})
const emits = defineEmits(['vote'])
const discord = useDiscordStore();

let submissionUserData = new Map<string, UserData> ();

props.submissionsByUserId!.forEach( async (_, userId) => {
    submissionUserData[userId] = await discord.getUserInformation(userId);
 });

function vote(clickEvent: MouseEvent){
    console.log(clickEvent)
    emits('vote',)
}
</script>

<style scoped>
    .voting-card{
        max-width: 50%;
        display: flex
    }
    .container{
        display: flex;
        flex-direction: column;
    }
</style>