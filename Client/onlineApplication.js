// global socket.io stuff

let socket = io();
let myid = null;
let playersMap = new Map();
let mygame = null;

/**
 * Global socket listeners. Have to put in function so can call later 
 * when all socket listeners are removed when a new page is loaded.
 */
function establishGlobalSocketListeners() {
    socket.on("connection established", (idSent) => {
        myid = idSent;
        console.log(myid);
    });

    socket.on("players map updated", (playersMapAsArray) => {
        playersMap.clear();

        for(let i = 0; i < playersMapAsArray.length; i++) {
            playersMap.set(playersMapAsArray[i][0], playersMapAsArray[i][1]);
        }
    });
}
establishGlobalSocketListeners();

// SPA stuff

// I probably should have used React

let debugPageLoader = false;

let pages = [];

function Page(file, title, scriptsToLoad) {
    this.file = file;
    this.title = title;
    this.scriptsToLoad = scriptsToLoad;
    this.activeScripts = [];
    this.intervals = [];
    this.timeouts = [];
}

function generatePagesData() {
    pages.push(new Page(
        "onlineMenu", 
        "Word Racer - Online Menu", 
        ["/Scripts/onlineMenu.js"]
    ));

    pages.push(new Page(
        "gameLobby", 
        "Word Racer - Lobby", 
        ["/Scripts/gameLobby.js"]
    ));
}
generatePagesData();

let loadedScripts = [];

let currentPage = -1;

function loadPage(index) {
    // reset script data and socket listeners
    if(currentPage != -1) {
        socket.removeAllListeners();
        establishGlobalSocketListeners();

        for(let i = 0; i < loadedScripts.length; i++) {
            loadedScripts[i].remove();
        }

        let page = pages[currentPage];

        for(let i = 0; i < page.activeScripts.length; i++) {
            page.activeScripts[i] = [];
            
            for(let j = 0; j < page.intervals.length; j++) {
                window.clearInterval(page.intervals[j]);
            }

            page.intervals = [];

            for(let j = 0; j < page.timeouts.length; j++) {
                window.clearTimeout(page.timeouts[j]);
            }

            page.timeouts = [];
        }
    }

    currentPage = index;
    const page = pages[index];

    let src = "/./Pages/" + page.file + ".html";

    if(debugPageLoader) {
        console.log("Loading page: " + src);
    }

    fetch(src)
        .then((response) => response.text())
        .then((content) => {
            document.body.innerHTML = content;

            document.title = page.title;
            
            if(debugPageLoader) {
                console.log("Loaded page: " + src);
            }

            if(debugPageLoader) {
                console.log("Loading scripts");
            }

            for(let i = 0; i < page.scriptsToLoad.length; i++) {
                let script = document.createElement("script");
                script.src = page.scriptsToLoad[i];

                document.body.appendChild(script);
                loadedScripts.push(script);
            }

            if(debugPageLoader) {
                console.log("Loaded scripts");
                console.log("----------------------------------------\n\n\n");
            }
        }
    );
}

loadPage(0);