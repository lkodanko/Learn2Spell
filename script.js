let word = "";
let language = "en";
let length = 5;
let guessCount = 0;

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
  drawBoard();
});

document.getElementById("submitGuess").addEventListener("click", () => {
  const guess = document.getElementById("guessInput").value.toLowerCase();
  if (guess.length !== word.length) return;

  guessCount++;
  updateBoard(guess);
  if (guess === word) {
    feedback.textContent = `🎉 You got it in ${guessCount} tries!`;
    showDefinition(word);
  } else if (guessCount <= 5) {
    feedback.textContent = getEncouragement(guessCount);
  }
  defineBtn.style.display = "inline";
});

defineBtn.addEventListener("click", () => {
  showDefinition(word);
});

function drawBoard() {
  board.innerHTML = "";
  for (let i = 0; i < word.length; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = "_";
    board.appendChild(tile);
  }
}

function updateBoard(guess) {
  board.innerHTML = "";
  for (let i = 0; i < word.length; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = guess[i];
    if (guess[i] === word[i]) tile.classList.add("correct");
    else if (word.includes(guess[i])) tile.classList.add("present");
    else tile.classList.add("absent");
    board.appendChild(tile);
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
