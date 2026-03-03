let currentDifficulty = "easy"; 
let currentMode = "timed";

let ongoingTest = false; 
let currentSpanNumber = 0; 
let incorrectCount = 0; 
let typedCount = 0; 
let startTime = null;
let timer = null;

let textsData = {}; 

fetch('./data.json')
    .then(res => res.json())
    .then(data => {
        textsData = data;
        console.log(textsData);
        initDifficultyButtons();
        initModeButtons(); 
    })

function initSelectionButton(classSelector, onSelect) {
    const buttons = document.querySelector(classSelector).querySelectorAll('.selection-btn'); 

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active'); 
            onSelect(btn);
        })
    })
}

function initDifficultyButtons() {
    initSelectionButton('.difficulty', (btn) => {
        currentDifficulty = btn.dataset.difficulty; 
    })
}

function initModeButtons() {
    initSelectionButton('.mode', (btn) => {
        currentMode = btn.dataset.mode; 
    })
}

const wpmElement = document.getElementById('wpm'); 
const accuracyElement = document.getElementById('accuracy');
const timeElement = document.getElementById('time')

function startTest () {
    const possibleTests = textsData[currentDifficulty]; 
    const randomIndex = Math.floor(Math.random() * possibleTests.length); 
    const randomTest = possibleTests[randomIndex]; 
    const textDisplay = document.getElementById('text-display'); 
    textDisplay.innerHTML = ""; 
    randomTest.text.split('').forEach(char => {
        const span=document.createElement('span');
        span.textContent = char; 
        textDisplay.append(span)
    })
    const spans = document.querySelectorAll('#text-display span');
    spans[0].classList.add('active-letter'); 
    

    currentSpanNumber = 0; 
    incorrectCount = 0; 
    typedCount = 0; 
    startTime = Date.now(); 

    // Initialize elements
    wpmElement.textContent = 0;
    accuracyElement.textContent = "100%";
    if (currentMode === "timed") { 
        timeElement.textContent = "60s";
        timer = setInterval(() => {
            const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;   
            const remainingTime = Math.max(60 - Math.floor(elapsedTimeInSeconds), 0); 
            timeElement.textContent = `${remainingTime}s`;
            if (remainingTime === 0) {
                clearInterval(timer); 
            }
            
        }, 1000)
    } else {
        timeElement.textContent = "∞";
    }

}

document.addEventListener('keydown', (e) => {
    const spans = document.querySelectorAll('#text-display span')
    const currentSpan = spans[currentSpanNumber]; 
    const nextSpan = spans[currentSpanNumber + 1]; 
    const previousSpan = spans[currentSpanNumber - 1]; 

    if (e.repeat) return; // Ignore key holds, because of a spacing bug that increases the wpm
    if (!ongoingTest) return;
    const ignoredKeys = ['Shift', 'Alt', 'Control', 'Tab', 'CapsLock', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (ignoredKeys.includes(e.key)) return; 

    if (e.key === 'Backspace') {
        if (previousSpan?.classList.contains('incorrect')) {
            previousSpan.classList.remove('incorrect');
            previousSpan.classList.add('active-letter');
            currentSpan.classList.remove('active-letter'); 
            currentSpanNumber--; 
        }
        return; 
    }

    if(currentSpan.textContent === e.key) {
        currentSpan.classList.add('correct'); 
        currentSpan.classList.remove('active-letter'); 

        if (currentSpanNumber === spans.length -1) {
        // TODO - go to the statistics page
        }
    } else {
        currentSpan.classList.add('incorrect'); 
        currentSpan.classList.remove('active-letter'); 
        incorrectCount++; 
    }


    nextSpan?.classList.add('active-letter'); 

    // Statistics 

    typedCount++;
    // Accuracy
    const accuracy = typedCount > 0 ? Math.round(((typedCount - incorrectCount) / typedCount) * 100) : 0;
    accuracyElement.textContent = `${accuracy}%`; 

    // WPM
    // (Total characters typed ÷ 5) ÷ Time in minutes - ref: https://typingspeedhub.com/average-typing-speed-statistics-2024.html

    const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
    const correctCount = typedCount - incorrectCount;
    const wpm = (correctCount / 5) /  (elapsedTimeInSeconds / 60); 
    
    wpmElement.textContent = Math.round(wpm); 
    
    currentSpanNumber++; 
})


document.getElementById('start-test-btn').addEventListener('click', () => {
    ongoingTest = true; 
    startTest()
})