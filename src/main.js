import { rubiks_junior_2x2x2 } from "./puzzles/puz_2x2x2.js";
import { rubiks_cube_3x3x3 } from "./puzzles/puz_3x3x3.js";
import { melindas_physical_2x2x2x2_canonical } from "./puzzles/puz_melindas_physical_2x2x2x2_canonical.js";
import { melindas_physical_2x2x2x2_noncanonical } from "./puzzles/puz_melindas_physical_2x2x2x2_noncanonical.js";
const puzzles = {
  rubiks_junior_2x2x2: rubiks_junior_2x2x2,
  rubiks_cube_3x3x3: rubiks_cube_3x3x3,
  melindas_physical_2x2x2x2_canonical: melindas_physical_2x2x2x2_canonical,
  melindas_physical_2x2x2x2_noncanonical:
    melindas_physical_2x2x2x2_noncanonical,
};

const titlecontainer = document.getElementById("titlecontainer");
const subtitlecontainer = document.getElementById("subtitlecontainer");
const puzzleSelector = document.getElementById("puzzleselector");
const versionSelector = document.getElementById("versionselector");
const scramblenotation = document.getElementById("scramblenotation");
const puzzlecontainer = document.getElementById("puzzlecontainer");
const controlscontainer = document.getElementById("controlscontainer");

function updatePuzzleSelection() {
  versionSelector.innerHTML = "";
  puzzles[puzzleSelector.value].svgversions.forEach((_literal, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `Layout ${index + 1}`;
    versionSelector.appendChild(option);
  });
  updateVersionSelection();
  reset();

  updateControls();
}
function updateVersionSelection() {
  titlecontainer.innerHTML = puzzles[puzzleSelector.value].titletext;
  subtitlecontainer.innerHTML = puzzles[puzzleSelector.value].subtitletext;
  puzzlecontainer.innerHTML =
    puzzles[puzzleSelector.value].svgversions[versionSelector.value];
  controlscontainer.innerHTML = puzzles[puzzleSelector.value].controlstext;
  reset();
}

let stopwatchInterval;
let startTime;
let ready = false;
let isStopwatchRunning = false;
let successfulSolve = true;
let attributeForCheckingColor = "fill";

function startStopwatch() {
  successfulSolve = false;
  startTime = Date.now();
  stopwatchInterval = setInterval(updateStopwatch, 17);
  isStopwatchRunning = true;
}
function generateStopwatchString() {
  const elapsedTime = Date.now() - startTime;
  const milliseconds = Math.floor(elapsedTime);
  const seconds = Math.floor(elapsedTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const displayMilliseconds = milliseconds % 1000;
  const displaySeconds = seconds % 60;
  const displayMinutes = minutes % 60;
  const displayHours = hours % 24;
  return `${String(displayHours).padStart(2, "0")}:${String(
    displayMinutes
  ).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}:${String(
    displayMilliseconds
  ).padStart(3, "0")}`;
}
function updateStopwatch() {
  document.getElementById("stopwatch").textContent = generateStopwatchString();
}
function stopAndResetStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
  document.getElementById("stopwatch").textContent = "00:00:00:000";
  isStopwatchRunning = false;
  successfulSolve = false;
}
function resetHighlights() {
  puzzles[puzzleSelector.value].resetHighlights();
}
function reset() {
  scramblenotation.innerHTML = "";
  ready = false;
  stopAndResetStopwatch();
  puzzles[puzzleSelector.value].reset();
  resetHighlights();
}

function checkSolved() {
  let stopwatchstring = generateStopwatchString();
  let input = puzzles[puzzleSelector.value].linkedtris;
  for (let i = 0; i < input.length; i++) {
    for (let j = 1; j < input[i].length; j++) {
      if (
        document
          .getElementById(input[i][j])
          .getAttribute(attributeForCheckingColor) !==
        document
          .getElementById(input[i][j - 1])
          .getAttribute(attributeForCheckingColor)
      ) {
        return;
      }
    }
  }
  document.getElementById(
    "solvetime"
  ).textContent = `Solved in ${stopwatchstring}`;
  stopAndResetStopwatch();
  ready = false;
  successfulSolve = true;
}
function handleKeydown(event) {
  if (event.repeat === true) {
    return;
  }
  resetHighlights();
  const perm = puzzles[puzzleSelector.value].getPermutation();
  if (ready === false) {
    puzzles[puzzleSelector.value].handleKeydown(event);
  } else if (isStopwatchRunning) {
    puzzles[puzzleSelector.value].handleKeydown(event);
    checkSolved();
  } else if (successfulSolve) {
    puzzles[puzzleSelector.value].handleKeydown(event);
  } else {
    startStopwatch();
    puzzles[puzzleSelector.value].handleKeydown(event);
  }
  puzzles[puzzleSelector.value].updateHighlights(perm);
}
function handleKeyup(event) {
  puzzles[puzzleSelector.value].handleKeyup(event);
}
function scramble() {
  reset();
  puzzles[puzzleSelector.value].randomize();
  ready = true;
  successfulSolve = false;
  resetHighlights();
}
function handlePhoneButton() {
  resetHighlights();
  const perm = puzzles[puzzleSelector.value].getPermutation();
  if (ready === false) {
    // puzzles[puzzleSelector.value].handleKeydown(event);
  } else if (isStopwatchRunning) {
    // puzzles[puzzleSelector.value].handleKeydown(event);
    checkSolved();
  } else if (successfulSolve) {
    // puzzles[puzzleSelector.value].handleKeydown(event);
  } else {
    startStopwatch();
    // puzzles[puzzleSelector.value].handleKeydown(event);
  }
  puzzles[puzzleSelector.value].updateHighlights(perm);
}
function updateControls() {
  let currentPuzzle = puzzles[puzzleSelector.value];
  console.log("updating controls", currentPuzzle);
  const controlsContainer = document.getElementById("controlscontainer");
  controlsContainer.innerHTML = "";

  if (currentPuzzle.controls) {
    currentPuzzle.controls.forEach((c) => {
      let button = document.createElement("button");
      button.innerText = c.text;
      button.onclick = () => {
        resetHighlights();
        const perm = currentPuzzle.getPermutation();

        if (!isStopwatchRunning && !successfulSolve) {
          startStopwatch();
        }

        c.onClick.call(currentPuzzle);

        if (isStopwatchRunning) {
          checkSolved();
        }

        currentPuzzle.updateHighlights(perm);
      };
      controlsContainer.appendChild(button);
    });
  }
}

document.getElementById("scramble").addEventListener("click", scramble);
document.getElementById("reset").addEventListener("click", reset);
document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);
document
  .getElementById("puzzleselector")
  .addEventListener("change", function () {
    updatePuzzleSelection();
  });
document
  .getElementById("versionselector")
  .addEventListener("change", function () {
    updateVersionSelection();
  });
updatePuzzleSelection();
