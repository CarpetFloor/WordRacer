pages[currentPage].activeScripts.push(function() {
    let game = null;
    
    let debug = false;
    let over = false;
    let mobile = false;
    let mobileInput = "";

    function random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    // instructions modal
    let paused = false;

    document.querySelector(".help").addEventListener("click", openInstructions);
    function openInstructions() {
        document.querySelector(".instructionsModal").style.display = "flex";
    }

    document.querySelector(".closeModal").addEventListener("click", closeInstructions);
    function closeInstructions() {
        document.querySelector(".instructionsModal").style.display = "none";
    }

    let anagramElem = document.querySelector("#anagram");

    const acceptedKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    let inputElem = document.querySelector("#wordInput");
    let inputPlaceholder = true;

    // normal input
    document.body.addEventListener("keypress", (e) => {
        processNormalInput(e);
    });

    let guess = "";
    function processNormalInput(e) {
        let inputRef = e.key;
        if(mobile) {
            inputRef = mobileInput;
        }

        if(!(paused) && !(over)) {
            if(inputRef == "Enter") {
                guess = inputElem.getHTML();
                socket.emit("check for valid scramble word", mygame.host, inputElem.getHTML());
            }
            else if((inputElem.getHTML()).length < 14) {
                if(acceptedKeys.includes((inputRef).toLowerCase())) {
                    if(inputPlaceholder) {
                        inputElem.innerText = "";
                        inputPlaceholder = false;
                        inputElem.style.fontWeight = "bold";
                    }

                    inputElem.innerText += (inputRef).toUpperCase();
                }
            }
        }
    }

    // controls inputs
    document.body.addEventListener("keydown", (e) => {
        processControlInput(e);
    });

    function processControlInput(e) {
        let inputRef = e.key;
        if(mobile) {
            inputRef = mobileInput;
        }

        if(!(paused) && !(over)) {
            if(inputRef == "ArrowLeft") {
                inputPlaceholder = true;
                inputElem.innerText = "Enter word...";
                inputElem.style.fontWeight = "normal";
            }
            else if((inputRef == "Backspace") && ((inputElem.getHTML()).length > 0) && !(inputPlaceholder)) {
                let sub = inputElem.innerText.substring(0, inputElem.innerText.length - 1);
                inputElem.innerText = sub;

                if(sub.length == 0) {
                    inputPlaceholder = true;
                    inputElem.innerText = "Enter word...";
                    inputElem.style.fontWeight = "normal";
                }
            }
        }
    }

    socket.on("invalid word", () => {
        invalidInputAnimation.animate();
    });

    socket.on("valid word found", (wordFound) => {
        let elem = document.createElement("p");
        elem.style.display = "none";
        elem.innerText = wordFound;

        if(wordFound == guess) {
            document.querySelector("#myWords").appendChild(elem);
    
            inputPlaceholder = true;
            inputElem.innerText = "Enter word...";
            inputElem.style.fontWeight = "normal";
        }
        else {
            document.querySelector("#opponentWords").appendChild(elem);
        }

        validInputAnimation(elem);
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

    function mobileResponsiveness() {
        if(window.innerHeight > window.innerWidth) {
            mobile = true;

            document.querySelector("#anagram").style.marginLeft = "0.5em"
            
            document.querySelector(".top").style.height = "10vh";
            document.querySelector("h1").style.marginTop = "5vh";
            
            document.querySelector("#wordInput").style.position = "absolute";
            document.querySelector("#wordInput").style.bottom = "20vh";
            
            document.querySelector(".mobileWordInput").style.display = "flex";

            document.querySelector(".content").style.height = "32em";
            document.querySelector(".closeModal").style.setProperty("margin-left", "15em", "important");
        }
        else if(window.innerWidth < 1000) {
            window.alert("Please use portrait mode - this game was not designed for landscape mode");
        }
    }
    mobileResponsiveness();

    function addMobileControlListeners() {
        let container = document.querySelector(".mobileWordInput");

        for(let div = 0; div < container.children.length; div++) {
            let inputs = container.children[div].children;

            for(let i = 0; i < inputs.length; i++) {
                let character = inputs[i].getHTML();
                let control = false;
                
                switch(character) {
                    case "ENTER":
                        character = "Enter";
                        break;
                    case "DEL":
                        character = "Backspace";
                        control = true;
                        break;
                }

                inputs[i].addEventListener("click", () => {
                    mobileInput = character;

                    if(control) {
                        processControlInput("");
                    }
                    else {
                        processNormalInput("");
                    }
                })
            }
        }
    }

    socket.emit("loaded game page", mygame.host);

    socket.on("game has started", (gameData) => {
        game = gameData;
        // console.log(game);

        for(let i = 0; i < mygame.players.length; i++) {
            if(mygame.players[i] != myid) {
                otherIndex = i;
                document.querySelector("#opponentName").innerText = playersMap.get(mygame.players[i]) + "'s Words";
            }
        }

        let word = game.anagram;

        let letters = word.split("");
        for(let i = 0; i < word.length; i++) {
            let index = random(0, letters.length)
            let letter = letters[index];
            letters.splice(index, 1);

            anagramElem.innerText += letter;
        }

        if(mobile) {
            addMobileControlListeners();
        }
    });

    socket.on("time update", (time) => {
        if(time == 0) {
            over = true;

            let myTotal = document.querySelector("#myWords").childElementCount;
            let opponentTotal = document.querySelector("#opponentWords").childElementCount;

            if(myTotal > opponentTotal) {
                document.querySelector("#timer").style.backgroundColor = "#49d197";
                document.querySelector("#timer").innerText = "You Win!"

                document.querySelector("#timer").style.width = "3em";
                document.querySelector("#timer").style.textAlign = "center";
            }
            else if(myTotal < opponentTotal) {
                document.querySelector("#timer").style.backgroundColor = "#d1496a";
                document.querySelector("#timer").innerText = "You Lose!"

                document.querySelector("#timer").style.width = "3em";
                document.querySelector("#timer").style.textAlign = "center";
            }
            else {
                document.querySelector("#timer").innerText = "Tie!"
            }

            document.querySelector("#backButton").style.opacity = "1";
            document.querySelector("#backButton").style.pointerEvents = "auto";
        }
        else {
            document.querySelector("#timer").innerText = time + "s";
        }
    });

    socket.on("game removed", () => {
        globalErrorMessage.message = "The game has ended due to the other player losing connection.";
        globalErrorMessage.show = true;
        loadPage(0);
    });
});
pages[currentPage].activeScripts[pages[currentPage].activeScripts.length - 1]();