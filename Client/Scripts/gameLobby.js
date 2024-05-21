pages[currentPage].activeScripts.push(function() {
    let countDisplay = document.getElementById("playersCount");
    let div = document.querySelector("div");
    let maxPlayers = (mygame.type == "bout") ? 2 : 4;

    updatePage();

    function updatePage() {
        // players count
        countDisplay.innerText = mygame.players.length + " / " + maxPlayers;

        // reset players lsit
        let playersList = [...document.getElementsByClassName("player")];
        for(let i = 0; i < playersList.length; i++) {
            playersList[i].remove();
        }

        console.log("going through players:");
        console.log(mygame.players);
        
        // update players list
        for(let i = 0; i < mygame.players.length; i++) {
            let p = document.createElement("p");
            p.className = "player";
            p.innerText = playersMap.get(mygame.players[i]);
        
            if(mygame.players[i] == mygame.host) {
                p.innerText += " [host]";
            }
        
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
});
pages[currentPage].activeScripts[pages[currentPage].activeScripts.length - 1]();