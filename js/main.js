import { formatTime } from "./utils.js";
import { getStoredBestWPM, setStoredBestWPM } from "./storage.js";
import { calculateWPM, calculateAccuracy } from "./stats.js";
import { state } from "./state.js";

let textsData = {}; 

fetch('./data.json')
    .then(res => res.json())
    .then(data => {
        textsData = data;
        initDifficultyButtons();
        initModeButtons(); 
        loadRandomTest();
        
        state.bestWPM = getStoredBestWPM(); 
        updateBestWPMUI();
    });

function initDifficultyButtons() {
    document.querySelectorAll('.difficulty-options .selection-btn')
        .forEach(btn => {
            btn.addEventListener('click', () => {
                syncDifficultyUI(btn);
            });
        });
}

function initModeButtons() {
    document.querySelectorAll('.mode-options .selection-btn')
        .forEach(btn => {
            btn.addEventListener('click', () => {
                syncModeUI(btn); 
            });
        });
}

function syncDifficultyUI(selectedBtn) {
    if (state.ongoingTest) return;
    if (selectedBtn.dataset.difficulty === state.currentDifficulty) return;

    state.currentDifficulty = selectedBtn.dataset.difficulty; 

    document.querySelectorAll('.difficulty-options .selection-btn')
        .forEach(btn => {
            btn.classList.toggle(
                'active',
                btn.dataset.difficulty === state.currentDifficulty
            );
        });

    document.querySelectorAll('#difficulty-dropdown .dropdown-item')
        .forEach(item => {
            item.classList.toggle(
                'active',
                item.dataset.difficulty === state.currentDifficulty
            );
        });

    const difficultyDropdownBtn = document.querySelector('#difficulty-dropdown-btn span');
    difficultyDropdownBtn.textContent =
        state.currentDifficulty.charAt(0).toUpperCase() + state.currentDifficulty.slice(1);

    loadRandomTest();
}

function syncModeUI(selectedBtn) {
    if (state.ongoingTest) return;
    if (selectedBtn.dataset.mode === state.currentMode) return;

    state.currentMode = selectedBtn.dataset.mode;

    // Desktop buttons
    document.querySelectorAll('.mode-options .selection-btn')
        .forEach(btn => {
            btn.classList.toggle(
                'active',
                btn.dataset.mode === state.currentMode
            );
        });

    // Dropdown items
    document.querySelectorAll('#mode-dropdown .dropdown-item')
        .forEach(item => {
            item.classList.toggle(
                'active',
                item.dataset.mode === state.currentMode
            );
        });

    // Dropdown label
    const modeDropdownBtn = document.querySelector('#mode-dropdown-btn span');
    modeDropdownBtn.textContent =
        state.currentMode.charAt(0).toUpperCase() + state.currentMode.slice(1);

    resetStats(); 
}

const dropdownBtns = document.querySelectorAll(".dropdown-btn"); 
dropdownBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const menu = btn.nextElementSibling; 
        menu.classList.toggle('show'); 
    });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu')
        .forEach(menu => menu.classList.remove('show'));
  }
});

const dropdownItems = document.querySelectorAll('.dropdown-item');
dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
        const menu = item.closest(".dropdown-menu");
        const difficulty = item.dataset.difficulty; 
        const mode = item.dataset.mode; 


        if (difficulty === state.currentDifficulty || mode === state.currentMode) return;
        if (difficulty) syncDifficultyUI(item); 
        if (mode) syncModeUI(item); 

        menu.classList.remove('show');
    });
});

const testWpmElement = document.getElementById('wpm'); 
const testAccuracyElement = document.getElementById('accuracy');
const testTimeElement = document.getElementById('time'); 
const restartContainerEl = document.getElementById('restart-container'); 
const restartTestBtnEl = document.getElementById('restart-test-btn'); 
const resultsIconEl = document.querySelector(".results-screen #results-icon");
const textDisplayEl = document.getElementById('text-display');
const finalAccuracyEl = document.querySelector('#final-accuracy'); 

function resetStats() {
    state.wpm = 0; 
    state.accuracy = 100;
    state.incorrectCount = 0; 
    state.typedCount = 0;

    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }

    testWpmElement.textContent = 0;
    testAccuracyElement.textContent = "100%";
    testTimeElement.textContent = state.currentMode === "timed" ? "0:60" : "∞";

    resultsIconEl.classList.remove("completed-border");

    const starOverlayEl = document.getElementById('stars-overlay');
    starOverlayEl.classList.remove('show');

    testAccuracyElement.classList.remove('accuracy-imperfect', 'accuracy-perfect'); 
    testTimeElement.style.color = "hsl(0, 0%, 100%)"; 
}

