let word = "";
let language = "en";
let length = 5;
let guessCount = 0;
let currentRow = null;

const board = document.getElementById("board");
const feedback = document.getElementById("feedback");
const defineBtn = document.getElementById("defineBtn");
const definition = document.getElementById("definition");

document.getElementById("language").addEventListener("change", e => {
  language = e.target.value;
});

document.getElementById("length").addEventListener("change", e => {
  length = parseInt(e.target.value);
});

document.getElementById("newGame").addEventListener("click", async () => {
  const res = await fetch(`words-${language}.json`);
  const words = await res.json();
  const pool = words[length];
  word = pool[Math.floor(Math.random() * pool.length)].toLowerCase();
  guessCount = 0;
  feedback.textContent = "";
  definition.textContent = "";
  defineBtn.style.display = "none";
  board.innerHTML = "";
  drawNextRow();
});

defineBtn.addEventListener("click", () => {
  showDefinition(word);
});

function drawNextRow() {
  currentRow = document.createElement("div");
  currentRow.className = "row";
  for (let i = 0; i < length; i++) {
    const input = document.createElement("input");
    input.className = "tile";
    input.maxLength = 1;
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.inputMode = "latin";
    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase().slice(0, 1);
      const next = input.nextElementSibling;
      if (next) next.focus();
    });
    currentRow.appendChild(input);
  }

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.addEventListener("click", submitGuess);
  currentRow.appendChild(submitBtn);

  board.appendChild(currentRow);
  currentRow.querySelector("input").focus();
}

function submitGuess() {
  const inputs = currentRow.querySelectorAll("input");
  const guess = Array.from(inputs).map(i => i.value.toLowerCase()).join("");

  if (guess.length !== length || guess.includes("")) return;

  guessCount++;
  for (let i = 0; i < length; i++) {
    const tile = inputs[i];
    const letter = guess[i];
    if (letter === word[i]) tile.classList.add("correct");
    else if (word.includes(letter)) tile.classList.add("present");
    else tile.classList.add("absent");
  }

  if (guess === word) {
    feedback.textContent = `🎉 You got it in ${guessCount} tries!`;
    showDefinition(word);
    defineBtn.style.display = "inline";
  } else {
    if (guessCount <= 5) {
      feedback.textContent = getEncouragement(guessCount);
    }
    defineBtn.style.display = "inline";
    drawNextRow();
  }
}

function getEncouragement(count) {
  const messages = [
    "🔥 First try! Genius!",
    "💡 Second guess—you're sharp!",
    "🎯 Third time’s the charm!",
    "👏 Fourth guess—nice work!",
    "🙌 Fifth try—still impressive!"
  ];
  return messages[count - 1] || "";
}

async function showDefinition(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${language}/${word}`);
    const data = await res.json();
    const meaning = data[0]?.meanings[0]?.definitions[0]?.definition;
    definition.textContent = meaning ? `📖 ${meaning}` : "No definition found.";
  } catch {
    definition.textContent = "Definition unavailable.";
  }
}
