// Get document element
const textDisplay = document.querySelector('#text-display');
const inputField = document.querySelector('#input-field');
const resultsDisplay = document.querySelector('#results');

// Initialize typing mode variables
let typingMode = 'word';
let wordCount;
let timeCount;

// Initialize dynamic variables
let randomWords = [];
let wordList = [];
let currentWordIdx = 0;
let correctChars = 0;
let startDate = 0;
let timer;
let testActive = false;
let inputRegex = /^[a-zA-Z0-9.,;:'"]$/;

// Get cookies
getCookie('language') === '' ? setLanguage('english') : setLanguage('english');
getCookie('wordCount') === '' ? setWordCount(50) : setWordCount(getCookie('wordCount'));
getCookie('timeCount') === '' ? setTimeCount(60) : setTimeCount(getCookie('timeCount'));
getCookie('typingMode') === '' ? setTypingMode('word') : setTypingMode(getCookie('typingMode'));
// Find a list of words and display it to textDisplay
function setText(e) {
    e = e || window.event;
    var keepWordList = e && e.shiftKey;

    // Reset
    if (!keepWordList) {
        wordList = [];
    }
    currentWordIdx = 0;
    correctChars = 0;
    testActive = false;
    clearTimeout(timer);

    inputField.removeAttribute("disabled");
    inputField.value = '';
    inputField.className = '';
    resultsDisplay.style.display = 'none';
    textDisplay.style.display = 'block';
    textDisplay.innerHTML = '';

    switch (typingMode) {
        case 'word':
            if (!keepWordList) {
                wordList = [];
                while (wordList.length < wordCount) {
                    const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
                    if (wordList[wordList.length - 1] !== randomWord || wordList[wordList.length - 1] === undefined) {
                        wordList.push(randomWord);
                    }
                }
            }
            document.querySelector(`#countdown`).innerHTML = wordList.length;
            break;

        case 'time':
            document.querySelector(`#countdown`).innerHTML = timeCount;
            if (!keepWordList) {
                wordList = [];
                for (i = 0; i < 500; i++) {
                    let n = Math.floor(Math.random() * randomWords.length);
                    wordList.push(randomWords[n]);
                }
            }
    }

    showText();
    inputField.focus();
}

// Display text to textDisplay
function showText() {
    wordList.forEach(word => {
        let span = document.createElement('span');
        span.innerHTML = word;
        textDisplay.appendChild(span);
    });
    textDisplay.firstChild.classList.add('highlight');
}

// Key is pressed in input field
inputField.addEventListener('keydown', e => {
    // Add wrong class to input field
    switch (typingMode) {
        case 'word':
            if (currentWordIdx < wordList.length)
                evalInput();
        case 'time':
            if (testActive)
                evalInput();
    }
    function evalInput() {
        if (e.key === 'Backspace') {
            let inputWordSlice = e.ctrlKey ? '' : inputField.value.slice(0, inputField.value.length - 1);
            let currentWordSlice = wordList[currentWordIdx].slice(0, inputWordSlice.length);
            inputField.className = inputWordSlice === currentWordSlice ? '' : 'wrong';
        } else if (e.key === ' ') {
            inputField.className = '';
        } else {
            let inputWordSlice = inputField.value + e.key;
            let currentWordSlice = wordList[currentWordIdx].slice(0, inputWordSlice.length);
            inputField.className = inputWordSlice === currentWordSlice ? '' : 'wrong';
        }
    }

    if (currentWordIdx === 0
        && inputField.value === ''
        && inputRegex.test(e.key)
        && !testActive) {
        testActive = true;
        switch (typingMode) {
            case 'word':
                startDate = Date.now();
                break;
            case 'time':
                startTimer(timeCount);
                function startTimer(time) {
                    if (time > 0) {
                        document.querySelector(`#countdown`).innerHTML = time;
                        timer = setTimeout(() => {
                            time = (time - .1).toFixed(1);
                            startTimer(time);
                        }, 100);
                    } else {
                        testActive = false;
                        document.querySelector(`#countdown`).innerHTML = timeCount;
                        showResult();
                    }
                }
        }
    }

    // If it is the space key check the word and add correct/wrong class
    if (e.key === ' ') {
        e.preventDefault();

        if (inputField.value !== '') {
            // If it is not the last word increment currentWord,
            if (currentWordIdx < wordList.length - 1) {
                //check if we've gotten to newline
                const currentWordPosition = textDisplay.childNodes[currentWordIdx].getBoundingClientRect();
                const nextWordPosition = textDisplay.childNodes[currentWordIdx + 1].getBoundingClientRect();
                if (currentWordPosition.top < nextWordPosition.top) {
                    // maybe "slide" the old row up
                    for (i = 0; i < currentWordIdx + 1; i++) textDisplay.childNodes[i].style.display = 'none';
                }
                
                if (inputField.value === wordList[currentWordIdx]) {
                    textDisplay.childNodes[currentWordIdx].classList.add('correct');
                    correctChars += wordList[currentWordIdx].length + 1;
                } else {
                    textDisplay.childNodes[currentWordIdx].classList.add('wrong');
                }
                textDisplay.childNodes[currentWordIdx].classList.remove('highlight');
                textDisplay.childNodes[currentWordIdx + 1].classList.add('highlight');
            } else if (currentWordIdx === wordList.length - 1) {
                // this should only be hit if the user hits space and mistypes the last word lol
                textDisplay.childNodes[currentWordIdx].classList.add('wrong');
                showResult();
            }

            inputField.value = '';
            currentWordIdx++;
            if (typingMode === 'word')
                document.querySelector(`#countdown`).innerHTML = wordList.length - currentWordIdx;
        }
    }
});

inputField.addEventListener('keyup', e => {
    if (currentWordIdx === wordList.length -1) {
        if (inputField.value === wordList[currentWordIdx]) {
            textDisplay.childNodes[currentWordIdx].classList.add('correct');
            correctChars += wordList[currentWordIdx].length;
            currentWordIdx++;
            if (typingMode === 'word')
                document.querySelector(`#countdown`).innerHTML = wordList.length - currentWordIdx;
            showResult();
        }
    }
})

// Calculate and display result
function showResult() {
    inputField.setAttribute('disabled', 'disabled');
    textDisplay.style.display = 'none';
    resultsDisplay.style.display = "block";
    let words, minute, acc;
    let totalChars = -1;
    switch (typingMode) {
        case 'word':
            words = correctChars / 5;
            minute = (Date.now() - startDate) / 1000 / 60;
            wordList.forEach(e => (totalChars += e.length + 1));
            acc = Math.floor((correctChars / totalChars) * 100);
            break;

        case 'time':
            words = correctChars / 5;
            minute = timeCount / 60;
            for (i = 0; i < currentWordIdx; i++) {
                totalChars += wordList[i].length + 1;
            }
            acc = Math.min(Math.floor((correctChars / totalChars) * 100), 100);
    }
    let wpm = Math.floor(words / minute);

    document.querySelector('#results').innerHTML = `WPM: ${wpm} / ACC: ${acc}`;
}

function setLanguage(_lang) {
    const lang = _lang.toLowerCase();
    fetch(`words/${lang}.json`)
        .then(response => response.json())
        .then(json => {
            if (typeof json[lang] !== 'undefined') {
                randomWords = json[lang];
                setCookie('language', lang, 90);

                setText();
            } else {
                console.error(`language ${lang} is undefine`);
            }
        })
        .catch(err => console.error(err));
}

function setTypingMode(_mode) {
    const mode = _mode.toLowerCase();
    document.querySelectorAll('#test-type > span').forEach(e => (e.style.borderBottom = ''));
    document.querySelector(`#tt-${mode}`).style.borderBottom = '2px solid';
    typingMode = mode;
    setCookie('typingMode', mode, 90);
    
    switch (mode) {
        case 'word':
            document.querySelector('#word-count').style.display = 'inline';
            document.querySelector('#time-count').style.display = 'none';
            setText();
            break;
        case 'time':
            document.querySelector('#word-count').style.display = 'none';
            document.querySelector('#time-count').style.display = 'inline';
            setText();
            break;
        default:
            console.error(`mode ${mode} is undefined`);
    }
}

function setWordCount(wc) {
    wordCount = wc;
    setCookie('wordCount', wc, 90);
    document.querySelectorAll('#word-count > span').forEach(e => (e.style.borderBottom = ''));
    document.querySelector(`#wc-${wordCount}`).style.borderBottom = '2px solid';
    document.querySelector(`#countdown`).innerHTML = wc;
    setText();
}

function setTimeCount(tc) {
    timeCount = tc;
    setCookie('timeCount', tc, 90);
    document.querySelectorAll('#time-count > span').forEach(e => (e.style.borderBottom = ''));
    document.querySelector(`#tc-${timeCount}`).style.borderBottom = '2px solid';
    document.querySelector(`#countdown`).innerHTML = tc;
    setText();
}

// cookie related functions

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}