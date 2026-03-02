let currentDifficulty = "easy"; 
let currentMode = "timed";

let textsData = {}; 

fetch('./data.json')
    .then(res => res.json())
    .then(data => {
        textsData = data;
        console.log(textsData);
        initDifficultyButtons()
    })

function initDifficultyButtons() {
    const buttons = document.querySelectorAll('.selection-btn')
    console.log(buttons)
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active'); 
        })
    })

}