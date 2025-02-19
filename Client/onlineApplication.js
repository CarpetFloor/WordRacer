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
        [
            "/Scripts/onlineMenu.js"
        ]
    ));

    pages.push(new Page(
        "gameLobby", 
        "Word Racer - Lobby", 
        [
            "/Scripts/gameLobby.js"
        ]
    ));

    pages.push(new Page(
        "bout", 
        "Word Racer - Bout", 
        [
            "/Scripts/bout.js"
        ]
    ));
}
generatePagesData();

let loadedScripts = [];
let currentPage = -1;
/**
 * For stuff like a game loaded page detects that the game has disconnected, so when sending 
 * the user back to the online menu, the loaded game page can tell the online menu page to show 
 * an error message.
 */
let globalErrorMessage = {
    show: false, 
    message: "", 
    timeout: null
}

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

            document.body.style.display = "none";

            document.title = page.title;
            
            if(debugPageLoader) {
                console.log("Loaded page: " + src);
            }

            if(debugPageLoader) {
                console.log("Loading scripts");
            }

            loadScriptsLoop(page, 0);
        }
    );
}

function loadScriptsLoop(page, index) {
    let script = document.createElement("script");
    script.src = page.scriptsToLoad[index];

    document.body.appendChild(script);
    loadedScripts.push(script);

    script.onload = function() {
        if(index == page.scriptsToLoad.length - 1) {
            if(debugPageLoader) {
                console.log("Loaded scripts");
                console.log("----------------------------------------\n\n\n");
            }

            function pageOpenAnimation() {
                document.body.style.marginLeft = "-200vw"
                document.body.style.display = "flex";
                window.setTimeout(() => {
                    document.body.style.marginLeft = "0";
                }, 100);
            }
            pageOpenAnimation();

            showErrorMessageCheck();
        }
        else {
            loadScriptsLoop(page, index + 1);
        }
    }
    
}

function loadPageByName(name) {
    let index = -1;
    
    for(let i = 0; i < pages.length; i++) {
        if(pages[i].file == name) {
            index = i;
            break;
        }
    }

    if(index != -1) {
        loadPage(index);
    }
}

let hideErrorTimeout = null;
function showErrorMessageCheck() {
    if(globalErrorMessage.show) {
        globalErrorMessage.show = false;

        if(globalErrorMessage.timeout != null) {
            window.clearTimeout(globalErrorMessage.timeout);
        }

        let elem = document.querySelector(".errorMessage");
        elem.innerText = globalErrorMessage.message;
        
        elem.style.opacity = "0";   
        elem.style.borderColor = "transparent";
        elem.style.boxShadow = "none";

        window.setTimeout(function() {
            elem.style.opacity = "1";
            elem.style.borderColor = "#EF5350";
            elem.style.boxShadow = "0 0 5px #EF5350";

            if(hideErrorTimeout != null) {
                window.clearTimeout(hideErrorTimeout);
            }

            hideErrorTimeout = window.setTimeout(function() {
                elem.style.opacity = "0";
                hideErrorTimeout = null;
            }, 8500);
        }, 100);
    }
}

loadPage(0);