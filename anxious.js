"use strict";
/*
 * Assignment 3: Functional Prototype
 * ----------------------------------
 * Programming 2024, Interaction Design Bachelor, Malmö University
 *
 * This assignment is written by:
 * Lucja Stozek
 */

/**
 * Represents character (letter)
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
 * @property {number} descender
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
 * @property {HTMLElement} background
 * @property {HTMLElement} body
 * @property {number} angle
 * @property {Word} initialWord
 * @property {string} fontSettings
 * @property {number} maxFidgetingDifference
 */

/**
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
 * @type {Settings}
 */
const settings = Object.freeze({
  heading: document.querySelector("#heading"),
  headingsContainer: document.querySelector("#headings-container"),
  sentencesContainer: document.querySelector("#sentences-container"),
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
      descender: -203,
    },
  ],
  fontSettings: "'YTUC' 528, 'YTLC' 570, 'YTAS' 649, 'YTDE' -98",
  maxFidgetingDifference: 200,
});

/**
 * Update the state object with the properties included in `newState`.
 * @param {Object} newState An object with the properties to update in the state object.
 */
function updateState(newState) {
  state = Object.freeze(Object.assign(Object.assign({}, state), newState));
}

/**
 * Updates charsPerSecond based on startTime and charCounter
 */
function updateCharsPerSecond() {
  const { startTime, charCounter } = state;

  // get elapsed seconds from startTime to now
  const timeElapsed = (Date.now() - startTime) / 1000;

  updateState({
    charsPerSecond: charCounter / timeElapsed,
  });
}

/**
 * Updates heartRate based on anxietyLevel
 */
function updateHeartRate() {
  const { anxietyLevel } = state;

  updateState({
    heartRate: 100 + Math.floor(anxietyLevel),
  });
}

/**
 * Transforms data.
 * Runs every frame.
 */
function update() {
  updateHeadingFontSize();
  updateCharsPerSecond();
  updateHeartRate();
  updateHeartBeatInterval();

  window.requestAnimationFrame(update);
}

/**
 * Picks a random element from an array
 * @template T
 * @param {Array.<T>} arr
 * @returns {T}
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Seeded Math.random() equivalent
 * @param {number} seed
 * @returns number
 */
function random(seed) {
  const x = Math.sin(seed) * 10000;

  return x - Math.floor(x);
}

/**
 * Shakes the document's body on the vertical axis
 */
function shake() {
  const { anxietyLevel } = state;
  const { body } = settings;

  const shakingValue = anxietyLevel * 0.1;

  body.style.transform = `translate(0, ${Math.random() * shakingValue - shakingValue / 2}px)`;
}

/**
 * Returns `num` normalized to 0..1 in range min..max.
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

/**
 * Prints heading
 */
function useHeading() {
  const { heading, fontSettings } = settings;
  const { words, fontSize } = state;
  const headingText = words[0];

  heading.replaceChildren();

  // add all characters to the heading
  for (const char of headingText) {
    const character = document.createElement("span");

    // apply styling
    character.classList.add("heading-character", "char");
    character.style.backgroundColor = `var(--gray)`;
    character.style.opacity = char.opacity;
    character.style.fontVariationSettings = `'wght' ${char.headingWeight}, 'yopq' ${char.thinStroke}, 'GRAD' ${char.grade}, ${fontSettings}`;
    character.style.transform = `rotate(${char.rotation}deg)`;

    // add text content
    character.innerHTML = char.letter;

    // add character to the heading
    heading.appendChild(character);
  }

  heading.style.fontSize = `${fontSize}px`;
}

/**
 * Prints sentence
 * @param {Array<Word>} sentence
 * @param {number} index
 */
