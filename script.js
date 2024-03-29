let t,
  wrongAttempt = 0,
  wordLocation = "./wordLists/",
  audioLocation = "./sounds/",
  wrong = 0,
  wrongAttemptAccuracy = 0;

let wpm = JSON.parse(window.localStorage.getItem("wpm"))
  ? JSON.parse(window.localStorage.getItem("wpm"))
  : [];

let accuracy = JSON.parse(window.localStorage.getItem("accuracy"))
  ? JSON.parse(window.localStorage.getItem("accuracy"))
  : [];

const promiseA = new Promise(async (resolve, reject) => {
  let words;

  let wordsPromise = await fetch(wordLocation + "words.txt");
  if (wordsPromise.ok) {
    let wordsString = await wordsPromise.text();
    words = wordsString.split("\n");
    resolve(words);
  }
  reject("Failed");
});
window.onload = async function () {
  t = new Date();
  changeWord();
  liveWPM();
  averageOnLoad();
  myRange.value = window.localStorage.getItem("limit");
};

async function changeWord() {
  let words = await promiseA;
  wrong = 0;
  let wordString = "";

  document.getElementById("max").innerHTML =
    "Word Length:" + document.getElementById("myRange").value;

  for (let i = 0; i < 5; i++) {
    let j = words.length;
    while (true) {
      let wordTest = words[getRandomInt(words.length - 1)];
      if (wordTest.length == document.getElementById("myRange").value) {
        wordString += wordTest.toLowerCase() + " ";
        break;
      }
      if (j == 0) {
        wordString = "No words";
        break;
      }

      j--;
    }

    if (j == 0) break;
  }

  document.getElementById("hiddenWord").innerHTML = wordString;
  makeGreen();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function tryWord(doc) {
  makeGreen();
  let tmp = new Date();
  //console.log(doc.value.length);
  if (doc.value.length == 1) {
    t = new Date();
    //console.log("New date");
  }

  if (
    checkWordAtLength(
      document.getElementById("hiddenWord").innerHTML.length - 1
    )
  ) {
    //console.log(doc.value.length / (tmp.getTime() - t.getTime()));
    let wordsUnit = (doc.value.length - 1) / 5;

    let secondsUnit = (tmp.getTime() - t.getTime()) / 1000;

    let minutesUnit = secondsUnit / 60;

    wpm.push(wordsUnit / minutesUnit);
    let yourAccuracy =
      100 -
      (wrong / document.getElementById("hiddenWord").innerHTML.length) * 100;

    //console.log(wordsUnit / minutesUnit);
    if (wpm.length > 75) wpm.shift();
    let color = wordsUnit / minutesUnit >= average(wpm) ? "green" : "red";
    let colorAccuracy = yourAccuracy >= average(accuracy) ? "green" : "red";

    document.getElementById("wpm").innerHTML =
      '<a style="color: ' +
      color +
      ';">' +
      (wordsUnit / minutesUnit).toFixed(1) +
      "</a>" +
      " (Average: " +
      average(wpm).toFixed(1) +
      ")";

    let myRange = document.getElementById("myRange");
    accuracy.push(yourAccuracy);

    //console.log(wordsUnit / minutesUnit);
    if (accuracy.length > 75) accuracy.shift();
    console.log(yourAccuracy);
    document.getElementById("accuracy").innerHTML =
      '<a style="color: ' +
      colorAccuracy +
      ';">' +
      yourAccuracy.toFixed(1) +
      "%</a>" +
      " (Average: " +
      average(accuracy).toFixed(1) +
      "%)";

    if (color == "green") {
      myRange.value = myRange.value - -1; // Funkar inte med + 1
      //console.log("Added");
      let audio = new Audio(audioLocation + "success.mp3");
      audio.play();
      wrongAttempt = 0;
    }
    if (color == "red") {
      wrongAttempt++;
      if (wrongAttempt > 1) myRange.value = myRange.value - 1;
      //console.log("Removed");
      let audio = new Audio(audioLocation + "fail.mp3");
      audio.play();
    }
    changeWord();
    doc.value = "";
    t = new Date();

    window.localStorage.setItem("wpm", JSON.stringify(wpm));
    window.localStorage.setItem("accuracy", JSON.stringify(accuracy));

    window.localStorage.setItem("limit", myRange.value);
  }
}

async function makeGreen() {
  /*document.getElementById("word").innerHTML = document.getElementById(
      "hiddenWord"
    ).innerHTML;*/

  let inputLength = document.getElementById("input").value.length;

  let wordLength = document.getElementById("hiddenWord").innerHTML.length;

  let color;

  if (checkWordAtLength(inputLength)) {
    color = "green";
  } else {
    if (document.getElementById("hardMode").checked) {
      console.log(document.getElementById("input").value)

    }
    let audio = new Audio(audioLocation + "error.mp3");
    audio.play();
    wrong++;
    console.log(wrong);
    color = "red";
    document.getElementById("input").className = "redText";
    setTimeout(function () {
      document.getElementById("input").className = "normalText";
    }, 300);
  }

  document.getElementById(
    "word"
  ).innerHTML = `<a style="color: ${color}">${document
    .getElementById("hiddenWord")
    .innerHTML.substring(0, inputLength)}</a><a>${document
      .getElementById("hiddenWord")
      .innerHTML.substring(inputLength, wordLength)}</a>`;
}

function checkWordAtLength(len) {
  return (
    document.getElementById("input").value.toLowerCase() ==
    document.getElementById("hiddenWord").innerHTML.substring(0, len)
  );
}

function liveWPM() {
  if (document.getElementById("input").value.length > 0) {
    let tmp = new Date();
    let wordsUnit = (document.getElementById("input").value.length - 1) / 5;

    let secondsUnit = (tmp.getTime() - t.getTime()) / 1000;

    let minutesUnit = secondsUnit / 60;

    document.getElementById("live").innerHTML =
      "Live WPM: " + (wordsUnit / minutesUnit).toFixed(1);
  } else {
    if (document.getElementById("live").innerHTML != "LiveWPM: N/A") {
      document.getElementById("live").innerHTML = "LiveWPM: N/A";
    }
  }

  setTimeout(function () {
    liveWPM();
  }, 300);
}

function averageOnLoad() {
  if (wpm.length > 0) {
    document.getElementById("wpm").innerHTML =
      "N/A" + " (Average: " + average(wpm).toFixed(1) + ")";
  }
  if (accuracy.length > 0) {
    document.getElementById("accuracy").innerHTML =
      "<a>" +
      "N/A" +
      "</a>" +
      " (Average: " +
      average(accuracy).toFixed(1) +
      ")";
  }
}

function average(array) {
  const total = array.reduce((acc, c) => acc + c, 0);
  return total / array.length;
}

//let average = (array) => array.reduce((a, b) => a + b) / array.length;
