<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps(['avatarDecorationUrl', 'avatarUrl', 'shouldAnimate'])

watch(props, () =>{
    setImageSources(props.shouldAnimate);
});
let decorationUrl: string;
let avatarUrl: string;
setImageSources(props.shouldAnimate);

function setImageSources(shouldAnimate: boolean){
    decorationUrl = shouldAnimate ? props.avatarDecorationUrl : `${props.avatarDecorationUrl}&passthrough=false`
    avatarUrl = shouldAnimate ? props.avatarUrl : props.avatarUrl.replace('.gif', '.webp');
}
</script>

<template>
    <div class="avatar-container">
        <img v-if="avatarDecorationUrl" class="avatar-decoration avatar" :src="decorationUrl">
    <img class="avatar-icon avatar" :src=" avatarUrl ?? 'https://1219391019515121716.discordsays.com/media/yak.png'">
    </div>
</template>

<style scoped>
.avatar-decoration{
    z-index: 1;
    height: 48px;
    left: -4px;
    top: -4px;
}

.avatar-icon {
    height: 40px;
    border-radius: 50%;
    z-index: -1;
}

.avatar {
    position: absolute;
    border-radius: 50%;
}

.avatar-container{
    position: relative;
    margin-right: 25px;
}
</style>
