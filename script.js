const MORSE = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.",
  "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
  "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
  "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
  "Y": "-.--", "Z": "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.",
  "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", "\"": ".-..-.",
  "$": "...-..-", "@": ".--.-.",
  "ا": ".-", "ب": "-...", "ت": "-", "ث": "-.-.", "ج": ".---", "ح": "....",
  "خ": "---", "د": "-..", "ذ": "--..", "ر": ".-.", "ز": "---.", "س": "...",
  "ش": "----", "ص": "-..-", "ض": "...-", "ط": "..-", "ظ": "-.--",
  "ع": ".-.-", "غ": "--.", "ف": "..-.", "ق": "--.-", "ك": "-.-",
  "ل": ".-..", "م": "--", "ن": "-.", "ه": "..", "و": ".--", "ي": ".."
};

const ARABIC_LATIN = {
  "ا": "A", "ب": "B", "ت": "T", "ث": "TH", "ج": "J", "ح": "H", "خ": "KH",
  "د": "D", "ذ": "DH", "ر": "R", "ز": "Z", "س": "S", "ش": "SH", "ص": "SH",
  "ض": "D", "ط": "T", "ظ": "Z", "ع": "A", "غ": "GH", "ف": "F", "ق": "Q",
  "ك": "K", "ل": "L", "م": "M", "ن": "N", "ه": "H", "و": "W", "ي": "Y"
};

const latinLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!/()&:;=+-_\"$@";
const reverseMorse = {};
Object.entries(MORSE).forEach(([letter, code]) => {
  if (!reverseMorse[code] && latinLetters.includes(letter)) reverseMorse[code] = letter;
});
Object.entries(MORSE).forEach(([letter, code]) => {
  if (!reverseMorse[code]) reverseMorse[code] = letter;
});

let mode = "text";
const inputText = document.querySelector("#inputText");
const outputText = document.querySelector("#outputText");
const inputCount = document.querySelector("#inputCount");
const outputCount = document.querySelector("#outputCount");

function textToMorse(text) {
  return text.trim().split(/\s+/).map(word =>
    [...word].map(char => {
      const upper = char.toUpperCase();
      return MORSE[upper] || MORSE[char] || (char === " " ? "/" : "");
    }).filter(Boolean).join(" ")
  ).join(" / ");
}

function morseToText(morse) {
  return morse.trim().split(/\s*\/\s*/).map(word =>
    word.trim().split(/\s+/).map(code => reverseMorse[code] || "�").join("")
  ).join(" ");
}

function convert() {
  const value = inputText.value;
  inputCount.textContent = `${[...value].length} حرف`;
  const result = mode === "text" ? textToMorse(value) : morseToText(value);
  outputText.value = result;
  const signalCount = (result.match(/[.-]/g) || []).length;
  outputCount.textContent = `${signalCount} إشارة`;
}

function setMode(nextMode) {
  mode = nextMode;
  const textTab = document.querySelector("#textToMorse");
  const morseTab = document.querySelector("#morseToText");
  textTab.classList.toggle("active", mode === "text");
  morseTab.classList.toggle("active", mode === "morse");
  textTab.setAttribute("aria-selected", mode === "text");
  morseTab.setAttribute("aria-selected", mode === "morse");
  document.querySelector("#inputLabel").textContent = mode === "text" ? "النص المراد تحويله" : "شفرة مورس المراد فكها";
  document.querySelector("#outputLabel").textContent = mode === "text" ? "شفرة مورس" : "النص الناتج";
  inputText.value = "";
  outputText.value = "";
  inputCount.textContent = "0 حرف";
  outputCount.textContent = "0 إشارة";
  inputText.placeholder = mode === "text" ? "اكتب النص هنا…" : "مثال: ... / --- ...";
  inputText.focus();
}

document.querySelector("#textToMorse").addEventListener("click", () => setMode("text"));
document.querySelector("#morseToText").addEventListener("click", () => setMode("morse"));
document.querySelector("#swapMode").addEventListener("click", () => setMode(mode === "text" ? "morse" : "text"));
document.querySelector("#convertButton").addEventListener("click", convert);
inputText.addEventListener("input", convert);
document.querySelector("#clearInput").addEventListener("click", () => {
  inputText.value = "";
  outputText.value = "";
  inputCount.textContent = "0 حرف";
  outputCount.textContent = "0 إشارة";
  inputText.focus();
});

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelector("#copyOutput").addEventListener("click", async () => {
  if (!outputText.value) return showToast("لا توجد نتيجة للنسخ");
  await navigator.clipboard.writeText(outputText.value);
  showToast("تم نسخ النتيجة");
});

function playTone(duration, frequency = 600) {
  const context = playTone.context || (playTone.context = new AudioContext());
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  oscillator.connect(gain);
  gain.connect(context.destination);
  gain.gain.setValueAtTime(.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.12, context.currentTime + .01);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration + .02);
}

document.querySelector("#playSound").addEventListener("click", async () => {
  let morse = mode === "text" ? outputText.value : inputText.value;
  if (!morse) return showToast("أدخل نصًا أولًا");
  for (const char of morse) {
    if (char === ".") { playTone(.09); await new Promise(r => setTimeout(r, 180)); }
    else if (char === "-") { playTone(.27); await new Promise(r => setTimeout(r, 360)); }
    else if (char === " ") await new Promise(r => setTimeout(r, 120));
    else if (char === "/") await new Promise(r => setTimeout(r, 300));
  }
});

const letters = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
  "0","1","2","3","4","5","6","7","8","9",
  "ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"
];
const tableBody = document.querySelector("#lettersTable");

function renderLetters(filter = "") {
  const query = filter.trim().toUpperCase();
  tableBody.innerHTML = "";
  letters.filter(letter => letter.includes(query) || MORSE[letter].includes(query)).forEach(letter => {
    const row = document.createElement("tr");
    const type = /\d/.test(letter) ? "رقم" : (/^[A-Z]$/.test(letter) ? "حرف لاتيني" : "حرف عربي");
    row.innerHTML = `<td>${letter}</td><td>${MORSE[letter]}</td><td>${type}</td>`;
    row.addEventListener("click", () => {
      if (mode !== "text") setMode("text");
      inputText.value = letter;
      convert();
      document.querySelector("#converter").scrollIntoView({behavior: "smooth"});
    });
    tableBody.appendChild(row);
  });
}
renderLetters();
const charSearch = document.querySelector("#charSearch");
charSearch.addEventListener("input", event => renderLetters(event.target.value));
charSearch.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    charSearch.value = "";
    renderLetters();
  }
});

