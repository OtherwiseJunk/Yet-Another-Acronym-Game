Original Reference for animation https://codepen.io/rachsmith/pen/oGEMbz
Thanks to Rebecca Smith!

<template>
  <div class="container">
    <h2 id="text" class="text"></h2>
    <svg id="svg">
    </svg>
  </div>
</template>

<style scoped>
#svg {
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
import { TweenLite, Back, Power3, Power1 } from 'gsap';
import { Color } from '../models';
let props = defineProps<{
  letterArray: string[],
  colors: Color[]
}>();

function selectSVG(elementId: string){
  const element = document.getElementById(elementId);
  return new SVGElement(element!);
};

function createSVG(shape: string): SVGElement{
  const element = document.createElementNS('http://www.w3.org/2000/svg', shape);
  return new SVGElement(element);
};

class SVGElement {
  constructor(private element: any) {}

  set(attributeName: string, value: any) {
    this.element.setAttribute(attributeName, value);
  }

  style(property: string, value: string) {
    this.element.setAttribute('style', `${property}:${value}`);
  }
  appendChild(child: HTMLElement){
    this.element.appendChild(child);
  }
  removeChild(child: HTMLElement){
    this.element.removeChild(child);
  }
  toElement(){
    return this.element;
  }
}

let svg: SVGElement;
let text: HTMLElement;
const letters: any[] = [];
let value = '';
let textSize = 120;
let textCenter = 160;


function addLetter(char: string, index: number) {
  const letter = document.createElement('span');
  letter.innerHTML = char;
  text.appendChild(letter);
  const color = props.colors[index % props.colors.length];
  letter.style.color = color.main;
  letters[index] = { onScreen: letter, char: char };
  animateLetterIn(letter);
  addDecoration(letter, color);
}

function addLetters(chars: string[]){
  chars.forEach((char: string, index: number) => {
    if (letters[index] && letters[index].char !== char) {
      letters[index].onScreen.innerHTML = char;
      letters[index].char = char;
    }
    if (letters[index] === undefined) {
      addLetter(char, index);
    }
  });
};

function positionLetters(){
  letters.forEach(letter => {
    const timing = letter.shift ? 0.1 : 0;
    TweenLite.to(letter.onScreen, timing, { x: letter.onScreen.offsetLeft + 'px', ease: Power3.easeInOut });
    letter.shift = true;
  });
}

function animateLetterIn(letter: HTMLElement){
  const yOffset = (0.5 + Math.random() * 0.5) * textSize;
  TweenLite.fromTo(letter, 0.4, { scale: 0 }, { scale: 1, ease: Back.easeOut });
  TweenLite.fromTo(letter, 0.4, { opacity: 0 }, { opacity: 1, ease: Power3.easeOut });
  TweenLite.to(letter, 0.2, { y: -yOffset, ease: Power3.easeInOut });
  TweenLite.to(letter, 0.2, { y: 0, ease: Power3.easeInOut, delay: 0.2 });
  const rotation = -50 + Math.random() * 100;
  TweenLite.to(letter, 0.2, { rotation: rotation, ease: Power3.easeInOut });
  TweenLite.to(letter, 0.2, { rotation: 0, ease: Power3.easeInOut, delay: 0.2 });
}

function addDecoration(letter: HTMLElement, color: Color){
  setTimeout(() => {
    const x0 = letter.offsetLeft + letter.offsetWidth / 2;
    const y0 = textCenter - textSize * 0.5;
    const shade = color.shades[Math.floor(Math.random() * 4)];
    for (var i = 0; i < 8; i++) addTriangle(x0, y0, shade);
    for (var i = 0; i < 8; i++) addCircle(x0, y0);
  }, 150);
};

function addTriangle(x0: number, y0: number, shade: string){
  const tri = createSVG('polygon');
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
  tri.set('points', `0,0 ${triSize * 2},0 ${triSize},${triSize * 2}`);
  tri.style('fill', shade);
  svg.appendChild(tri.toElement());
  TweenLite.fromTo(tri.toElement(), 0.6, { rotation: Math.random() * 360, scale: scale, x: x - offset, y: y - offset, opacity: 1 }, {
    x: x2 - offset, y: y2 - offset, opacity: 0, ease: Power1.easeInOut, onComplete: () => {
      svg.removeChild(tri.toElement());
    }
  });
}

function addCircle(centerX:number, centerY:number){
  const circle = createSVG('circle');
  const randomAngle = Math.random();
  const circleRadiusX = textSize * 0.52;
  const circleRadiusY = circleRadiusX + textSize;
  const initialX = centerX + circleRadiusX * Math.cos(2 * Math.PI * randomAngle);
  const initialY = centerY + circleRadiusX * Math.sin(2 * Math.PI * randomAngle);
  const finalX = centerX + circleRadiusY * Math.cos(2 * Math.PI * randomAngle);
  const finalY = centerY + circleRadiusY * Math.sin(2 * Math.PI * randomAngle);
  const circleSize = textSize * 0.05 * Math.random();

  circle.set('r', circleSize);
  circle.style('fill', '#eee');

  svg.appendChild(circle.toElement());
  TweenLite.fromTo(circle.toElement(), 0.6, { x: initialX - circleSize, y: initialY - circleSize, opacity: 1 }, {
    x: finalX - circleSize, y: finalY - circleSize, opacity: 0, ease: Power1.easeInOut, onComplete: () => {
      svg.removeChild(circle.toElement());
    }
  });
}

function addText(index: number){

  setTimeout(() => {
    if (props.letterArray[index]) {
      value += props.letterArray[index];
      addLetters(value.split(''));
      positionLetters();
      addText(index + 1);
    }
  }, 300);
};

setTimeout(() => {
  svg = selectSVG('svg');
  text = document.getElementById('text')!;
  addText(0);
}, 200);
</script>