"use strict";
/*
 * Assignment 3: Functional Prototype
 * ----------------------------------
 * Programming 2024, Interaction Design Bachelor, Malmö University
 *
 * This assignment is written by:
 * Name Surname
 *
 *
 * The template contains some sample code exemplifying the template code structure.
 * You should use the structure with `state`, `settings`, `setup`, `update`, and `use`.
 * `scale` and `toAbsolute` are very helpful in data processing.
 *
 * For instructions, see the Canvas assignment: https://mau.instructure.com/courses/11936/assignments/84965
 * You might want to look at the Assignment examples for more elaborate starting points.
 *
 */

// The state should contain all the "moving" parts of your program, values that change.

/**
 * @typedef {Object} Character
 * @property {string} letter
 * @property {number} opacity
 * @property {number} headingWeight
 * @property {number} sentenceWeight
 * @property {number} wordWeight
 * @property {number} thinStroke
 * @property {number} rotation
 * @property {number} seed
 * @property {number} grade
 */

/**
 * @typedef {Array.<Character>} Word
 */

/**
 * @typedef {Object} HeartBeatInterval
 * @property {ReturnType<typeof setInterval>} interval
 * @property {number} heartRate
 */

/**
 * @typedef {Object} State
 * @property {Array.<Word>} words
 * @property {Array<Array.<Word>>} sentences
 * @property {number} fontSize
 * @property {number} maxWidth
 * @property {number} latestActivity
 * @property {number} startTime
 * @property {number} charCounter
 * @property {number} charsPerSecond
 * @property {number} heartRate
 * @property {ReturnType<typeof setInterval>} backgroundInterval
 * @property {HeartBeatInterval} heartBeatInterval
 * @property {number} anxietyLevel
 * @property {Array.<number>} keyPressesHistory
 */

/**
 * @typedef {Object} Settings
 * @property {HTMLElement} heading
 * @property {HTMLElement} headingsContainer
 * @property {HTMLElement} sentencesContainer
 * @property {HTMLElement} randomWordsContainer
 * @property {HTMLElement} background
 * @property {HTMLElement} body
 * @property {number} angle
 * @property {Word} initialWord
 * @property {string} fontSettings
 * @property {number} maxFidgetingDifference
 */

/**
 * Initial state with default values for the candle position, smoke traces,
 * flame intensity, and latest user activity time.
 * @type {State}
 */
let state = Object.freeze({
  words: [],
  sentences: [],
  fontSize: 160,
  latestActivity: Date.now(),
  startTime: Date.now(),
  charCounter: 0,
  charsPerSecond: 0,
  heartRate: 100,
  backgroundInterval: undefined,
  heartBeatInterval: undefined,
  anxietyLevel: 10,
  keyPressesHistory: [],
});

/**
 * Fixed settings for HTML elements and styling of the candle, flame,
 * candle body, smoke trace, and hidden text. These remain constant.
 * @type {Settings}
 */
const settings = Object.freeze({
  heading: document.querySelector("#heading"),
  headingsContainer: document.querySelector("#headings-container"),
  sentencesContainer: document.querySelector("#sentences-container"),
  randomWordsContainer: document.querySelector("#random-words-container"),
  body: document.querySelector("body"),
  background: document.querySelector("#background"),
  angle: Math.atan(window.innerHeight / window.innerWidth),
  maxWidth: Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2),
  initialWord: [
    {
      letter: "",
      opacity: 0,
      headingWeight: 400,
      sentenceWeight: 400,
      wordWeight: 400,
      thinStroke: 100,
      rotation: 0,
      seed: 1,
      grade: 0,
    },
  ],
  fontSettings: "'YTUC' 528, 'YTLC' 570, 'YTAS' 649, 'YTDE' -98",
  maxFidgetingDifference: 700,
});

/**
 * Update the state object with the properties included in `newState`.
 * @param {Object} newState An object with the properties to update in the state object.
 */
function updateState(newState) {
  state = Object.freeze(Object.assign(Object.assign({}, state), newState));
}

