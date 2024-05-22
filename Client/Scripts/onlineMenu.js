pages[currentPage].activeScripts.push(function() {
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
    nameInput.oninput = function() {
        let measure = widthCalcR.measureText(nameInput.value);
        let width = measure.width;
        if(width < minWidth) {
            width = minWidth;
        }
        nameInput.style.width = (width * 2) + "px";
    }
    
    // toggle create game menu

    let create = document.getElementsByClassName("create")[0];

    let createButton = document.getElementsByClassName("openCreate")[0];
    let showCreate = false;
    createButton.addEventListener("click", function() {
        showCreate = !(showCreate);
        
        if(showCreate) {
            create.style.height = "10em";
            create.style.padding = "1.5em";
            create.style.paddingTop = "2em";
            create.style.paddingBottom = "2em";

            create.style.backgroundColor = "var(--white3)";
        }
        else {
            create.style.height = "0";
            create.style.padding = "0";
            create.style.paddingTop = "0.25em";

            create.style.backgroundColor = "var(--black)";
        }
    });

    // create a new game from either type

    let boutCreateButton = document.getElementById("boutCreateButton");
    boutCreateButton.addEventListener("click", function() {
        socket.emit("create game", "bout");
    });

    let clashCreateButton = document.getElementById("clashCreateButton");
    clashCreateButton.addEventListener("click", function() {
        socket.emit("create game", "clash");
    });

    // server has created game, redirect client to game lobby page
    socket.on("created game", (game) => {
        mygame = game;
        loadPage(1);
    });

    // receive an updated list of the games
    socket.emit("request active games");
    socket.on("send active games", (games) => {
        console.log("recieved active games");
        console.log(games);
        console.log("\n\n\n\n");

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