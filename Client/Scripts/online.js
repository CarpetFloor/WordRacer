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

// get active games
socket.emit("request active games");
socket.on("send active games", (games) => {
    console.log(games);
})