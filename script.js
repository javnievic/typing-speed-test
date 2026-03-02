let currentDifficulty = "easy"; 
let currentMode = "timed";

let ongoingTest = false; 
let currentSpanNumber = 0; 

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

    currentSpanNumber = 0; 

}

    document.addEventListener('keydown', (e) => {
        if (!ongoingTest) return;
        const ignoredKeys = ['Shift', 'Alt', 'Control', 'Tab', 'CapsLock', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (ignoredKeys.includes(e.key)) return; 

        spans = document.querySelectorAll('#text-display span')
        const currentSpan= spans[currentSpanNumber]; 
        if(currentSpan.textContent === e.key) {
            currentSpan.classList.add('correct'); 
        } else {
            currentSpan.classList.add('incorrect'); 
        }
        currentSpanNumber++; 
    })


document.getElementById('start-test-btn').addEventListener('click', () => {
    ongoingTest = true; 
    startTest()
})