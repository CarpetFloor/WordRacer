let socket = io();

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

playersMap = new Map();

// get active games
socket.emit("request active games");
socket.on("send active games", (games, playersMapAsArray) => {
    /**
     * Because array originally created by looping with for each, 
     * order doesn't matter so can reconstruct playersMap with 
     * for each iteration
     */
    playersMapAsArray.forEach(pair => {
        playersMap.set(pair[0], pair[1]);
    });

    let parent = document.getElementsByClassName("join")[0];

    for(let i = 0; i < games.length; i++) {
        let container = document.createElement("div");
        container.className = "container";

        let typeImage = document.createElement("img");
        typeImage.src = "placeholder.png";
        typeImage.className = "icon";

        container.appendChild(typeImage);

        let p = document.createElement("p");
        console.log(games[i].host);
        p.innerText = playersMap.get(games[i].host) + "'s game";

        container.appendChild(p);

        let joinImage = document.createElement("img");
        joinImage.src = "placeholder.png";
        joinImage.className = "icon";

        container.appendChild(joinImage);

        parent.appendChild(container);
    }
})