function loadRandomTest() {
    const possibleTests = textsData[state.currentDifficulty]; 
    const randomIndex = Math.floor(Math.random() * possibleTests.length);
    const randomText = possibleTests[randomIndex].text;

    resetStats(); 
    textDisplayEl.innerHTML=""; 

    randomText.split('').forEach(char => {
        const span = document.createElement('span'); 
        span.textContent = char; 
        textDisplayEl.append(span); 
    });

    const spans = document.querySelectorAll('#text-display span');
    spans[0].classList.add('active-letter'); 
}

function startTest () {
    state.ongoingTest = true;

    restartTestBtnEl.blur();
    restartContainerEl.classList.remove('hidden'); 

    state.currentSpanNumber = 0; 
    state.startTime = Date.now(); 

    document.querySelectorAll('.selection-btn').forEach(btn => {
        btn.classList.add('disabled'); 
    });

    state.wpmUpdater = setInterval(() => {
        if (state.ongoingTest) {
            const elapsedTimeInSeconds = (Date.now() - state.startTime) / 1000; 
            const correctCount = state.typedCount - state.incorrectCount;
            state.wpm = calculateWPM(correctCount, elapsedTimeInSeconds); 
            testWpmElement.textContent = state.wpm; 
        }
    }, 1000);

    testAccuracyElement.textContent = "100%";
    if (state.currentMode === "timed") { 
        testTimeElement.textContent = `${formatTime(60)}`;
        state.timer = setInterval(() => {
            const elapsedTimeInSeconds = (Date.now() - state.startTime) / 1000;   
            const remainingTime = Math.max(60 - Math.floor(elapsedTimeInSeconds), 0); 
            testTimeElement.textContent = formatTime(remainingTime);

            if (remainingTime <= 5) {
                testTimeElement.style.color = "hsl(354, 63%, 57%)"; // red
            } else if (remainingTime <= 45) {
                testTimeElement.style.color = "hsl(49, 85%, 70%)"; // yellow
            } else {
                testTimeElement.style.color = "hsl(0, 0%, 100%)"; // white
            }

            if (remainingTime === 0 && state.ongoingTest) {
                finishTest(); 
            }

        }, 1000);
    } else {
        testTimeElement.textContent = "∞";
    }
}

function finishTest() {
    stopTimers(); 
    state.ongoingTest = false;
    changeScreen();
    updateFinalStatsUI();
    updateAccuracyUI();
    handleBestWPM(); 
}

function updateAccuracyUI() {
    finalAccuracyEl.classList.remove('accuracy-imperfect','accuracy-perfect');

    if (state.accuracy === 100) {
        finalAccuracyEl.classList.add('accuracy-perfect');
    } else {
        finalAccuracyEl.classList.add('accuracy-imperfect');
    }
}

function updateFinalStatsUI() {
    const finalWpm = document.querySelector('#final-wpm'); 
    const finalCorrect = document.querySelector('#final-correct'); 
    const finalIncorrect = document.querySelector('#final-incorrect'); 
    
    finalWpm.textContent = state.wpm;
    finalCorrect.textContent = state.typedCount - state.incorrectCount;
    finalIncorrect.textContent = state.incorrectCount;

    document.querySelectorAll('.selection-btn').forEach(btn => btn.classList.remove('disabled'));

    finalAccuracyEl.textContent = `${state.accuracy}%`; 
}

function stopTimers() {
    if (state.timer) {
        clearInterval(state.timer); 
        state.timer = null;
    }
    if (state.wpmUpdater) {
        clearInterval(state.wpmUpdater); 
        state.wpmUpdater = null;
    }
}

function changeScreen() {
    document.querySelector('.test-screen').classList.toggle('hidden');
    document.querySelector('.results-screen').classList.toggle('hidden');
}

