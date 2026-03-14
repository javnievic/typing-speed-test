export function calculateWPM(correctCount, elapsedSeconds) {
        // WPM
        // (Total characters typed ÷ 5) ÷ Time in minutes - ref: https://typingspeedhub.com/average-typing-speed-statistics-2024.html
    return Math.round((correctCount / 5) /  (elapsedSeconds / 60)); 
}

export function calculateAccuracy(typed, incorrect) {
    return Math.round(((typed - incorrect) / typed) * 100); 
}