function useSentence(sentence, index) {
  const { sentencesContainer, angle } = settings;

  // create sentence element
  const sentenceElement = document.createElement("p");
  sentenceElement.classList.add("sentence");

  // get sentence seed
  let sentenceSeed = 1;

  if (sentence[0] !== undefined) {
    sentenceSeed = sentence[0][0].seed;
  }

  // get position of the sentence

  let x;
  let y = (index * 50) % window.innerHeight;
  const diagonalX = y / Math.tan(angle);

  // get the x position which enables greater width of the sentence
  if (window.innerWidth / 2 > diagonalX) {
    x = map(
      Math.round(sentenceSeed) % (window.innerWidth * 0.8),
      0,
      window.innerWidth * 0.8,
      diagonalX + 300,
      diagonalX + 350
    );

    sentenceElement.style.maxWidth = `${window.innerWidth - x - 50}px`;
  } else {
    x = map(
      Math.round(sentenceSeed) % (window.innerWidth * 0.8),
      0,
      window.innerWidth * 0.8,
      0,
      50
    );

    sentenceElement.style.maxWidth = `${diagonalX - x - 300}px`;
  }

  // position element on (x, y) coordinates
  sentenceElement.style.transform = `translate(${x}px, ${y}px)`;

  // add all words to the sentence
  for (const word of sentence) {
    const wordElement = document.createElement("span");
    wordElement.classList.add("word");

    // add all chars to the word
    for (const char of word) {
      // create a character element
      const charElement = document.createElement("span");

      // apply styling
      charElement.classList.add("char");
      charElement.style.fontVariationSettings = `'wght' ${char.sentenceWeight}, 'yopq' ${char.thinStroke}, 'GRAD' ${char.grade}, 'YTDE' ${char.descender}`;

      // add text
      charElement.innerText = char.letter;

      wordElement.append(charElement);
    }

    wordElement.append(" ");
    sentenceElement.append(wordElement);
  }

  sentencesContainer.appendChild(sentenceElement);
}

/**
 * Prints background words
 */
function useBackgroundWords() {
  const { background } = settings;
  const { sentences } = state;

  // reset the background words if the screen is full
  if (background.offsetHeight > window.innerHeight + 50) {
    background.innerHTML = "";
  }

  // pick word with "mistake"
  const randomSentence = pick(sentences);
  const randomWord = pick(randomSentence);

  // add words to the background
  for (const word of randomSentence) {
    // check if word is the one with mistake
    if (word === randomWord) {
      const mistake = document.createElement("span");

      mistake.classList.add("mistake");

      for (const char of word) {
        const charElement = document.createElement("span");

        charElement.style.fontVariationSettings = `'wght' ${char.wordWeight}, 'GRAD' ${char.grade}, 'YTDE' ${char.descender}`;

        charElement.innerText = char.letter;

        mistake.appendChild(charElement);
      }
      background.append(mistake);
    } else {
      const text = word.map((char) => char.letter).join("");

      background.append(text);
    }

    background.append(" ");
  }
}

/**
 * Outputs the data.
 * Runs every frame.
 */
function use() {
  const { sentences, heartRate } = state;
  const { sentencesContainer } = settings;

  // shake if heartRate is over 130
  if (heartRate > 130) {
    shake();
  }

  useHeading();

  // clear sentences
  sentencesContainer.innerHTML = "";
  // re-print sentences
  sentences.forEach(useSentence);

  window.requestAnimationFrame(use);
}

/**
 * Gets weight within the given range based on time elapsed since previous activity.
 * @param {number} minWeight
 * @param {number} maxWeight
 * @returns {number}
 */
function getWeight(minWeight, maxWeight) {
  const { latestActivity } = state;

  // get time elapsed (in seconds) since the latest activity
  const timeElapsed = (Date.now() - latestActivity) / 1000;

  // returns weight between maxWeight and minWeight
  return map(timeElapsed, 0, 1, maxWeight, minWeight);
}

/**
 * Checks if the user is fidgeting (performing repetetive actions with keyboard)
 * @returns {boolean}
 */
function isFidgeting() {
  const { maxFidgetingDifference } = settings;
  const { keyPressesHistory } = state;

  const lastPresses = keyPressesHistory.slice(-5);
  const times = [];

  // get times between the presses
  for (let i = 1; i < lastPresses.length; i++) {
    const time = lastPresses[i] - lastPresses[i - 1];

    times.push(time);
  }

  const differences = [];

  // get differences between the times
  for (let i = 1; i < times.length; i++) {
    const diff = Math.abs(times[i] - times[i - 1]);

    differences.push(diff);
  }

  // get max difference from differences
  const maxDiff = differences.sort((a, b) => b - a)[0];

  return maxDiff <= maxFidgetingDifference;
}

