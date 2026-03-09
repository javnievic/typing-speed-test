let currentDifficulty = "easy"; 
let currentMode = "timed";

//test state
let ongoingTest = false; 
let currentSpanNumber = 0; 
let startTime = null;
let timer = null;

//test stats
let wpm = 0; 
let accuracy = 100; 
let incorrectCount = 0; 
let typedCount = 0; 

let bestWPM = null;


let textsData = {}; 

fetch('./data.json')
    .then(res => res.json())
    .then(data => {
        textsData = data;
        initDifficultyButtons();
        initModeButtons(); 
        loadRandomTest();
        
        // TODO: This is repeated in the finish test function, can be optimized by only doing it once and updating the value when necessary
        let storedBest = localStorage.getItem("bestWPM");
        bestWPM = storedBest !== null ? Number(storedBest) : null;
        document.querySelector("#best-wmp").textContent = bestWPM !== null ? `${bestWPM} WPM` : "0 WPM";
    })

function initSelectionButton(classSelector, onSelect) {
    const selectionButtons = document.querySelector(classSelector).querySelectorAll('.selection-btn'); 

    selectionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (ongoingTest) return;
            selectionButtons.forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active'); 
            onSelect(btn);
        })
    })
}

function initDifficultyButtons() {
    initSelectionButton('.difficulty-options', (btn) => {
        if (btn.dataset.difficulty === currentDifficulty) return;
        currentDifficulty = btn.dataset.difficulty; 
        loadRandomTest();
    })
}

function initModeButtons() {
    initSelectionButton('.mode-options', (btn) => {
        currentMode = btn.dataset.mode;
    })
}

const testWpmElement = document.getElementById('wpm'); 
const testAccuracyElement = document.getElementById('accuracy');
const testTimeElement = document.getElementById('time'); 

const restartContainerEl = document.getElementById('restart-container'); 
const restartTestBtnEl = document.getElementById('restart-test-btn'); 
const resultsIconEl = document.querySelector(".results-screen #results-icon");
const textDisplayEl = document.getElementById('text-display');

function resetStats() {
    wpm = 0; 
    accuracy = 100;
    incorrectCount = 0; 
    typedCount = 0;
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    testWpmElement.textContent = 0;
    testAccuracyElement.textContent = "100%";
    testTimeElement.textContent = currentMode === "timed" ? "60s" : "∞";
    resultsIconEl.classList.remove("completed-border");

}

function loadRandomTest() {
    const possibleTests = textsData[currentDifficulty]; 
    const randomIndex = Math.floor(Math.random() * possibleTests.length);
    const randomText = possibleTests[randomIndex].text;

    resetStats(); 
    textDisplayEl.innerHTML=""; 

    randomText.split('').forEach(char => {
        const span = document.createElement('span'); 
        span.textContent = char; 
        textDisplayEl.append(span); 
    })
    
    const spans = document.querySelectorAll('#text-display span');
    spans[0].classList.add('active-letter'); 
}


function startTest () {
    ongoingTest = true;

    restartTestBtnEl.blur();
    restartContainerEl.classList.remove('hidden'); 

    currentSpanNumber = 0; 
    startTime = Date.now(); 

    document.querySelectorAll('.selection-btn').forEach(btn => {
        btn.classList.add('disabled'); 
    })
    // Initialize elements
    testAccuracyElement.textContent = "100%";
    if (currentMode === "timed") { 
        testTimeElement.textContent = "60s";
        timer = setInterval(() => {
            const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;   
            const remainingTime = Math.max(2 - Math.floor(elapsedTimeInSeconds), 0); 
            testTimeElement.textContent = `${remainingTime}s`;

            if (remainingTime <= 5) {
                testTimeElement.style.color = "hsl(354, 63%, 57%)"; // red
            } else if (remainingTime <= 45) {
                testTimeElement.style.color = "hsl(49, 85%, 70%)"; // yellow
            } else {
                testTimeElement.style.color = "hsl(0, 0%, 100%)"; // white
            }

            if (remainingTime === 0 && ongoingTest) {
                finishTest(); 
            }

        }, 1000)
    } else {
        testTimeElement.textContent = "∞";
    }
}

