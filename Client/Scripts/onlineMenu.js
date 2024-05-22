pages[currentPage].activeScripts.push(function() {
    // resize name change input based on name length

    let widthCalcCanvas = document.createElement("canvas");
    widthCalcCanvas.font = "Nunito";
    let widthCalcR = widthCalcCanvas.getContext("2d");

    let nameInput = document.querySelector("#nameInput");
    nameInput.value = playersMap.get(myid);

    let measure = widthCalcR.measureText(nameInput.value);
    let width = measure.width;
    if(width < 25) {
        width = 25;
    }
    nameInput.style.width = (width * 2) + "px";

    const minWidth = 10;
    let startingName = nameInput.value;

    nameInput.oninput = function() {
        let measure = widthCalcR.measureText(nameInput.value);
        let width = measure.width;
        if(width < minWidth) {
            width = minWidth;
        }
        nameInput.style.width = (width * 2) + "px";
    }

    // change name control buttons

    let inputContainer = document.querySelector(".inputContainer");

    let notActiveControl = document.querySelector(".nameInputNotActive").children[0];
    notActiveControl.parentElement.style.marginLeft = "-1.85em";
    
    notActiveControl.addEventListener("mousemove", function() {
        notActiveControl.parentElement.style.backgroundColor = "var(--colorMain)";
        notActiveControl.parentElement.style.cursor = "pointer";
        notActiveControl.style.filter = "invert(0.15)";
    });

    notActiveControl.addEventListener("mouseleave", function() {
        notActiveControl.parentElement.style.backgroundColor = "transparent";
        notActiveControl.parentElement.style.cursor = "default";
        notActiveControl.style.filter = "none";
    });

    notActiveControl.addEventListener("click", function() {
        nameInput.focus();
    });

    let errorMessageShown = false;

    let activeControls = [];
    let temp = [...document.querySelectorAll(".nameInputActive")];
    
    for(let i = 0; i < temp.length; i++) {
        activeControls.push(temp[i].children[0]);

        if(i == 0) {
            temp[i].children[0].parentElement.style.marginLeft = "-3.5em";

            temp[i].children[0].addEventListener("click", function() {
                if(startingName != nameInput.value) {
                    errorMessage.style.opacity = "0";
                    errorMessageShown = false;
                    errorMessage.style.borderColor = "transparent";
                    errorMessage.style.boxShadow = "none";

                    socket.emit("attempt name change", nameInput.value);
                }
                else {
                    for(let i = 0; i < activeControls.length; i++) {
                        activeControls[i].parentElement.style.display = "none"
                    }

                    notActiveControl.parentElement.style.display = "flex";

                    errorMessage.style.opacity = "0";
                    errorMessageShown = false;
                }
            });
        }
        else {
            temp[i].children[0].parentElement.style.marginLeft = "0";

            // cancel name change
            temp[i].children[0].addEventListener("click", function() {
                // reset input value
                nameInput.value = startingName;
                nameInputFocused = false;

                // reset input and container styling
                inputContainer.style.backgroundColor = "transparent";
                nameInput.style.paddingRight = "1.75em";

                // update width of name input
                let measure = widthCalcR.measureText(nameInput.value);
                let width = measure.width;
                if(width < minWidth) {
                    width = minWidth;
                }
                nameInput.style.width = (width * 2) + "px";

                // show not active control
                notActiveControl.parentElement.style.display = "flex";
                
                // hide active controls
                for(let i = 0; i < activeControls.length; i++) {
                    activeControls[i].parentElement.style.display = "none"
                }
            });
        }

        temp[i].children[0].addEventListener("mousemove", function() {
            temp[i].children[0].parentElement.style.backgroundColor = "var(--colorMain)";
            temp[i].children[0].parentElement.style.cursor = "pointer";
            temp[i].children[0].style.filter = "invert(0.15)";
        });
    
        temp[i].children[0].addEventListener("mouseleave", function() {
            temp[i].children[0].parentElement.style.backgroundColor = "transparent";
            temp[i].children[0].parentElement.style.cursor = "default";
            temp[i].children[0].style.filter = "none";
        });
    }

    // allow attempting to change name by pressing enter
    nameInput.addEventListener("key", function(e) {
        if(e.key == "Enter") {
            if(startingName != nameInput.value) {
                errorMessage.style.opacity = "0";
                errorMessageShown = false;
                errorMessage.style.borderColor = "transparent";
                errorMessage.style.boxShadow = "none";

                socket.emit("attempt name change", nameInput.value);
            }
        }
    });

    let nameInputFocused = false;

    // hover effect for input

    inputContainer.addEventListener("mousemove", function() {
        nameInput.style.borderColor = "var(--colorMainDarker)";
    });
    inputContainer.addEventListener("mouseleave", function() {
        if(!(nameInputFocused)) {
            nameInput.style.borderColor = "var(--black)";
        }
    });

    // editing effect for input

    nameInput.onfocus = function() {
        nameInputFocused = true;

        inputContainer.style.backgroundColor = "wheat";

        nameInput.style.paddingRight = "3.5em";

        notActiveControl.parentElement.style.display = "none";
        
        for(let i = 0; i < activeControls.length; i++) {
            activeControls[i].parentElement.style.display = "flex"
        }
    }

    nameInput.onblur = function() {
        /**
         * Don't go back to normal if name has been edited 
         * but not attempted to change
         */
        if(startingName == nameInput.value) {
            nameInputFocused = false;

            inputContainer.style.backgroundColor = "transparent";

            nameInput.style.paddingRight = "1.75em";
            nameInput.style.borderColor = "var(--black)";

            /**
             * When a name control button is normally pressed, 
             * the nameInput blurring is triggered first, so 
             * cannot actually register click events on control 
             * buttons if nameInput.onblur hides the controls. 
             * Which is fine except for when a user gets an error 
             * changing their name, and then they change it back 
             * to their original name. Doing so should right away 
             * clear the error message. So, instead only hide the 
             * controls if the error message isn't shown to allow 
             * the onclick for the controls to handle hiding the 
             * error message and hiding the controls.
             */
            if(!(errorMessageShown)) {
                for(let i = 0; i < activeControls.length; i++) {
                    activeControls[i].parentElement.style.display = "none";
                }

                notActiveControl.parentElement.style.display = "flex";
            }
        }
    }

    document.querySelector(".name").style.opacity = "1";

    let errorMessage = document.querySelector(".errorMessage");
    hideErrorTimeout = null;

    socket.on("success name change", () => {
        errorMessage.style.opacity = "0";
        errorMessageShown = false;

        startingName = nameInput.value;
        
        nameInputFocused = false;

        inputContainer.style.backgroundColor = "transparent";

        nameInput.style.paddingRight = "1.75em";
        nameInput.style.borderColor = "var(--black)";

        notActiveControl.parentElement.style.display = "flex";

        // show not active control
        notActiveControl.parentElement.style.display = "flex";
                
        // hide active controls
        for(let i = 0; i < activeControls.length; i++) {
            activeControls[i].parentElement.style.display = "none"
        }
    });

    socket.on("failed name change", (message) => {
        errorMessageShown = true;
        
        for(let i = 0; i < activeControls.length; i++) {
            activeControls[i].parentElement.display = "flex";
        }
        window.setTimeout(function() {
            errorMessage.innerText = message;
            errorMessage.style.opacity = "1";
            errorMessage.style.borderColor = "#EF5350";
            errorMessage.style.boxShadow = "0 0 5px #EF5350";

            if(hideErrorTimeout != null) {
                window.clearTimeout(hideErrorTimeout);
            }

            hideErrorTimeout = window.setTimeout(function() {
                errorMessage.style.opacity = "0";
                errorMessageShown = false;
                hideErrorTimeout = null;
            }, 7000);
        }, 100);
    });
    
    // toggle create game menu

    let create = document.getElementsByClassName("create")[0];

    let createButton = document.getElementsByClassName("openCreate")[0];
    let showCreate = false;
    let hideCreateContainsTimeout = null;

    createButton.addEventListener("click", function() {
        showCreate = !(showCreate);

        let containers = [...document.querySelector(".create").querySelectorAll(".container")];
        
        if(showCreate) {
            create.style.height = "10em";
            create.style.padding = "1.5em";
            create.style.paddingTop = "2em";
            create.style.paddingBottom = "2em";

            create.style.backgroundColor = "var(--white3)";

            if(hideCreateContainsTimeout != null) {
                window.clearTimeout(hideCreateContainsTimeout);
                hideCreateContainsTimeout = null;
            }

            for(let i = 0; i < containers.length; i++) {
                containers[i].style.display = "flex";
            }
        }
        else {
            create.style.height = "0";
            create.style.padding = "0";
            create.style.paddingTop = "0.25em";

            create.style.backgroundColor = "var(--black)";

            hideCreateContainsTimeout = window.setTimeout(function() {
                for(let i = 0; i < containers.length; i++) {
                    containers[i].style.display = "none";
                }
            }, 350);
        }
    });

    // create a new game from either type

    let boutCreateButton = document.getElementById("boutCreateButton");
    boutCreateButton.addEventListener("click", function() {
        socket.emit("create game", "bout");
    });

    /*
    let clashCreateButton = document.getElementById("clashCreateButton");
    clashCreateButton.addEventListener("click", function() {
        socket.emit("create game", "clash");
    });
    */

    // server has created game, redirect client to game lobby page
    socket.on("created game", (game) => {
        mygame = game;
        loadPage(1);
    });

    // receive an updated list of the games
    socket.emit("request active games");
    socket.on("send active games", (games) => {
        let parent = document.querySelector(".join");
        let toRemoves = [...parent.querySelectorAll(".container")];
        
        // clear existing HTML
        for(let i = 0; i < toRemoves.length; i++) {
            toRemoves[i].remove();
        }
          
        // create HTML

        for(let i = 0; i < games.length; i++) {
            // only show games that haven't yet started
            if(!(games[i].active)) {
                let container = document.createElement("div");
                container.className = "container";

                let typeImage = document.createElement("img");
                if(games[i].type == "bout") {
                    typeImage.src = "/../Icons/users-square-filled.png";
                }
                else {
                    typeImage.src = "/../Icons/users-alt-square-filled.png";
                }
                typeImage.classList.add("icon");
                typeImage.classList.add("typeIcon");

                container.appendChild(typeImage);

                let p = document.createElement("p");
                p.className = "gameName";
                p.innerText = playersMap.get(games[i].host) + "'s game";

                container.appendChild(p);

                let joinButton = document.createElement("button");
                joinButton.className = "joinButton";

                let joinImage = document.createElement("img");
                joinImage.src = "/../Icons/arrow-circle-right-filled.png";
                joinImage.className = "icon";
                joinButton.appendChild(joinImage);

                let joinP = document.createElement("p");
                joinP.innerText = "Join";
                joinButton.appendChild(joinP);

                joinButton.addEventListener("click", function() {
                    socket.emit("join game", games[i].host);
                });

                container.appendChild(joinButton);

                parent.appendChild(container);
            }
        }
    });
});
pages[currentPage].activeScripts[pages[currentPage].activeScripts.length - 1]();