function updateCharsPerSecond() {
  const { startTime, charCounter } = state;

  const timeElapsed = (Date.now() - startTime) / 1000;

  updateState({
    charsPerSecond: charCounter / timeElapsed,
  });
}

function updateHeartRate() {
  const { anxietyLevel } = state;

  updateState({
    heartRate: 100 + Math.floor(anxietyLevel),
  });
}

/**
 * This is where we put the code that transforms our data.
 * update() is run every frame, assuming that we keep calling it with `window.requestAnimationFrame`.
 */
function update() {
  updateHeadingFontSize();
  updateCharsPerSecond();
  updateHeartRate();
  updateHeartBeatInterval();

  window.requestAnimationFrame(update);
}

/**
 * @template T
 * @param {Array.<T>} arr
 * @returns {T}
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function random(seed) {
  const x = Math.sin(seed) * 10000;

  return x - Math.floor(x);
}

function useHeading() {
  const { heading, fontSettings } = settings;
  const { words, fontSize } = state;
  const headingText = words[0];

  heading.replaceChildren();

  for (const char of headingText) {
    const character = document.createElement("span");
    character.classList.add("heading-character", "char");
    character.style.backgroundColor = `var(--gray)`;
    character.style.opacity = char.opacity;
    character.style.fontVariationSettings = `'wght' ${char.headingWeight}, 'yopq' ${char.thinStroke}, 'GRAD' ${char.grade}, ${fontSettings}`;
    character.innerHTML = char.letter;
    character.style.transform = `rotate(${char.rotation}deg)`;
    heading.appendChild(character);
  }

  heading.style.fontSize = `${fontSize}px`;
}

/**
 * @param {Array<Word>} sentence
 */
function useSentence(sentence) {
  const { sentencesContainer, angle } = settings;

  const sentenceElement = document.createElement("p");
  sentenceElement.classList.add("sentence");

  let sentenceSeed = 1;

  if (sentence[0] !== undefined) {
    sentenceSeed = sentence[0][0].seed;
  }

  let x = Math.round(sentenceSeed) % (window.innerWidth * 0.8);
  let y = Math.round(sentenceSeed) % (window.innerHeight - 50);

  const diagonalX = y / Math.tan(angle);

  while (Math.abs(diagonalX - x) < 300 || x < 0) {
    x += random(sentenceSeed) * 100;
  }

  if (x > window.innerWidth - 100) {
    x -= 120;
  }

  sentenceElement.style.transform = `translate(${x}px, ${y}px)`;

  for (const word of sentence) {
    const wordElement = document.createElement("span");
    wordElement.classList.add("word");

    for (const char of word) {
      const charElement = document.createElement("span");
      charElement.classList.add("char");

      charElement.innerText = char.letter;

      charElement.style.fontVariationSettings = `'wght' ${char.sentenceWeight}, 'yopq' ${char.thinStroke}, 'GRAD' ${char.grade}`;

      wordElement.append(charElement);
    }

    wordElement.append(" ");
    sentenceElement.append(wordElement);
  }

  sentencesContainer.appendChild(sentenceElement);
}

function useRandomWords() {
  const { randomWordsContainer, angle } = settings;
  const { words } = state;
  const existingRandomWords = document.querySelectorAll(".random-word");

  if (existingRandomWords.length > words.length * 0.6) {
    return;
  }

  const wordElement = document.createElement("span");

  const word = pick(words);

  wordElement.classList.add("random-word");

  for (const char of word) {
    const charElement = document.createElement("span");
    charElement.style.fontVariationSettings = `'wght' ${char.wordWeight}, 'GRAD' ${char.grade}`;
    charElement.classList.add("random-word-char", "char");
    charElement.innerText = char.letter;

    wordElement.appendChild(charElement);
  }

  let x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;

  const diagonalX = y / Math.tan(angle);

  while (Math.abs(diagonalX - x) < 300 || x < 0) {
    x += Math.random() * 100;
  }

  if (x > window.innerWidth - 100) {
    x -= 120;
  }

  wordElement.style.transform = `translate(${x}px, ${y}px)`;

  randomWordsContainer.appendChild(wordElement);
}

