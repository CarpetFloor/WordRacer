// socket.io stuff

let socket = io();
let myid = null;

socket.on("connection established", (idSent) => {
    myid = idSent;
    console.log(myid);
});

socket.on("players map updated", (playersMapAsArray) => {
    console.log("map received");
    playersMap = new Map();

    playersMapAsArray.forEach(pair => {
        playersMap.set(pair[0], pair[1]);
    });

    console.log(playersMap);
});

// SPA stuff

// I probably should have used React

let debugPageLoader = true;

// all paths relative from Client directory
const pages = [
    "onlineMenu", 
    "gameLobby"
];
const pageScripts = [
    ["/Scripts/online.js"], 
    []
]
const loadedScripts = [];

function loadPage(page) {
    let src = "/./Pages/" + pages[page] + ".html";

    if(debugPageLoader) {
        console.log("Loading page: " + src);
    }

    fetch(src)
        .then((response) => response.text())
        .then((text) => {
            document.body.innerHTML = text;
            
            if(debugPageLoader) {
                console.log("Loaded page: " + src);
            }

            for(let i = 0; i < loadedScripts.length; i++) {
                loadedScripts[i].remove();
            }

            if(debugPageLoader) {
                console.log("Loading scripts");
            }

            for(let i = 0; i < pageScripts[page].length; i++) {
                let script = document.createElement("script");
                script.src = pageScripts[page][i];

                document.body.appendChild(script);
                loadedScripts.push(script);
            }

            if(debugPageLoader) {
                console.log("Loaded scripts");
            }
        }
    );
}

loadPage(0);