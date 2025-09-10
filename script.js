let word = "";
let language = "en";
let length = 5;
let guessCount = 0;
let currentRow = null;
let customWords = null;

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

document.getElementById("uploadLibrary").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      customWords = JSON.parse(reader.result);
      feedback.textContent = "✅ Custom word list loaded.";
    } catch {
      feedback.textContent = "❌ Invalid JSON file.";
    }
  };
  reader.readAsText(file);
});

document.getElementById("newGame").addEventListener("click", async () => {
  let pool;
  if (customWords && customWords[length]) {
    pool = customWords[length];
  } else {
    const res = await fetch(`words-${language}.json`);
    const words = await res.json();
    pool = words[length];
  }

  const entry = pool[Math.floor(Math.random() * pool.length)];
  word = entry.word.toLowerCase();
  currentDefinition = entry.definition;
  guessCount = 0;
  feedback.textContent = "";
  definition.textContent = "";
  defineBtn.style.display = "inline";
  board.innerHTML = "";
  drawNextRow();
});

defineBtn.addEventListener("click", () => {
  showDefinition(word);
});
document.getElementById("submitGuess").addEventListener("click", submitGuess);

function drawNextRow() {
  currentRow = document.createElement("div");
  currentRow.className = "row";

 const maxVisibleRows = 5;
const rows = board.querySelectorAll(".row");

rows.forEach((row, index) => {
  row.style.display = index < rows.length - maxVisibleRows ? "none" : "flex";
});

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
      if (next && input.value) next.focus();
    });

    input.addEventListener("keydown", e => {
      if (e.key === "Backspace" && !input.value) {
        const prev = input.previousElementSibling;
        if (prev) {
          prev.focus();
          prev.value = "";
          e.preventDefault();
        }
      }
      if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
      }
    });

    currentRow.appendChild(input);
  }

  board.appendChild(currentRow);
  currentRow.querySelector("input").focus();
}

function submitGuess() {
  if (!currentRow) return;
  const inputs = currentRow.querySelectorAll("input");
 const guessArray = Array.from(inputs).map(i => i.value.trim().toLowerCase());
if (guessArray.some(val => val === "") || guessArray.length !== length) {
  feedback.textContent = "⚠️ Please fill all letters before submitting.";
  return;
}
const guess = guessArray.join("");

  guessCount++;
  for (let i = 0; i < length; i++) {
    const tile = inputs[i];
    const letter = guess[i];
    if (letter === word[i]) tile.classList.add("correct");
    else if (word.includes(letter)) tile.classList.add("present");
    else tile.classList.add("absent");
  }

  defineBtn.style.display = "inline";

  if (guess === word) {
    feedback.textContent = `🎉 You got it in ${guessCount} tries!`;
    showDefinition(word);
  } else {
    if (guess === word && guessCount <= 5) {
      feedback.textContent = getEncouragement(guessCount);
    }
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

async function showDefinition() {
  definition.textContent = `📖 ${currentDefinition}`;
   currentRow.querySelector("input").focus();

}
