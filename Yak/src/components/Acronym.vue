// Original Reference for animation https://codepen.io/rachsmith/pen/oGEMbz - Thanks to Rebecca Smith!

<template>
  <div class="container">
    <h2 ref="textRef" class="text"></h2>
    <svg ref="svgRef" />
  </div>
</template>

<style scoped>
#svg, svg {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  position: absolute;
}

.container{
  padding-top: 50px;
  height: 150px;
  position: relative;
}
.text{
  font-size: 100px;
  display: block;
  margin: 0;
  font-family: 'Orbitron';
}
</style>

<script defer setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { gsap, Back, Power3, Power1 } from 'gsap';
import { Color } from '../models';

const props = defineProps<{
  letterArray: string[],
  colors: Color[]
}>();

const textRef = ref<HTMLElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);

let letters: any[] = [];
const textSize = 120;
const textCenter = 160;

function addLetter(char: string, index: number) {
  if (!textRef.value) return;
  const letter = document.createElement('span');
  letter.innerHTML = char;
  textRef.value.appendChild(letter);
  const color = props.colors[index % props.colors.length];
  letter.style.color = color.main;
  letters[index] = { onScreen: letter, char: char };
  animateLetterIn(letter);
  addDecoration(letter, color);
}

function positionLetters(){
  letters.forEach(letter => {
    if (!letter) return;
    const timing = letter.shift ? 0.1 : 0;
    gsap.to(letter.onScreen, { duration: timing, x: `${letter.onScreen.offsetLeft}px`, ease: 'power3.inOut' });
    letter.shift = true;
  });
}

function animateLetterIn(letter: HTMLElement){
  const yOffset = (0.5 + Math.random() * 0.5) * textSize;
  gsap.fromTo(letter, { scale: 0 }, { duration: 0.4, scale: 1, ease: 'back.out' });
  gsap.fromTo(letter, { opacity: 0 }, { duration: 0.4, opacity: 1, ease: 'power3.out' });
  gsap.to(letter, { duration: 0.2, y: -yOffset, ease: 'power3.inOut' });
  gsap.to(letter, { duration: 0.2, y: 0, ease: 'power3.inOut', delay: 0.2 });
  const rotation = -50 + Math.random() * 100;
  gsap.to(letter, { duration: 0.2, rotation: rotation, ease: 'power3.inOut' });
  gsap.to(letter, { duration: 0.2, rotation: 0, ease: 'power3.inOut', delay: 0.2 });
}

function addDecoration(letter: HTMLElement, color: Color){
  setTimeout(() => {
    if (!letter.parentElement) return; // letter might have been removed
    const x0 = letter.offsetLeft + letter.offsetWidth / 2;
    const y0 = textCenter - textSize * 0.5;
    const shade = color.shades[Math.floor(Math.random() * 4)];
    for (var i = 0; i < 8; i++) addTriangle(x0, y0, shade);
    for (var i = 0; i < 8; i++) addCircle(x0, y0);
  }, 150);
};

function addTriangle(x0: number, y0: number, shade: string){
  if (!svgRef.value) return;
  const tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  const a = Math.random();
  const a2 = a + (-0.2 + Math.random() * 0.4);
  const r = textSize * 0.52;
  const r2 = r + textSize * Math.random() * 0.2;
  const x = x0 + r * Math.cos(2 * Math.PI * a);
  const y = y0 + r * Math.sin(2 * Math.PI * a);
  const x2 = x0 + r2 * Math.cos(2 * Math.PI * a2);
  const y2 = y0 + r2 * Math.sin(2 * Math.PI * a2);
  const triSize = textSize * 0.1;
  const scale = 0.3 + Math.random() * 0.7;
  const offset = triSize * scale;
  tri.setAttribute('points', `0,0 ${triSize * 2},0 ${triSize},${triSize * 2}`);
  tri.setAttribute('style', `fill:${shade}`);
  svgRef.value.appendChild(tri);
  gsap.fromTo(tri, { rotation: Math.random() * 360, scale: scale, x: x - offset, y: y - offset, opacity: 1 }, {
    duration: 0.6, x: x2 - offset, y: y2 - offset, opacity: 0, ease: 'power1.inOut', onComplete: () => {
      svgRef.value?.removeChild(tri);
    }
  });
}

function addCircle(centerX:number, centerY:number){
  if (!svgRef.value) return;
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const randomAngle = Math.random();
  const circleRadiusX = textSize * 0.52;
  const circleRadiusY = circleRadiusX + textSize;
  const initialX = centerX + circleRadiusX * Math.cos(2 * Math.PI * randomAngle);
  const initialY = centerY + circleRadiusX * Math.sin(2 * Math.PI * randomAngle);
  const finalX = centerX + circleRadiusY * Math.cos(2 * Math.PI * randomAngle);
  const finalY = centerY + circleRadiusY * Math.sin(2 * Math.PI * randomAngle);
  const circleSize = textSize * 0.05 * Math.random();

  circle.setAttribute('r', String(circleSize));
  circle.setAttribute('style', 'fill:#eee');

  svgRef.value.appendChild(circle);
  gsap.fromTo(circle, { x: initialX - circleSize, y: initialY - circleSize, opacity: 1 }, {
    duration: 0.6, x: finalX - circleSize, y: finalY - circleSize, opacity: 0, ease: 'power1.inOut', onComplete: () => {
      svgRef.value?.removeChild(circle);
    }
  });
}

let animationTimeout: number;
function addText(index: number){
  clearTimeout(animationTimeout);
  animationTimeout = window.setTimeout(() => {
    if (props.letterArray && props.letterArray[index]) {
      addLetter(props.letterArray[index], index);
      positionLetters();
      addText(index + 1);
    }
  }, 300);
};

function animateLettersOut() {
  const tweens = letters
    .filter(l => l && l.onScreen)
    .map(l => gsap.to(l.onScreen, {
        duration: 0.3,
        scale: 0,
        opacity: 0,
        ease: 'power3.in'
    }));
  return Promise.all(tweens);
}

async function startAnimation() {
  // Reset state
  await animateLettersOut();
  clearTimeout(animationTimeout);
  if (textRef.value) {
      textRef.value.innerHTML = '';
  }
  letters = [];

  // Start animation
  addText(0);
}

onMounted(startAnimation);

onUnmounted(() => {
  gsap.killTweensOf([textRef.value, svgRef.value]);
});

watch(() => props.letterArray, startAnimation, { deep: true });
</script>
