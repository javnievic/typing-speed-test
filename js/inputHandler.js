import { calculateAccuracy } from "./stats.js";

export function initTypingListener(state, DOM, finishTest) {
    document.addEventListener("keydown", (e) => {
        handleTyping(e, state, DOM, finishTest);
    });
}

function handleTyping(e, state, DOM, finishTest) {
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

}