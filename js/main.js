import { formatTime } from "./utils.js";
import { getStoredBestWPM, setStoredBestWPM } from "./storage.js";
import { calculateWPM, calculateAccuracy } from "./stats.js";
import { state } from "./state.js";
import { DOM } from "./dom.js"

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
    DOM.difficulty.buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            syncDifficultyUI(btn);
        });
    });
}

function initModeButtons() {
    DOM.mode.buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            syncModeUI(btn); 
        });
    });
}

function syncDifficultyUI(selectedBtn) {
    if (state.ongoingTest) return;
    if (selectedBtn.dataset.difficulty === state.currentDifficulty) return;

    state.currentDifficulty = selectedBtn.dataset.difficulty; 

    DOM.difficulty.buttons.forEach(btn => {
        btn.classList.toggle(
            'active',
            btn.dataset.difficulty === state.currentDifficulty
        );
    });

    DOM.difficulty.dropdownItems.forEach(item => {
        item.classList.toggle(
            'active',
            item.dataset.difficulty === state.currentDifficulty
        );
    });

    DOM.difficulty.dropdownLabel.textContent =
        state.currentDifficulty.charAt(0).toUpperCase() + state.currentDifficulty.slice(1);

    loadRandomTest();
}

function syncModeUI(selectedBtn) {
    if (state.ongoingTest) return;
    if (selectedBtn.dataset.mode === state.currentMode) return;

    state.currentMode = selectedBtn.dataset.mode;

    DOM.mode.buttons.forEach(btn => {
        btn.classList.toggle(
            'active',
            btn.dataset.mode === state.currentMode
        );
    });

    DOM.mode.dropdownItems.forEach(item => {
        item.classList.toggle(
            'active',
            item.dataset.mode === state.currentMode
        );
    });

    DOM.mode.dropdownLabel.textContent =
        state.currentMode.charAt(0).toUpperCase() + state.currentMode.slice(1);

    resetStats(); 
}

const dropdownBtns = DOM.dropdown.buttons; 
dropdownBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const menu = btn.nextElementSibling; 
        menu.classList.toggle('show'); 
    });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
      DOM.dropdown.menus.forEach(menu => menu.classList.remove('show'));
  }
});

