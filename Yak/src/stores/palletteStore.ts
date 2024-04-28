import { defineStore } from "pinia";
import { Color } from "../models";
import { ref } from "vue";

declare global {
  interface Array<T> {
    shuffle: () => void;
  }
}
Array.prototype.shuffle = Array.prototype.shuffle = function () {
  var i = this.length,
    j,
    temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = this[j];
    this[j] = this[i];
    this[i] = temp;
  }
};

const colors = [
  // Neon variants
  new Color("#F2EA02", ["#F9F733", "#FFFF66", "#F5F012", "#ECE600"]), // Yellow
  new Color("#FF5C00", ["#FF7F24", "#FFA347", "#FF5400", "#FF4C00"]), // Orange
  new Color("#FF04F6", ["#FF2AFF", "#FF4DF9", "#FF00EF", "#FF00E6"]), // Pink
  new Color("#C406FF", ["#E229FF", "#FF54FF", "#B900FF", "#A100FF"]), // Purple
  new Color("#00FFDE", ["#33FFEE", "#66FFF7", "#00FFD4", "#00FFBF"]), // Cyan
  new Color("#00FF7F", ["#33FF9C", "#66FFB9", "#00FF75", "#00FF66"]), // Green
  new Color("#00FFF2", ["#33FFFF", "#66FFFF", "#00FFFF", "#00FFFF"]), // Blue

  // Rainbow variants
  new Color("#FF0000", ["#FF3300", "#FF6600", "#FF9900", "#FFCC00"]), // Red
  new Color("#FF7F00", ["#FF9933", "#FFAD66", "#FFC199", "#FFD5CC"]), // Orange
  new Color("#FFFF00", ["#FFFF33", "#FFFF66", "#FFFF99", "#FFFFCC"]), // Yellow
  new Color("#00FF00", ["#33FF33", "#66FF66", "#99FF99", "#CCFFCC"]), // Green
  new Color("#0000FF", ["#3333FF", "#6666FF", "#9999FF", "#CCCCFF"]), // Blue
  new Color("#4B0082", ["#6633FF", "#8559FF", "#A880FF", "#CCAAFF"]), // Indigo
  new Color("#9400D3", ["#AD33FF", "#C466FF", "#D699FF", "#EBC0FF"]), // Violet
];

export const usePalletteStore = defineStore("palletteStore", () => {
  let lastAcronym = ref<string>("");
  let acronymPallette = ref<Color[]>([]) ;

  function setAcronymPallette(acronym: string) {
    if (lastAcronym.value !== acronym) {
      acronymPallette.value = [];
      colors.shuffle();
      lastAcronym.value = acronym;
      acronym.split('').forEach((_, index) =>{
        acronymPallette.value.push(colors[index % colors.length])
      })
    }
  }

  return { acronymPallette, setAcronymPallette };
});
