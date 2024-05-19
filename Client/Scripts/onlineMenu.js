let pageReference = pages[currentPage];
pageReference.activeScripts.push(function() {
    // toggle create game menu

    let create = document.getElementsByClassName("create")[0];

    let createButton = document.getElementsByClassName("openCreate")[0];
    let showCreate = false;
    createButton.addEventListener("click", function() {
        showCreate = !(showCreate);
        
        if(showCreate) {
            create.style.display = "flex";
        }
        else {
            create.style.display = "none";
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

    socket.on("created game", () => {
        loadPage(1);
    });
    
    /*
    let activeGamesInterval = window.setInterval(function() {
        socket.emit("request active games");
    }, 1000);
    pageReference.intervals.push(activeGamesInterval);
    */

    socket.emit("request active games");
    socket.on("send active games", (games) => {
        let parent = document.getElementsByClassName("join")[0];
        
        // clear existing HTML
        for(let i = 0; i < parent.children.length; i++) {
            parent.children[i].remove();
        }
            
        // create HTML

        for(let i = 0; i < games.length; i++) {
            // only show games that haven't yet started
            if(!(games[i].active)) {
                let container = document.createElement("div");
                container.className = "container";

                let typeImage = document.createElement("img");
                typeImage.src = "placeholder.png";
                typeImage.className = "icon";

                container.appendChild(typeImage);

                let p = document.createElement("p");
                p.innerText = playersMap.get(games[i].host) + "'s game";

                container.appendChild(p);

                let joinImage = document.createElement("img");
                joinImage.src = "placeholder.png";
                joinImage.className = "icon";

                container.appendChild(joinImage);

                parent.appendChild(container);
            }
        }

    });
});
pageReference.activeScripts[pageReference.activeScripts.length - 1]();