DOM.dropdown.items.forEach(item => {
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

function resetStats() {
    state.wpm = 0; 
    state.accuracy = 100;
    state.incorrectCount = 0; 
    state.typedCount = 0;

    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }

    DOM.stats.wpm.textContent = 0;
    DOM.stats.accuracy.textContent = "100%";
    DOM.stats.time.textContent = state.currentMode === "timed" ? "0:60" : "∞";

    DOM.results.icon.classList.remove("completed-border");
    DOM.overlays.stars.classList.remove('show');

    DOM.stats.accuracy.classList.remove('accuracy-imperfect', 'accuracy-perfect'); 
    DOM.stats.time.style.color = "hsl(0, 0%, 100%)"; 
}

function loadRandomTest() {
    const possibleTests = textsData[state.currentDifficulty]; 
    const randomIndex = Math.floor(Math.random() * possibleTests.length);
    const randomText = possibleTests[randomIndex].text;

    resetStats(); 
    DOM.test.textDisplay.innerHTML=""; 

    randomText.split('').forEach(char => {
        const span = document.createElement('span'); 
        span.textContent = char; 
        DOM.test.textDisplay.append(span); 
    });

    const spans = DOM.test.textDisplay.querySelectorAll('span');
    spans[0].classList.add('active-letter'); 
}

function startTest () {
    state.ongoingTest = true;

    DOM.test.restartBtn.blur();
    DOM.test.restartContainer.classList.remove('hidden'); 

    state.currentSpanNumber = 0; 
    state.startTime = Date.now(); 

    DOM.buttons.selection.forEach(btn => {
        btn.classList.add('disabled'); 
    });

    state.wpmUpdater = setInterval(() => {
        if (state.ongoingTest) {
            const elapsedTimeInSeconds = (Date.now() - state.startTime) / 1000; 
            const correctCount = state.typedCount - state.incorrectCount;
            state.wpm = calculateWPM(correctCount, elapsedTimeInSeconds); 
            DOM.stats.wpm.textContent = state.wpm; 
        }
    }, 1000);

    DOM.stats.accuracy.textContent = "100%";

    if (state.currentMode === "timed") { 
        DOM.stats.time.textContent = `${formatTime(60)}`;
        state.timer = setInterval(() => {
            const elapsedTimeInSeconds = (Date.now() - state.startTime) / 1000;   
            const remainingTime = Math.max(60 - Math.floor(elapsedTimeInSeconds), 0); 
            DOM.stats.time.textContent = formatTime(remainingTime);

            if (remainingTime <= 5) {
                DOM.stats.time.style.color = "hsl(354, 63%, 57%)";
            } else if (remainingTime <= 45) {
                DOM.stats.time.style.color = "hsl(49, 85%, 70%)";
            } else {
                DOM.stats.time.style.color = "hsl(0, 0%, 100%)";
            }

            if (remainingTime === 0 && state.ongoingTest) {
                finishTest(); 
            }

        }, 1000);

    } else {
        DOM.stats.time.textContent = "∞";
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
    DOM.results.finalAccuracy.classList.remove('accuracy-imperfect','accuracy-perfect');

    if (state.accuracy === 100) {
        DOM.results.finalAccuracy.classList.add('accuracy-perfect');
    } else {
        DOM.results.finalAccuracy.classList.add('accuracy-imperfect');
    }
}

function updateFinalStatsUI() {
    DOM.results.finalWpm.textContent = state.wpm;
    DOM.results.finalCorrect.textContent = state.typedCount - state.incorrectCount;
    DOM.results.finalIncorrect.textContent = state.incorrectCount;

    DOM.buttons.selection.forEach(btn => btn.classList.remove('disabled'));

    DOM.results.finalAccuracy.textContent = `${state.accuracy}%`; 
}

function stopTimers() {
    if (state.timer) clearInterval(state.timer);
    if (state.wpmUpdater) clearInterval(state.wpmUpdater);
    state.timer = state.wpmUpdater = null;
}

function changeScreen() {
    DOM.screens.test.classList.toggle('hidden');
    DOM.screens.results.classList.toggle('hidden');
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
    DOM.stats.bestWpm.textContent =
        state.bestWPM !== null ? `${state.bestWPM} WPM` : "0 WPM";
}

function setBestWPM() {
    state.bestWPM = state.wpm;
    setStoredBestWPM(state.bestWPM); 
    updateBestWPMUI();
}

function setResultsUI({icon, header, subheader, buttonText, border=false}) {
    DOM.results.icon.src = icon; 
    DOM.results.icon.classList.toggle("completed-border", border);
    DOM.results.header.textContent = header; 
    DOM.results.subheader.textContent = subheader; 
    DOM.results.newTestBtn.querySelector('span').textContent = buttonText; 
}

function showConfetti() {
    DOM.overlays.confetti.classList.add('show'); 
    setTimeout(() => DOM.overlays.confetti.classList.remove('show'), 3000);
}

function showStars() {
    DOM.overlays.stars.classList.add('show');
}

document.addEventListener('keydown', (e) => {
    const spans = DOM.test.textDisplay.querySelectorAll('span');
    const currentSpan = spans[state.currentSpanNumber]; 
    const previousSpan = spans[state.currentSpanNumber - 1]; 

    if (e.repeat || !state.ongoingTest) return;

    const ignoredKeys = ['Shift','Alt','Control','Tab','CapsLock','Meta','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
    if (ignoredKeys.includes(e.key)) return; 

    if (e.key === 'Backspace') {
        if (state.currentSpanNumber === 0) return; 
        previousSpan?.classList.add('active-letter');
        currentSpan?.classList.remove('active-letter'); 
        previousSpan?.classList.remove('incorrect', 'correct');
        state.currentSpanNumber--; 
        return; 
    }

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

    // Statistics updates
    state.typedCount++;
    state.accuracy = calculateAccuracy(state.typedCount, state.incorrectCount); 
    DOM.stats.accuracy.textContent = `${state.accuracy}%`; 
    DOM.stats.accuracy.classList.remove('accuracy-imperfect','accuracy-perfect'); 
    DOM.stats.accuracy.classList.add(state.accuracy === 100 ? 'accuracy-perfect' : 'accuracy-imperfect');

    state.currentSpanNumber++; 
    spans[state.currentSpanNumber]?.classList.add('active-letter'); 
});
/* Event listeners for buttons */

// Start test button on the start screen
DOM.test.startContainer.addEventListener('click', ()=>{
    DOM.test.startContainer.classList.add('hidden'); 
    startTest();
});

// Restart test button on the test screen
DOM.test.restartBtn.addEventListener('click',() => {
    loadRandomTest();
    if (state.ongoingTest) startTest();
});

// New test button on the results screen
DOM.results.newTestBtn.addEventListener('click', () => {
    loadRandomTest();
    changeScreen();
    DOM.test.startContainer.classList.remove('hidden'); 
});