function finishTest() {
    if (timer) {
        clearInterval(timer); 
        timer = null;
    }

    ongoingTest = false;


    document.querySelector('.test-screen').classList.add('hidden'); 
    document.querySelector('.results-screen').classList.remove('hidden'); 
    document.querySelector('#final-wpm').textContent = wpm;

    document.querySelector('#final-correct').textContent = typedCount - incorrectCount;
    document.querySelector('#final-incorrect').textContent = incorrectCount;

    document.querySelectorAll('.selection-btn').forEach(btn => {
        btn.classList.remove('disabled'); 
    })
    
    const finalAccuracyEl = document.querySelector('#final-accuracy'); 
    finalAccuracyEl.textContent = `${accuracy}%`; 

    // TODO - Refactor with the game results header, since they are pretty much doing the same thing.
    testAccuracyElement.classList.remove('accuracy-imperfect', 'accuracy-perfect'); 
    finalAccuracyEl.classList.remove('accuracy-imperfect', 'accuracy-perfect'); 
    if (accuracy === 100) {
        finalAccuracyEl.classList.add('accuracy-perfect'); 
    } else {
        finalAccuracyEl.classList.add('accuracy-imperfect')
    }
    restartContainerEl.classList.add('hidden'); 

    
    const resultsHeaderEl = document.querySelector(".results-header h1");
    const resultsSubheaderEl = document.querySelector(".results-header p");
    let storedBest = localStorage.getItem("bestWPM");
    bestWPM = storedBest !== null ? Number(storedBest) : null;

    if (bestWPM === null) {
        resultsIconEl.src = "assets/images/icon-completed.svg"
        resultsIconEl.classList.add("completed-border");
        resultsHeaderEl.textContent = "Baseline Established"
        resultsSubheaderEl.textContent = "You've set the bar. Now the real challenge begins-time to beat it."    
        localStorage.setItem("bestWPM", wpm);
        document.querySelector("#best-wmp").textContent = `${wpm} WPM`;
    } else if (wpm > bestWPM) {
        resultsIconEl.src = "assets/images/icon-new-pb.svg"
        resultsHeaderEl.textContent = "High score smashed!"
        resultsSubheaderEl.textContent = "You're getting faster. That was incredibly typing."  
        localStorage.setItem("bestWPM", wpm);
        document.querySelector("#best-wmp").textContent = `${wpm} WPM`;
    } else {
        resultsIconEl.src = "assets/images/icon-completed.svg"
        resultsIconEl.classList.add("completed-border");
        resultsHeaderEl.textContent = "Test Complete!"
        resultsSubheaderEl.textContent = "Solid run. Keep pushing to beat your high score."    
    }
    
}

document.addEventListener('keydown', (e) => {
    const spans = document.querySelectorAll('#text-display span')
    const currentSpan = spans[currentSpanNumber]; 
    const previousSpan = spans[currentSpanNumber - 1]; 

    if (e.repeat) return; // Ignore key holds, because of a spacing bug that increases the wpm
    if (!ongoingTest) return;
    const ignoredKeys = ['Shift', 'Alt', 'Control', 'Tab', 'CapsLock', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (ignoredKeys.includes(e.key)) return; 

    if (e.key === 'Backspace') {
        if (currentSpanNumber === 0) return; 
        previousSpan?.classList.add('active-letter');
        currentSpan?.classList.remove('active-letter'); 
        previousSpan?.classList.remove('incorrect', 'correct');
        currentSpanNumber--; 
    
        return; 
    }

    // Check if the pressed key matches the current character
    if(currentSpan?.textContent === e.key) {
        currentSpan?.classList.add('correct'); 
        currentSpan?.classList.remove('active-letter'); 
    } else {
        currentSpan?.classList.add('incorrect'); 
        currentSpan?.classList.remove('active-letter'); 
        incorrectCount++; 
    }

    // If it's the last character, finish the test
    if (currentSpanNumber === spans.length -1) {
        finishTest()
        return; 
    }

    // Statistics 

    typedCount++;
    // Accuracy
    accuracy = typedCount > 0 ? Math.round(((typedCount - incorrectCount) / typedCount) * 100) : 0;
    testAccuracyElement.textContent = `${accuracy}%`; 

    testAccuracyElement.classList.remove('accuracy-imperfect', 'accuracy-perfect'); 
    if (accuracy === 100) {
        testAccuracyElement.classList.add('accuracy-perfect'); 
    } else {
        testAccuracyElement.classList.add('accuracy-imperfect')
    }

    // WPM
    // (Total characters typed ÷ 5) ÷ Time in minutes - ref: https://typingspeedhub.com/average-typing-speed-statistics-2024.html

    const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
    const correctCount = typedCount - incorrectCount;
    wpm = Math.round((correctCount / 5) /  (elapsedTimeInSeconds / 60)); 
    
    testWpmElement.textContent = wpm; 
    
    currentSpanNumber++; 
    spans[currentSpanNumber]?.classList.add('active-letter'); 

})


/*
Event listeners for buttons
*/

// Start test button on the start screen



document.getElementById('start-test-container').addEventListener('click', ()=>{
    document.getElementById('start-test-container').classList.add('hidden'); 
    startTest()
})

// Restart test button on the test screen
document.getElementById('restart-test-btn').addEventListener('click',() => {
    loadRandomTest();
    if (ongoingTest) startTest();
})

// New test button on the results screen
document.getElementById('new-test-btn').addEventListener('click', () => {
    loadRandomTest();
    document.querySelector('.results-screen').classList.add('hidden'); 
    document.querySelector('.test-screen').classList.remove('hidden');
    document.getElementById('start-test-container').classList.remove('hidden'); 
})