function handleBestWPM() {
    const storedBest = getStoredBestWPM(); 
    const isNewRecord = storedBest === null || state.wpm > storedBest;
    
    if (isNewRecord) setBestWPM(); 
    
    if (storedBest === null) {
        setResultsUI({
            icon: "assets/images/icon-completed.svg",
            header: "Baseline Established",
            subheader: "You've set the bar. Now the real challenge begins—time to beat it.",
            buttonText: "Beat This Score",
            border: true
        });
        showStars();
    } else if (state.wpm > storedBest) {
        setResultsUI({
            icon: "assets/images/icon-new-pb.svg",
            header: "High score smashed!",
            subheader: "You're getting faster. That was incredibly typing.",
            buttonText: "Beat This Score",
            border: false
        });
        showConfetti();
    } else {
        setResultsUI({
            icon: "assets/images/icon-completed.svg",
            header: "Test Complete!",
            subheader: "Solid run. Keep pushing to beat your high score.",
            buttonText: "Go again",
            border: true
        });
        showStars();
    }
}

function updateBestWPMUI() {
    const bestWpmEl = document.querySelector("#best-wpm");
    bestWpmEl.textContent = state.bestWPM !== null ? `${state.bestWPM} WPM` : "0 WPM";
}

function setBestWPM() {
    state.bestWPM = state.wpm;
    setStoredBestWPM(state.bestWPM); 
    updateBestWPMUI();
}

function setResultsUI({icon, header, subheader, buttonText, border=false}) {
    const resultsHeaderEl = document.querySelector(".results-header h1");
    const resultsSubheaderEl = document.querySelector(".results-header p");
    const newTestBtnEl = document.getElementById('new-test-btn'); 

    resultsIconEl.src = icon; 
    resultsIconEl.classList.toggle("completed-border", border);
    resultsHeaderEl.textContent = header; 
    resultsSubheaderEl.textContent = subheader; 
    newTestBtnEl.querySelector('span').textContent = buttonText; 
}

function showConfetti() {
    const confettiOverlayEl = document.getElementById('confetti-overlay');
    confettiOverlayEl.classList.add('show'); 

    setTimeout(() => {
        confettiOverlayEl.classList.remove('show'); 
    }, 3000);
}

function showStars() {
    const starOverlayEl = document.getElementById('stars-overlay');
    starOverlayEl.classList.add('show');
}

document.addEventListener('keydown', (e) => {
    const spans = document.querySelectorAll('#text-display span')
    const currentSpan = spans[state.currentSpanNumber]; 
    const previousSpan = spans[state.currentSpanNumber - 1]; 

    if (e.repeat) return; 
    if (!state.ongoingTest) return;
    const ignoredKeys = ['Shift', 'Alt', 'Control', 'Tab', 'CapsLock', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (ignoredKeys.includes(e.key)) return; 

    if (e.key === 'Backspace') {
        if (state.currentSpanNumber === 0) return; 
        previousSpan?.classList.add('active-letter');
        currentSpan?.classList.remove('active-letter'); 
        previousSpan?.classList.remove('incorrect', 'correct');
        state.currentSpanNumber--; 
        return; 
    }

    // Check if the pressed key matches the current character
    if(currentSpan?.textContent === e.key) {
        currentSpan?.classList.add('correct'); 
        currentSpan?.classList.remove('active-letter'); 
    } else {
        currentSpan?.classList.add('incorrect'); 
        currentSpan?.classList.remove('active-letter'); 
        state.incorrectCount++; 
    }

    // If it's the last character, finish the test
    if (state.currentSpanNumber === spans.length -1) {
        finishTest();
        return; 
    }
    // Statistics
    state.typedCount++;
    state.accuracy = calculateAccuracy(state.typedCount, state.incorrectCount); 
    testAccuracyElement.textContent = `${state.accuracy}%`; 

    testAccuracyElement.classList.remove('accuracy-imperfect', 'accuracy-perfect'); 
    if (state.accuracy === 100) {
        testAccuracyElement.classList.add('accuracy-perfect'); 
    } else {
        testAccuracyElement.classList.add('accuracy-imperfect');
    }
    state.currentSpanNumber++; 
    spans[state.currentSpanNumber]?.classList.add('active-letter'); 
});

/* Event listeners for buttons */

// Start test button on the start screen
document.getElementById('start-test-container').addEventListener('click', ()=>{
    document.getElementById('start-test-container').classList.add('hidden'); 
    startTest();
});

// Restart test button on the test screen
document.getElementById('restart-test-btn').addEventListener('click',() => {
    loadRandomTest();
    if (state.ongoingTest) startTest();
});

// New test button on the results screen
document.getElementById('new-test-btn').addEventListener('click', () => {
    loadRandomTest();
    changeScreen();
    document.getElementById('start-test-container').classList.remove('hidden'); 
});