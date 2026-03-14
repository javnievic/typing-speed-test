export const state = {
  currentDifficulty: "easy",
  currentMode: "timed",

  ongoingTest: false,
  currentSpanNumber: 0,
  startTime: null,
  timer: null,
  wpmUpdater: null,

  wpm: 0,
  accuracy: 100,
  incorrectCount: 0,
  typedCount: 0,

  bestWPM: null
};