function useBackgroundWords() {
  const { background } = settings;
  const { sentences } = state;

  if (background.offsetHeight > window.innerHeight + 50) {
    return;
  }

  const randomSentence = pick(sentences);
  const text = randomSentence
    .map((word) => word.map((char) => char.letter).join(""))
    .join(" ");
  background.append(text + " ");
}

function clearSentences() {
  const { sentencesContainer } = settings;

  const sentencesElements = document.querySelectorAll(".sentence");

  for (const element of sentencesElements) {
    sentencesContainer.removeChild(element);
  }
}

function shake() {
  const { anxietyLevel } = state;
  const { body } = settings;

  const shakingValue = anxietyLevel * 0.1;
  const transformValue = `translate(${Math.random() * shakingValue - shakingValue / 2}px, ${Math.random() * shakingValue - shakingValue / 2}px)`;
  body.style.transform = transformValue;
}

/**
 * This is where we put the code that outputs our data.
 * use() is run every frame, assuming that we keep calling it with `window.requestAnimationFrame`.
 */
function use() {
  const { sentences, heartRate } = state;

  if (heartRate > 130) {
    shake();
  }

  useHeading();

  clearSentences();
  sentences.forEach(useSentence);

  window.requestAnimationFrame(use);
}

function updateHeadingFontSize() {
  const { heading, maxWidth } = settings;
  const { fontSize } = state;

  if (heading.offsetWidth > maxWidth * 0.8 && fontSize > 0) {
    updateState({ fontSize: fontSize - 1 });
  }
}

/**
 * Return `num` normalized to 0..1 in range min..max.
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns number
 */
function scale(num, min, max) {
  if (num < min) return 0;
  if (num > max) return 1;
  return (num - min) / (max - min);
}

/**
 * Re-maps a number from one range to another.
 * @param {number} num
 * @param {number} minNum
 * @param {number} maxNum
 * @param {number} minOutput
 * @param {number} maxOutput
 * @returns number
 */
function map(num, minNum, maxNum, minOutput, maxOutput) {
  const range = maxOutput - minOutput;

  return scale(num, minNum, maxNum) * range + minOutput;
}

function getWeight(minWeight, maxWeight) {
  const { latestActivity } = state;
  const timeElapsed = (Date.now() - latestActivity) / 1000;

  return minWeight + maxWeight - map(timeElapsed, 0, 1, minWeight, maxWeight);
}

/**
 * Adds character to the newest word or creates a new word
 * @param {KeyboardEvent} e
 */
function updateWords(e) {
  const { words, charCounter } = state;
  const { initialWord } = settings;
  if (/^(Enter|Tab| )$/.test(e.key)) {
    // create a new, empty word
    updateState({ words: [...words, [...initialWord]] });
  } else if (/^[a-zA-Z?!,.;:]$/.test(e.key)) {
    // update the newest word
    const wordsCopy = [...words];
    let newestWord = wordsCopy[wordsCopy.length - 1];

    // reset array if it's an initial word
    if (newestWord[0].letter === "") {
      newestWord = [];
    }

    newestWord.push({
      letter: e.key,
      opacity: Math.random() * 0.3 + 0.6,
      headingWeight: getWeight(800, 1000),
      sentenceWeight: getWeight(400, 600),
      wordWeight: getWeight(100, 300),
      thinStroke: Math.round(Math.random() * 110 + 25),
      rotation: Math.round(Math.random() * 20 - 10),
      seed: Math.random() * 272727,
      grade: 0,
    });

    updateState({
      words: [...words.slice(0, -1), newestWord],
      charCounter: charCounter + 1,
    });
  }
}

