pages[currentPage].activeScripts.push(function() {
    // set page title

    let countDisplay = document.getElementById("playersCount");
    let div = document.querySelector("div");
    let maxPlayers = (mygame.type == "bout") ? 2 : 4;

    let errorMessage = document.querySelector(".errorMessage");
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

    hideErrorTimeout = null;
    
    socket.on("not enough players to start game", () => {
        errorMessage.style.opacity = "0";   
        errorMessage.style.borderColor = "transparent";
        errorMessage.style.boxShadow = "none";

        window.setTimeout(function() {
            errorMessage.style.opacity = "1";
            errorMessage.style.borderColor = "#EF5350";
            errorMessage.style.boxShadow = "0 0 5px #EF5350";

            if(hideErrorTimeout != null) {
                window.clearTimeout(hideErrorTimeout);
            }

            hideErrorTimeout = window.setTimeout(function() {
                errorMessage.style.opacity = "0";
                hideErrorTimeout = null;
            }, 7000);
        }, 100);
    });

    socket.on("load game page", () => {
        if(localStorage.getItem("overallGameMode") == "search") {
            loadPageByName(mygame.type);
        }
        else {
            loadPageByName("scrambleBout");
        }
    });

    function mobileResponsiveness() {
        if(window.innerHeight > window.innerWidth) {
            document.querySelector(".lobby").style.fontSize = "1.25em";
            document.querySelector(".lobby").style.marginTop = "2em";

            document.querySelector(".controls").style.marginBottom = "0";

            document.querySelector(".errorMessage").style.fontSize = "1em";
            document.querySelector(".errorMessage").style.paddingTop = "1em";
            document.querySelector(".errorMessage").style.paddingBottom = "0";
            document.querySelector(".errorMessage").style.marginTop = "4em";
        }
        else if(window.innerWidth < 1000) {
            document.querySelector(".lobby").style.fontSize = "1.25em";
            document.querySelector(".lobby").style.marginTop = "2em";

            document.querySelector(".container").style.marginTop = "2em";

            document.querySelector(".errorMessage").style.fontSize = "1em";
            document.querySelector(".errorMessage").style.paddingTop = "1em";
            document.querySelector(".errorMessage").style.paddingBottom = "0";
            document.querySelector(".errorMessage").style.marginTop = "4em";
        }
    }
    mobileResponsiveness();
});
pages[currentPage].activeScripts[pages[currentPage].activeScripts.length - 1]();