pages[currentPage].activeScripts.push(function() {
    let countDisplay = document.getElementById("playersCount");
    let div = document.querySelector("div");
    let maxPlayers = (mygame.type == "bout") ? 2 : 4;

    let errorMessage = document.querySelector(".errorMessage");
    console.log(errorMessage);
    let errorMessageHideTimeout = null;

    updatePage();

    function updatePage() {
        // players count
        countDisplay.innerText = mygame.players.length + " / " + maxPlayers;

        // reset players lsit
        let playersList = [...document.getElementsByClassName("player")];
        for(let i = 0; i < playersList.length; i++) {
            playersList[i].remove();
        }
        
        // update players list
        for(let i = 0; i < mygame.players.length; i++) {
            let p = document.createElement("p");
            p.className = "player";
            p.innerText = playersMap.get(mygame.players[i]);
        
            if(mygame.players[i] == myid) {
                p.innerText += " (you)";
                p.style.color = "var(--colorDark3)";
            }
        
            div.appendChild(p);
        }
    }

    socket.on("lobby players modified", (playersArray) => {
        mygame.players = [...playersArray];
        updatePage();
    });

    // the game no longer exists
    socket.on("game removed", () => {
        loadPage(0);
    });

    // leave game
    let leaveGameButton = document.querySelector(".controls").children[1];
    leaveGameButton.addEventListener("click", function() {
        socket.emit("leave lobby", mygame.host);
        loadPage(0);
    });

    // start game: checking for enough players is done server-side
    let startGameButton = document.querySelector(".controls").children[0];
    startGameButton.addEventListener("click", function() {
        socket.emit("request game start", mygame.host);
    });

    socket.on("not enough players to start game", () => {
        if(errorMessageHideTimeout != null) {
            pages[currentPage].timeouts[0] = null;
            window.clearTimeout(errorMessageHideTimeout);
            errorMessageHideTimeout = null;
        }

        errorMessage.style.display = "flex";

        errorMessageHideTimeout = window.setTimeout(function() {
            errorMessageHideTimeout = null;
            errorMessage.style.display = "none";
        }, 5000);
        pages[currentPage].timeouts.push(errorMessageHideTimeout);
    });

    socket.on("load game page", () => {
        loadPageByName(mygame.type);
    });
});
pages[currentPage].activeScripts[pages[currentPage].activeScripts.length - 1]();