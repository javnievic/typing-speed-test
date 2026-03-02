let currentDifficulty = "easy"; 
let currentMode = "timed";

let ongoingTest = false; 

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
    textDisplay.textContent = randomTest['text']; 
}


document.getElementById('start-test-btn').addEventListener('click', () => {
    ongoingTest = true; 
    startTest()
})