let currentDifficulty = "easy"; 
let currentMode = "timed";

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
    console.log(textsData[currentDifficulty]) 
}