function updateSentences() {
  const { words } = state;
  let newSentences = [];

  newSentences.push([]);
  for (const word of words.slice(1)) {
    newSentences[newSentences.length - 1].push(word);

    if (/[.!?]/.test(word[word.length - 1].letter)) {
      newSentences.push([]);
    }
  }

  updateState({
    sentences: newSentences,
  });
}

function updateFontGrading() {
  const { words, sentences } = state;

  /**
   * @type {Word[]}
   */
  const updatedWords = JSON.parse(JSON.stringify(words));

  /**
   * @type {Word[][]}
   */
  const updatedSentences = JSON.parse(JSON.stringify(sentences));

  for (const word of updatedWords) {
    for (const char of word) {
      const newGrade = char.grade === -200 ? 150 : -200;
      char.grade = newGrade;
    }
  }

  for (const sentence of updatedSentences) {
    for (const word of sentence) {
      for (const char of word) {
        const newGrade = char.grade === -200 ? 150 : -200;
        char.grade = newGrade;
      }
    }
  }

  updateState({
    sentences: updatedSentences,
    words: updatedWords,
  });
}

function updateHeartBeatInterval() {
  const { heartBeatInterval, heartRate } = state;

  if (heartBeatInterval === undefined) {
    const newInterval = setInterval(() => {
      updateFontGrading();
      useRandomWords();
    }, 50000 / heartRate);

    updateState({
      heartBeatInterval: {
        interval: newInterval,
        heartRate: heartRate,
      },
    });
  } else if (heartBeatInterval.heartRate !== heartRate) {
    clearInterval(heartBeatInterval.interval);

    const newInterval = setInterval(() => {
      updateFontGrading();
      useRandomWords();
    }, 50000 / heartRate);

    updateState({
      heartBeatInterval: {
        interval: newInterval,
        heartRate: heartRate,
      },
    });
  }
}

function updateBackgroundInterval() {
  const { heartRate, backgroundInterval } = state;

  if (backgroundInterval === undefined) {
    const newInterval = setInterval(() => {
      const { anxietyLevel } = state;
      const incrementValue = anxietyLevel > 30 ? 0.1 : 0.5;

      updateState({
        anxietyLevel: anxietyLevel + incrementValue,
      });

      useBackgroundWords();
    }, 25000 / heartRate);

    updateState({
      backgroundInterval: newInterval,
    });
  }
}

function clearBackgroundInterval() {
  const { backgroundInterval } = state;

  if (backgroundInterval !== undefined) {
    clearInterval(backgroundInterval);
    updateState({ backgroundInterval: undefined });
  }
}

function isFidgeting() {
  const { maxFidgetingDifference } = settings;
  const { keyPressesHistory } = state;

  const lastPresses = keyPressesHistory.slice(-4);
  const differences = [];

  for (let i = 1; i < lastPresses.length; i++) {
    const diff = lastPresses[i] - lastPresses[i - 1];

    differences.push(diff);
  }

  const maxDiff = differences.sort((a, b) => b - a)[0];

  return maxDiff <= maxFidgetingDifference;
}

function updateKeyPressesHistory() {
  const { keyPressesHistory, anxietyLevel } = state;

  updateState({
    keyPressesHistory: [...keyPressesHistory, Date.now()],
  });

  if (isFidgeting()) {
    updateState({
      anxietyLevel: anxietyLevel - 0.1,
    });
  }
}

/**
 * Setup is run once, at the start of the program. It sets everything up for us!
 */
function setup() {
  const { angle, headingsContainer, initialWord, maxWidth } = settings;

  updateState({
    words: [[...initialWord]],
  });

  headingsContainer.style.transform = `rotate(${angle}rad) translate(0, -50%)`;
  headingsContainer.style.width = maxWidth;

  document.addEventListener("keydown", function (event) {
    updateWords(event);
    updateSentences();
    clearBackgroundInterval();
    updateKeyPressesHistory();
  });

  document.addEventListener("keyup", function (event) {
    updateState({
      latestActivity: Date.now(),
    });

    updateBackgroundInterval();
  });

  update();
  use();
}
setup(); // Always remember to call setup()!
