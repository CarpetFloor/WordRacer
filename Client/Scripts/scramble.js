let debug = false;
let over = false;

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// instructions modal
let paused = false;

function openInstructions() {
    paused = true;
    document.querySelector(".instructionsModal").style.display = "flex";
}

function closeInstructions() {
    paused = false;
    document.querySelector(".instructionsModal").style.display = "none";
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
    if(!(paused) && !(over)) {
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

    let addedWordElem = null;
    
    if(valid && (wordsList.indexOf(inputted.toLowerCase()) != -1) && (inputted.length > 1)) {
        if(!(foundWords.includes(inputted))) {
            foundWords.push(inputted);

            let elem = document.createElement("p");
            elem.style.display = "none";
            elem.innerText = inputted;
            document.querySelector("#words").appendChild(elem);

            addedWordElem = elem;

            inputPlaceholder = true;
            inputElem.innerText = "Enter word...";
            inputElem.style.fontWeight = "normal";
        }
        else {
            valid = false;
        }
    }
    else {
        valid = false;
    }

    // invalid word input animation
    if(!(valid)) {
        invalidInputAnimation.animate();
    }
    else {
        validInputAnimation(addedWordElem);
    }
}

// controls inputs
document.body.addEventListener("keydown", (e) => {
    if(!(paused) && !(over)) {
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
    }
});

let invalidInputAnimation = {
    interval: null,
    // when animation is over, but need to glide back to center
    reseting: false,
    // full shake counts as move left to max dist, then right to max dist
    shakeCount: 0,
    shakeMaxCount: 1,
    // in em
    shakeMaxDist: 0.7,
    shakeIncrement: 0.22,
    shakeDist: 0,
    // if shaking to the left
    left: true,
    debug: false,
    animate: () => {
        let ref = invalidInputAnimation;
        
        if(ref.debug) {
            console.log("animation called");
        }

        if(ref.interval != null) {
            window.clearInterval(ref.interval);
        }
    
        ref.over = false;
        ref.shakeCount = 0;
        ref.shakeDist = 0;

        ref.interval = window.setInterval(() => {
            if(ref.debug) {
                console.log("in animation")
            }

            if(ref.over) {
                ref.shakeDist += ref.shakeIncrement * -1;

                if(ref.shakeDist <= 0) {
                    inputElem.style.marginLeft = "0";
                    window.clearInterval(ref.interval);
                }
                else {
                    inputElem.style.marginLeft = ref.shakeDist + "em";
                }
            }
            else {
                let multiply = 1;
                if(ref.left) {
                    multiply = -1;
                }

                ref.shakeDist += ref.shakeIncrement * multiply;

                if(ref.debug) {
                    console.log(ref.shakeCount, ref.shakeDist, ref.shakeMaxDist);
                }

                if(Math.abs(ref.shakeDist) > ref.shakeMaxDist) {
                    ref.shakeDist = ref.shakeMaxDist * multiply;
                    
                    if(ref.left) {
                        ref.left = false;
                    }
                    else {
                        ref.left = true;
                        ++ref.shakeCount;

                        if(ref.shakeCount == ref.shakeMaxCount) {
                            ref.over = true;
                        }
                    }
                }
                else {
                    inputElem.style.marginLeft = ref.shakeDist + "em";
                }

            }

        }, 1000 / 60);
    }
};


function validInputAnimation(elem) {
    // in em
    let leftMargin = -2;
    let leftMarginIncrement = 0.3;
    let opacity = 0;
    let opacityIncrement = 0.1;

    elem.style.marginLeft = leftMargin + "em";
    elem.style.display = "block";

    let interval = window.setInterval(() => {
        leftMargin += leftMarginIncrement;
        opacity += opacityIncrement;
        
        if(leftMargin >= 0) {
            elem.style.marginLeft = "0";
            elem.style.opacity = "1";

            window.clearInterval(interval);
        }
        else {
            elem.style.marginLeft = leftMargin + "em";
            elem.style.opacity = opacity + "em";
        }
        
    }, 1000 / 60);
}

let time = 30;
let timerElem = document.querySelector("#timer");
let interval = window.setInterval(() => {
    if(!(paused)) {
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

        if(time == 0) {
            over = true;
            window.clearInterval(interval);
            timerElem.style.marginLeft = "1em";
            timerElem.style.marginTop = "0.5em";
            timerElem.style.marginBottom = "-0.5em";
            timerElem.style.fontSize = "1.75em";
            
            let wordCount = document.querySelector("#words").childElementCount;
            let wordText = " word";
            if(wordCount > 1) {
                wordText += "s";
            }
            timerElem.innerText = wordCount + wordText;

            timerElem.style.backgroundColor = "var(--colorMain)";
            timerElem.style.width = "fit-content"
        }
    }
}, 1000);