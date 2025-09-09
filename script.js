let word = "";
let language = "en";
let length = 5;
let guessCount = 0;
let currentRow = 0;
let currentGuess = "";

const board = document.getElementById("board");
const feedback = document.getElementById("feedback");
const defineBtn = document.getElementById("defineBtn");
const definition = document.getElementById("definition");
const keyboard = document.getElementById("keyboard");

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
  currentRow = 0;
  currentGuess = "";
  feedback.textContent = "";
  definition.textContent = "";
  defineBtn.style.display = "none";
  drawBoard();
  drawKeyboard();
});

defineBtn.addEventListener("click", () => {
  showDefinition(word);
});

function drawBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < length; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function drawKeyboard() {
  keyboard.innerHTML = "";
  const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  keys.split("").forEach(letter => {
    const key = document.createElement("button");
    key.className = "key";
    key.textContent = letter;
    key.addEventListener("click", () => handleKey(letter.toLowerCase()));
    keyboard.appendChild(key);
  });

  const enter = document.createElement("button");
  enter.className = "key";
  enter.textContent = "⏎";
  enter.addEventListener("click", submitGuess);
  keyboard.appendChild(enter);

  const del = document.createElement("button");
  del.className = "key";
  del.textContent = "⌫";
  del.addEventListener("click", () => {
    currentGuess = currentGuess.slice(0, -1);
    updateRow();
  });
  keyboard.appendChild(del);
}

function handleKey(letter) {
  if (currentGuess.length < length) {
    currentGuess += letter;
    updateRow();
  }
}

function updateRow() {
  const row = board.children[currentRow];
  for (let i = 0; i < length; i++) {
    row.children[i].textContent = currentGuess[i] || "";
  }
}

function submitGuess() {
  if (currentGuess.length !== length) return;

  const row = board.children[currentRow];
  for (let i = 0; i < length; i++) {
    const tile = row.children[i];
    const letter = currentGuess[i];
    if (letter === word[i]) tile.classList.add("correct");
    else if (word.includes(letter)) tile.classList.add("present");
    else tile.classList.add("absent");
  }

  guessCount++;
  if (currentGuess === word) {
    feedback.textContent = `🎉 You got it in ${guessCount} tries!`;
    showDefinition(word);
    defineBtn.style.display = "inline";
  } else if (guessCount <= 5) {
    feedback.textContent = getEncouragement(guessCount);
    defineBtn.style.display = "inline";
  }

  currentRow++;
  currentGuess = "";
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
