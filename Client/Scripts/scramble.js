let debug = false;

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

let anagramElem = document.querySelector("#anagram");

function generateWord() {
    let word = ""

    let attempts = 0;
    let index = -1;
    const goalWordLength = 7;

    while(word.length < goalWordLength) {
        index = random(0, wordsList.length)
        word = wordsList[index];

        if(attempts > 100) {
            break;
        }
    }
    
    if(word.length < goalWordLength) {
        while(word.length < goalWordLength) {
            ++index;
            if(index > wordsList.length - 1) {
                index = 0;
            }

            word = wordsList[index];
        }
    }
    
    word = word.toUpperCase();
    
    if(debug) {
        console.log(word);
    }
    
    let letters = word.split("");
    for(let i = 0; i < word.length; i++) {
        let index = random(0, letters.length)
        let letter = letters[index];
        letters.splice(index, 1);

        anagramElem.innerText += letter;
    }
}
generateWord();

const acceptedKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

let inputElem = document.querySelector("#wordInput");
let inputPlaceholder = true;

// normal input
document.body.addEventListener("keypress", (e) => {
    if(e.key == "Enter") {
        checkForValidWord()
    }
    else if((inputElem.getHTML()).length < 14) {
        if(acceptedKeys.includes((e.key).toLowerCase())) {
            if(inputPlaceholder) {
                inputElem.innerText = "";
                inputPlaceholder = false;
                inputElem.style.fontWeight = "bold";
            }

            inputElem.innerText += (e.key).toUpperCase();
        }
    }
});

let foundWords = [];

function checkForValidWord() {
    let wordCheck = (anagramElem.getHTML()).split("");
    let inputted = inputElem.getHTML();

    if(debug) {
        console.log("-----");
        console.log("-", wordCheck);
    }

    let valid = true;
    for(let i = 0; i < inputted.length; i++) {
        if(debug) {
            console.log(inputted[i], wordCheck);
        }

        if(wordCheck.includes(inputted[i].toUpperCase())) {
            wordCheck.splice(wordCheck.indexOf(inputted[i]), 1);
            
            if(debug) {
                console.log("+");
            }
        }
        else {
            valid = false;

            if(debug) {
                console.log("-");
            }
            break;
        }
    }

    if(debug) {
        console.log(wordsList.indexOf(inputted.toLowerCase()));
        console.log(wordsList[wordsList.indexOf(inputted.toLowerCase())]);
    }

    if(valid && (wordsList.indexOf(inputted.toLowerCase()) != -1)) {
        if(!(foundWords.includes(inputted))) {
            foundWords.push(inputted);

            let elem = document.createElement("p");
            elem.innerText = inputted;
            document.querySelector("#words").appendChild(elem);

            inputPlaceholder = true;
            inputElem.innerText = "Enter word...";
            inputElem.style.fontWeight = "normal";
        }
    }
}

// controls inputs
document.body.addEventListener("keydown", (e) => {
    if(e.key == "ArrowLeft") {
        inputPlaceholder = true;
        inputElem.innerText = "Enter word...";
        inputElem.style.fontWeight = "normal";
    }
    else if((e.key == "Backspace") && ((inputElem.getHTML()).length > 0)) {
        let sub = inputElem.innerText.substring(0, inputElem.innerText.length - 1);
        inputElem.innerText = sub;

        if(sub.length == 0) {
            inputPlaceholder = true;
            inputElem.innerText = "Enter word...";
            inputElem.style.fontWeight = "normal";
        }
    }
})

let time = 30;
let timerElem = document.querySelector("#timer");
let interval = window.setInterval(() => {
    --time;

    let padding = 0.5
    let increment = 0.035;
    let reverse = false;
    let updateInterval = window.setInterval(() => {
        if(reverse) {
            padding -= increment;
        }
        else {
            padding += increment;
        }
        
        timerElem.style.paddingLeft = padding + "em";
        timerElem.style.paddingRight = padding + "em";

        if(!(reverse)) {
            if(padding >= 0.7) {
                reverse = true;
            }
        }
        else {
            if(padding <= 0.5) {
                timerElem.style.paddingLeft = "0.5em";
                timerElem.style.paddingRight = "0.5em";
                window.clearInterval(updateInterval);
            }
        }
    }, 1000 / 60)

    timerElem.innerText = time + "s";
}, 1000);