/**
 * Updates the heading font size for heading to fit the screen
 */
function updateHeadingFontSize() {
  const { heading, maxWidth } = settings;
  const { fontSize } = state;

  // decrease fontSize if the heading doesn't fit the screen
  if (heading.offsetWidth > maxWidth * 0.8 && fontSize > 0) {
    updateState({ fontSize: fontSize - 1 });
  }
}

/**
 * Adds new character to the newest word or creates a new word
 * @param {KeyboardEvent} e
 */
function updateWords(e) {
  const { words, charCounter, anxietyLevel } = state;
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

    // add new letter to the last word
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
      descender: map(anxietyLevel, 10, 35, -98, -305),
    });

    updateState({
      words: [...words.slice(0, -1), newestWord],
      charCounter: charCounter + 1,
    });
  }
}

/**
 * Updates sentences based on words
 */
function updateSentences() {
  const { words } = state;
  let newSentences = [];

  newSentences.push([]);

  // get sentences from words
  for (const word of words.slice(1)) {
    newSentences[newSentences.length - 1].push(word);

    // end sentence (= create a new one) if the word ends with period, exclamation or question mark
    if (/[.!?]/.test(word[word.length - 1].letter)) {
      newSentences.push([]);
    }
  }

  updateState({
    sentences: newSentences,
  });
}

/**
 * Updates font grading so it changes between -200 and 150 with every heart beat
 */
function updateFontGrading() {
  const { words, sentences } = state;

  /**
   * Deep copy of words
   * @type {Word[]}
   */
  const updatedWords = JSON.parse(JSON.stringify(words));

  /**
   * Deep copy of sentences
   * @type {Word[][]}
   */
  const updatedSentences = JSON.parse(JSON.stringify(sentences));

  // switch grading of words
  for (const word of updatedWords) {
    for (const char of word) {
      const newGrade = char.grade === -200 ? 150 : -200;
      char.grade = newGrade;
    }
  }

  // switch grading of sentences
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

/**
 * Updates the heart beat interval based on heartRate
 */
function updateHeartBeatInterval() {
  const { heartBeatInterval, heartRate } = state;

  if (heartBeatInterval === undefined) {
    // create a new interval if it doesn't exist
    const newInterval = setInterval(() => {
      updateFontGrading();
    }, 50000 / heartRate);

    updateState({
      heartBeatInterval: {
        interval: newInterval,
        heartRate: heartRate,
      },
    });
  } else if (heartBeatInterval.heartRate !== heartRate) {
    // remove previous interval if heartRate changed
    clearInterval(heartBeatInterval.interval);

    // create a new interval with updated heartRate
    const newInterval = setInterval(() => {
      updateFontGrading();
    }, 50000 / heartRate);

    updateState({
      heartBeatInterval: {
        interval: newInterval,
        heartRate: heartRate,
      },
    });
  }
}

/**
 * Updates the interval responsible for adding new words to the background.
 * Sets delay based on current heartRate.
 */
function updateBackgroundInterval() {
  const { heartRate, backgroundInterval } = state;

  if (backgroundInterval === undefined) {
    // create a new interval if it doesn't exist
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

/**
 * Performs clean-up of unused background interval
 */
function clearBackgroundInterval() {
  const { backgroundInterval } = state;

  if (backgroundInterval !== undefined) {
    clearInterval(backgroundInterval);
    updateState({ backgroundInterval: undefined });
  }
}

/**
 * Updates key presses history.
 * Decreases anxietyLevel if user is fidgeting.
 */
function updateKeyPressesHistory() {
  const { keyPressesHistory, anxietyLevel } = state;

  // add new timestamp to the history
  updateState({
    keyPressesHistory: [...keyPressesHistory, Date.now()],
  });

  // decrease anxietyLevel if the user is fidgeting
  if (isFidgeting()) {
    updateState({
      anxietyLevel: anxietyLevel - 0.1,
    });
  }
}

/**
 * Sets everything up.
 * Runs once, at the start of the program.
 */
function setup() {
  const { angle, headingsContainer, initialWord, maxWidth } = settings;

  // initialize words
  updateState({
    words: [[...initialWord]],
  });

  // style headings container so it is positioned on the diagonal of the screen
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

setup();
