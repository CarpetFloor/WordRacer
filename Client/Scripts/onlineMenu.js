let pageReference = pages[currentPage];
pageReference.activeScripts.push(function() {
    let playersMap = new Map();

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
    boutCreateButton.addEventListener("click", function() {
        socket.emit("create game", "clash");
    });

    socket.on("created game", () => {
        loadPage(1);
    });
    /**
     * Get active games, can be sent multiple times after page loaded 
     * when a new game is created, so make sure to reset everything. 
     */
    // socket.emit("request active games");
    socket.on("send active games", (games) => {
        console.log("games received");
        console.log(games);

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

    let a = window.setInterval(function(){console.log("testing")}, 1000);
    pageReference.intervals.push(a);
});
pageReference.activeScripts[pageReference.activeScripts.length - 1]();