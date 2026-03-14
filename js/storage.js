export function getStoredBestWPM() {
    const storedBest = localStorage.getItem("bestWPM"); 
    return storedBest !== null ? Number(storedBest) : null; 
}

export function setStoredBestWPM(wpm) {
    localStorage.setItem("bestWPM", wpm);
}