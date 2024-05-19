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
    ["/Scripts/onlineMenu.js"], 
    []
]
const pageScriptsContent = [
    [],  
    []
]
const intervals = [
    [], 
    []
]
const timeouts = [
    [], 
    []
]
const titles = [
    "Word Racer - Online Menu", 
    "Word Racer - Lobby"
]
const loadedScripts = [];

let currentPage = -1;

function loadPage(page) {
    currentPage = page;
    let src = "/./Pages/" + pages[page] + ".html";

    if(debugPageLoader) {
        console.log("Loading page: " + src);
    }

    fetch(src)
        .then((response) => response.text())
        .then((content) => {
            document.body.innerHTML = content;

            document.title = titles[page];
            
            if(debugPageLoader) {
                console.log("Loaded page: " + src);
            }

            for(let i = 0; i < loadedScripts.length; i++) {
                loadedScripts[i].remove();
                pageScriptsContent[i] = [];
                
                for(let j = 0; j < intervals[i].length; i++) {
                    window.clearInterval(intervals[i][j]);
                }

                intervals[i] = [];

                for(let j = 0; j < timeouts[i].length; i++) {
                    window.clearTimeout(timeouts[i][j]);
                }

                timeouts[i] = [];
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