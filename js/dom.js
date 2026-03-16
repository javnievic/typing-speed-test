export const DOM = {
  stats: {
    wpm: document.getElementById("wpm"),
    accuracy: document.getElementById("accuracy"),
    time: document.getElementById("time"),
    bestWpm: document.getElementById("best-wpm")
  },

  test: {
    textDisplay: document.getElementById("text-display"),
    restartContainer: document.getElementById("restart-container"),
    restartBtn: document.getElementById("restart-test-btn"),
    startContainer: document.getElementById("start-test-container")
  },

  results: {
    icon: document.querySelector(".results-screen #results-icon"),
    header: document.querySelector(".results-header h1"),
    subheader: document.querySelector(".results-header p"),
    finalWpm: document.getElementById("final-wpm"),
    finalCorrect: document.getElementById("final-correct"),
    finalIncorrect: document.getElementById("final-incorrect"),
    finalAccuracy: document.getElementById("final-accuracy"),
    newTestBtn: document.getElementById("new-test-btn")
  },

  overlays: {
    stars: document.getElementById("stars-overlay"),
    confetti: document.getElementById("confetti-overlay")
  },

  dropdown: {
    buttons: document.querySelectorAll(".dropdown-btn"),
    items: document.querySelectorAll(".dropdown-item"),
    menus: document.querySelectorAll(".dropdown-menu")
  },

  difficulty: {
    buttons: document.querySelectorAll(".difficulty-options .selection-btn"),
    dropdownItems: document.querySelectorAll("#difficulty-dropdown .dropdown-item"),
    dropdownLabel: document.querySelector("#difficulty-dropdown-btn span")
  },

  mode: {
    buttons: document.querySelectorAll(".mode-options .selection-btn"),
    dropdownItems: document.querySelectorAll("#mode-dropdown .dropdown-item"),
    dropdownLabel: document.querySelector("#mode-dropdown-btn span")
  },

  buttons: {
    selection: document.querySelectorAll(".selection-btn")
  },

  screens: {
    test: document.querySelector(".test-screen"),
    results: document.querySelector(".results-screen")
  }

};