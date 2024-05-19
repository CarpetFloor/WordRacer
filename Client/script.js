let debugGenerate = false;
// only in console
let showAnswers = true;

const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

const settings = {
    wordCount: 12
}

const game = {
    width: 15, 
    height: 20, 
    words: [], 
    found: [], 
    foundPosesStart: [], 
    foundPosesEnd: [], 
    foundAllPoints: [], 
    data: []
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generateGame() {
    // generate a random list of words
    for(let i = 0; i < settings.wordCount; i++) {
        let index = random(0, wordsList.length - 1);
        let picked = wordsList[index];

        // make sure each word is distinct
        if(game.words.includes(picked)) {
            while(game.words.includes(picked)) {
                ++index;

                if(index == game.words.length) {
                    index = 0;
                }
            }

            picked = wordsList[index];
        }

        game.words.push(picked);
    }

    // add words to HTML words list
    let elem = document.getElementsByClassName("found")[0];

    for(let i = 0; i < game.words.length; i++) {
        let p = document.createElement("p");
        p.innerText = game.words[i];

        elem.appendChild(p);
    }

    if(debugGenerate) {
        console.log(game.words);
    }

    // generate array that represent game
    for(let row = 0; row < game.height; row++) {
        let row = [];

        for(let col = 0; col < game.width; col++) {
            row.push(0);
        }

        game.data.push(row);
    }

    if(showAnswers) {
        console.log("WORDS:");
        console.log("----------");
    }

    let index = 0;
    let done = false;
    
    // fill words at random spots
    while(index < game.words.length) {
        for(let row = 0; row < game.height; row++) {
            for(let col = 0; col < game.width; col++) {
                if(random(1, 500) == 1) {
                    let addCheck = addWord(row, col, game.words[index]);

                    if(addCheck) {
                        if(debugGenerate) {
                            console.log("generated " + index + ", " + game.words[index]);
                        }

                        if(showAnswers) {
                            if(showAnswers) {
                                console.log(game.words[index]);
                                console.log("..at: ", row, ",", col);
                            }
                        }

                        ++index;
                    }

                    if(index > game.words.length - 1) {
                        done = true;
                        break;
                    }
                }
            }

            if(done) {
                break;
            }
        }
    }

    // fill in remaining letters
    for(let row = 0; row < game.height; row++) {
        for(let col = 0; col < game.width; col++) {
            if(game.data[row][col] == 0) {
                let extra = "";
                if(debugGenerate) {
                    extra = ".";
                }

                game.data[row][col] = extra + letters[random(0, letters.length - 1)];
            }
        }
    }

    let table = document.querySelector("table");

    // generate html
    for(let row = 0; row < game.height; row++) {
        let tr = document.createElement("tr");

        for(let col = 0; col < game.width; col++) {
            let td = document.createElement("td");
            td.id = row + "," + col;

            td.addEventListener(
                "mousemove", 
                function(){cellHoverListen(td);}
            );
            td.addEventListener(
                "mouseleave", 
                function(){cellUnHoverListen(td);}
            );
            td.addEventListener(
                "click", 
                function(){cellClick(td);}
            );
            
            // listeners for selection
            td.addEventListener("mousemove", drawSelection);
            td.addEventListener("click", drawSelection);

            if(debugGenerate) {
                if(game.data[row][col].includes(".")) {
                    td.innerText = (game.data[row][col])[1];
                }
                else {
                    td.innerText = game.data[row][col];
                    td.style.color = "var(--black)";
                    td.style.fontWeight = "bold";
                    td.style.backgroundColor = "var(--color2)";

                    let answerIndicator = document.createElement("p");
                    answerIndicator.style.display = "none";
                    td.appendChild(answerIndicator);
                }
            }
            else {
                td.innerText = (game.data[row][col]);
            }

            tr.appendChild(td);
        }

        table.appendChild(tr);
    }
}

function addWord(row, col, word) {
    let possibleDirs = [
        // left
        [-1, 0], 
        // right
        [1, 0], 
        // up
        [0, -1], 
        // down
        [0, 1], 
        // up-left
        [1, -1], 
        // up-right
        [1, -1], 
        // down-left
        [-1, 1], 
        // down-right
        [1, 1], 
    ]
    let dir = possibleDirs[random(0, possibleDirs.length - 1)];
    let rchange = dir[0];
    let cchange = dir[1];

    // first make sure there is enough space
    if(row + (rchange * word.length) > game.width - 1) {
        return false;
    }
    if(row + (rchange * word.length) < 0) {
        return false;
    }
    if(col + (cchange * word.length) > game.height - 1) {
        return false;
    }
    if(col + (cchange * word.length) < 0) {
        return false;
    }

    // make sure a word has not already been filled in
    let r = row;
    let c = col;

    for(let i = 0; i < word.length; i++) {
        if(game.data[r][c] != 0) {
            return false;
        }

        r += rchange;
        c += cchange;
    }

    // actually fill in word
    r = row;
    c = col;

    for(let i = 0; i < word.length; i++) {
        game.data[r][c] = word[i];

        r += rchange;
        c += cchange;
    }

    return true;
}

generateGame();

let c = document.querySelector("canvas");
let r = c.getContext("2d");
let w = -1;
let h = -1;
let spaceBetweenCells = -1;

function setupCanvas() {
    c.style.position = "absolute";
    let table = document.querySelector("table");
    c.width = table.scrollWidth;
    c.height = table.scrollHeight;
    w = c.width;
    h = c.height;

    r.lineCap = "round";

    spaceBetweenCells = (w - (25 * game.width)) / game.width;
}

setupCanvas();

let selecting = false;

function cellHoverListen(elem) {
    let split = elem.id.split(",");
    selection.end = [parseInt(split[0]), parseInt(split[1])];
    
    if(!(animation.active) && !(gameOver)) {
        elem.style.cursor = "pointer";
        
        if(!(selecting)) {
            let alreadyFound = false;

            for(let i = 0; i < game.foundAllPoints.length; i++) {
                if(
                    (game.foundAllPoints[i][0] == selection.end[0]) &&
                    (game.foundAllPoints[i][1] == selection.end[1])
                ) {
                    alreadyFound = true;

                    break;
                }
            }

            if(!(alreadyFound)) {
                elem.style.backgroundColor = "var(--grey2)";
                elem.style.fontWeight = "bold";
                elem.style.transition = "all calc(var(--delay) * 0.7)";
            }
        }
        else {
            guessedPosEnd = selection.end;
            checkForValidSelection();
        }
    }
}

function cellUnHoverListen(elem) {
    if(!(animation.active) && !(gameOver)) {
        if(!(selecting)) {
            elem.style.cursor = "default";
        }

        elem.style.backgroundColor = "transparent";
        elem.style.fontWeight = "normal";
        elem.style.transition = "all calc(var(--delay) * 0.7)";

        // make sure answers stay highlighted when mouse moves off
        if(debugGenerate && (elem.children.length == 1)) {
            elem.style.color = "var(--black)";
            elem.style.fontWeight = "bold";
            elem.style.backgroundColor = "var(--color2)";
        }
    }
}

let selection = {
    valid: false, 
    start: [-1, -1], 
    end: [-1, -1], 
    letters: [], 
    poses: []
}
function cellClick(elem) {
    if(!(animation.active) && !(gameOver)) {
        if(!(selecting)) {
            let split = elem.id.split(",");
            selection.start = [parseInt(split[0]), parseInt(split[1])];

            let alreadyFound = false;

            for(let i = 0; i < game.foundAllPoints.length; i++) {
                if(
                    (game.foundAllPoints[i][0] == selection.start[0]) &&
                    (game.foundAllPoints[i][1] == selection.start[1])
                ) {
                    alreadyFound = true;

                    break;
                }
            }

            if(!(alreadyFound)) {
                selecting = true;
                selection.valid = false;

                guessedPosStart = selection.start;
                selection.end = [-1, -1];
            }
        }
        else if(selection.valid) {
            let alreadyFound = false;

            for(let i = 0; i < game.foundAllPoints.length; i++) {
                if(
                    (game.foundAllPoints[i][0] == selection.end[0]) &&
                    (game.foundAllPoints[i][1] == selection.end[1])
                ) {
                    alreadyFound = true;

                    break;
                }
            }

            if(!(alreadyFound)) {
                guess();
            }
        }
    }
}

document.querySelector("table").addEventListener("mouseover", drawSelection);

function checkForValidSelection() {
    selection.valid = false;
    
    let rowdiff = Math.abs(selection.end[1] - selection.start[1]);
    let coldiff = Math.abs(selection.end[0] - selection.start[0]);
    
    if((rowdiff == 0) || (coldiff == 0)) {
        selection.valid = true;
    }
    else if(rowdiff == coldiff) {
        selection.valid = true;
    }
}

let startMousePos = [-1, -1];
let finishedDrawingSelection = true;

function drawSelection(e) {
    if(finishedDrawingSelection && !(gameOver)) {
        finishedDrawingSelection = false;
        c.style.opacity = "0.5";

        if(selecting && !(animation.active)) {
            document.querySelector("table").style.cursor = "pointer";

            // reset
            for(let i = 0; i < selection.poses.length; i++) {
                let elem = document.getElementById(selection.poses[i]);

                if(!(debugGenerate) || (elem.children.length == 0)) {
                    elem.style.color = "var(--black)";
                    elem.style.fontWeight = "normal";
                    elem.style.backgroundColor = "transparent";
                }
                else {
                    elem.style.color = "var(--black)";
                    elem.style.fontWeight = "bold";
                    elem.style.backgroundColor = "var(--color2)";
                }
            }

            selection.poses = [];

            // cell at start of selection should always be highlighted
            if(selection.start[0] != -1) {
                let startId = selection.start[0] + "," + selection.start[1];
                document.getElementById(startId).style.backgroundColor = "var(--colorMain)";
                document.getElementById(startId).style.fontWeight = "bold";
                document.getElementById(startId).style.opacity = "0.85";
            }
            
            // if selection is valid, highlight letters in selection
            if(selection.valid) {
                selection.letters = [];

                r.clearRect(0, 0, w, h);

                // highlight letters in selection

                let rowdiff = selection.end[0] - selection.start[0];
                let coldiff = selection.end[1] - selection.start[1];

                let row = selection.start[0];
                let col = selection.start[1];

                let selected = [];

                if(coldiff == 0) {
                    for(let i = 0; i < Math.abs(rowdiff) + 1; i++) {
                        selected.push(row + "," + col);
                        
                        if(rowdiff > 0) {
                            ++row;
                        }
                        else {
                            --row;
                        }
                    }
                }
                else if(rowdiff == 0) {
                    for(let i = 0; i < Math.abs(coldiff) + 1; i++) {
                        selected.push(row + "," + col);
                        
                        if(coldiff > 0) {
                            ++col;
                        }
                        else {
                            --col;
                        }
                    }
                }
                else {
                    let rowchange = (rowdiff > 0) ? 1 : -1;
                    let colchange = (coldiff > 0) ? 1 : -1;

                    for(let i = 0; i < Math.abs(rowdiff) + 1; i++) {
                        selected.push(row + "," + col);
                        
                        row += rowchange;
                        col += colchange;
                    }
                }

                for(let i = 0; i < selected.length; i++) {
                    selection.letters.push(document.getElementById(selected[i]).innerText);
                    selection.poses.push(selected[i]);

                    document.getElementById(selected[i]).style.transition = "none";
                    document.getElementById(selected[i]).style.backgroundColor = "var(--colorMain)";
                    document.getElementById(selected[i]).style.fontWeight = "bold";
                    document.getElementById(selected[i]).style.opacity = "0.85";
                }

                // highlight found words
                highlightFound();
            }
            // otherwise draw line, but not if selection only consists of 1 letter
            else if(selection.end[0] != -1) {
                r.clearRect(0, 0, w, h);

                // highlight found words
                highlightFound();
                
                r.beginPath();

                let width = (w / game.width);
                let height = (h / game.height);
                
                let fromX = selection.start[1] * width;
                fromX += (width / 2);
                let fromY = selection.start[0] * height;
                fromY += (height / 2);
                
                r.moveTo(
                    fromX, 
                    fromY
                );

                let bounds = c.getBoundingClientRect();
                let toX = e.pageX - bounds.left - scrollX;
                let toY = e.pageY - bounds.top - scrollY;

                toX /= bounds.width; 
                toY /= bounds.height;

                toX *= w;
                toY *= h;

                r.lineTo(
                    toX, 
                    toY
                );

                r.lineWidth = 10;
                r.strokeStyle = "#69eeb2";
                r.stroke();
            }
        }
        else {
            let bounds = c.getBoundingClientRect();
            startMousePos[0] = e.pageX - bounds.left - scrollX;
            startMousePos[1] = e.pageY - bounds.top - scrollY;

            startMousePos[0] /= bounds.width; 
            startMousePos[1] /= bounds.height;

            startMousePos[0] *= w;
            startMousePos[1] *= h;
        }

        finishedDrawingSelection = true;
    }
}

let animation = {
    active: false, 
    interval: null, 
    loop: null, 
    properties: {}
}

let guessedWord = "";
let guessedPosStart = [-1, -1];
let guessedPosEnd = [-1, -1];

function guess() {
    if(!(gameOver)) {
        selecting = false;

        let startPos = selection.start;
        let endPos = selection.end;

        let found = false;
        guessedWord = "";

        for(let i = 0; i < selection.letters.length; i++) {
            guessedWord += selection.letters[i];
        }

        if(game.words.includes(guessedWord)) {
            found = true;
        }

        // indicate whether guess was corrrect or not

        let cells = document.getElementsByTagName("td");

        // first clear the highlighting from any letters highlighted from selection
        for(let i = 0; i < cells.length; i++) {
            if(!(debugGenerate) || (cells[i].children.length == 0)) {
                cells[i].style.color = "var(--black)";
                cells[i].style.fontWeight = "normal";
                cells[i].style.backgroundColor = "transparent";
            }
            else {
                cells[i].style.color = "var(--black)";
                cells[i].style.fontWeight = "bold";
                cells[i].style.backgroundColor = "var(--color2)";
            }
        }

        animation.active = true;
        animation.properties = {
            found: found, 
            startPos: [startPos[0], startPos[1]], 
            endPos: [endPos[0], endPos[1]], 
            size: 1
        };
        animation.loop = function() {
            r.clearRect(0, 0, w, h);

            if(animation.properties.found) {
                r.strokeStyle = "#3cfaa7";
            }
            else {
                r.strokeStyle = "red";
            }
            r.lineWidth = animation.properties.size;

            r.beginPath();

            let width = (w / game.width);
            let height = (h / game.height);

            let startOffset = [(width / 2), 0 + (height / 2)];
            let endOffset = [(width / 2), 0 + (height / 2)];

            let x = (animation.properties.startPos[1] * width) + startOffset[0];
            let y = (animation.properties.startPos[0] * height) + startOffset[1];
            r.moveTo(
                x, 
                y, 
                width, 
                height
            );

            x = (animation.properties.endPos[1] * width) + endOffset[0];
            y = (animation.properties.endPos[0] * height) + endOffset[1];
            r.lineTo(
                x, 
                y, 
                width, 
                height
            );

            r.stroke();

            highlightFound();

            animation.properties.size += 8;

            if(animation.properties.size > 25) {
                window.clearInterval(animation.interval);
                
                window.setTimeout(function() {
                    animation.active = false;
                    r.clearRect(0, 0, w, h);

                    highlightFound();

                    // add word to found words
                    if(found) {
                        foundWord();
                    }
                }, 250);
            }
        }

        animation.interval = window.setInterval(animation.loop, (1000 / 30));
    }
}

let points = 0;
let gainedPointsInterval = null;
let gainedPointsFadeAwayInteval = null;

function foundWord() {
    // calculate how many points are gained from word
    let pointsGained = 0;
    pointsGained += guessedWord.length * 5;
    
    let secondsDiff = 
        Math.floor(timerLast.now / 1000) - 
        Math.floor(timerLast.start / 1000);
    
    /**
     * Start with getting 60 bonus points (for a minute), 
     * but for every second since the last word was 
     * found lose a bonus point. But don't allow bonus 
     * points to be negative.
     */
    let pointsFromTime = 60 - secondsDiff;
    if(pointsFromTime < 0) {
        pointsFromTime = 0;
    }
    pointsGained += pointsFromTime;

    // animate gained points

    // first, if animation is already playing clear it
    if(gainedPointsInterval != null) {
        window.clearInterval(gainedPointsInterval);
    }
    document.getElementById("gainedPoints").style.opacity = "0";
    document.getElementById("gainedPoints").style.marginTop = "0.25em";
    document.getElementById("gainedPoints").style.marginBottom = "-2em";
    document.getElementById("gainedPoints").style.scale = "1";
    document.getElementById("gainedPoints").style.marginLeft = "50vw";
    
    document.getElementById("gainedPoints").innerText = "+" + pointsGained + "pts";
    let opacity = 0;

    let marginTop = 0.75;
    let marginBottom = 0 - 2.75;
    let marginChange = 0.15;
    
    let scale = 0.75;
    
    // well, this is certainly one way to do animation

    gainedPointsInterval = window.setInterval(function() {
        opacity += 0.2;
        marginTop -= marginChange;
        marginBottom += marginChange;
        scale += 0.05;
        
        let done = false;
        if(opacity > 1) {
            opacity = 1;
            
            done = true;
        }

        document.getElementById("gainedPoints").style.opacity = opacity;
        document.getElementById("gainedPoints").style.marginTop = marginTop + "em";
        document.getElementById("gainedPoints").style.marginBottom = marginBottom + "em";
        document.getElementById("gainedPoints").style.scale = scale;

        if(done) {
            window.clearInterval(gainedPointsInterval);
            gainedPointsInterval = null;

            // ensure floating-point errors don't cause styles to not be set properly
            document.getElementById("gainedPoints").style.opacity = "1";
            document.getElementById("gainedPoints").style.marginTop = "0.25em";
            document.getElementById("gainedPoints").style.marginBottom = "-2em";
            document.getElementById("gainedPoints").style.scale = "1";

            // fade away
            window.setTimeout(function() {
                // don't fade away if the animation has been started again
                if(gainedPointsInterval == null) {
                    let fadeOpacity = 1;
                    let fadeMarginLeft = 50;
                    gainedPointsFadeAwayInteval = window.setInterval(function() {
                        if(gainedPointsInterval == null) {
                            document.getElementById("gainedPoints").style.opacity = fadeOpacity;
                            document.getElementById("gainedPoints").style.marginLeft = fadeMarginLeft + "vw";

                            fadeOpacity -= 0.15;
                            fadeMarginLeft += 2;

                            if(fadeOpacity <= 0) {
                                document.getElementById("gainedPoints").style.opacity = "0";
                                window.clearInterval(gainedPointsFadeAwayInteval);
                            }
                        }
                        else {
                            window.clearInterval(gainedPointsFadeAwayInteval);
                        }
                    }, 1000 / 30);
                }
            }, 1000 * 3.5)
        }
    }, 1000 / 30);

    points += pointsGained;
    document.getElementById("totalPoints").innerText = points + "pts";

    timerLast.start = new Date();

    game.found.push(guessedWord);
    game.foundPosesStart.push(guessedPosStart);
    game.foundPosesEnd.push(guessedPosEnd);

    // add all points of guess to game.foundAllPoints
    let rowDiff = guessedPosEnd[0] - guessedPosStart[0];
    let rowChange = 0;
    if(rowDiff != 0) {
        rowChange = Math.abs(rowDiff) / rowDiff;
    }

    let colDiff = guessedPosEnd[1] - guessedPosStart[1];
    let colChange = 0;
    if(colDiff != 0) {
        colChange = Math.abs(colDiff) / colDiff;
    }
    
    let row = guessedPosStart[0];
    let col = guessedPosStart[1];

    for(let i = 0; i < guessedWord.length; i++) {
        game.foundAllPoints.push([row, col]);

        row += rowChange;
        col += colChange;
    }

    let parent = document.getElementsByClassName("found")[0];
    let wordElem = parent.children[game.words.indexOf(guessedWord) + 1];

    wordElem.style.textDecoration = "line-through";
    wordElem.style.backgroundColor = "#8ada88";
    wordElem.style.opacity = "0.85";

    for(let i = 0; i < game.words.length - 1; i++) {
        game.found.push(1);
    }

    highlightFound();

    if(game.found.length == game.words.length) {
        endGame();
    }
}

function highlightFound() {
    let temp = game.found.length;
    if(temp > 1) {
        temp = 1;
    }

    for(let i = 0; i < temp; i++) {
        r.strokeStyle = "#8ada88";
        r.lineWidth = 25;

        r.beginPath();

        let width = (w / game.width);
        let height = (h / game.height);

        let startOffset = [(width / 2), 0 + (height / 2)];
        let endOffset = [(width / 2), 0 + (height / 2)];

        let x = (game.foundPosesStart[i][1] * width) + startOffset[0];
        let y = (game.foundPosesStart[i][0] * height) + startOffset[1];
        r.moveTo(
            x, 
            y, 
            width, 
            height
        );

        x = (game.foundPosesEnd[i][1] * width) + endOffset[0];
        y = (game.foundPosesEnd[i][0] * height) + endOffset[1];
        r.lineTo(
            x, 
            y, 
            width, 
            height
        );

        r.stroke();
    }
}

// timers
let timerMain = {
    start: new Date(), 
    now: null, 
    elem: document.getElementById("mainTimer"), 
    update: function() {
        let startSeconds = Math.floor(timerMain.start / 1000);

        timerMain.now = new Date();
        let nowSeconds = Math.floor(timerMain.now / 1000);

        let diff = nowSeconds - startSeconds;
        let minutes = Math.floor(diff / 60);
        let seconds = diff - (minutes * 60);
        if(seconds < 10) {
            seconds = "0" + seconds;
        }

        timerMain.elem.innerText = minutes + ":" + seconds;
    }
}

let timerLast = {
    start: new Date(), 
    now: null, 
    elem: document.getElementById("lastTimer"), 
    update: function() {
        let startSeconds = Math.floor(timerLast.start / 1000);

        timerLast.now = new Date();
        let nowSeconds = Math.floor(timerLast.now / 1000);

        let diff = nowSeconds - startSeconds;
        let minutes = Math.floor(diff / 60);
        let seconds = diff - (minutes * 60);
        if(seconds < 10) {
            seconds = "0" + seconds;
        }

        timerLast.elem.innerText = minutes + ":" + seconds;
    }
}

let timersInterval = window.setInterval(function() {
    timerMain.update();
    timerLast.update();
}, 1000);

let gameOver = false;
function endGame() {
    window.clearInterval(timersInterval);
    gameOver = true;

    let table = document.querySelector("table");
    table.style.cursor = "default";
    document.body.style.cursor = "default";

    // make sure cursor will not be pointer
    for(let i = 0; i < table.children.length; i++) {
        table.children[i].style.cursor = "default";

        for(let j = 0; j < table.children[i].children.length; j++) {
            table.children[i].children[j].style.cursor = "default";
        }
    }

    let backButton = document.createElement("button");
    backButton.className = "navIconButton";
    backButton.style.marginLeft = "auto";
    backButton.style.marginRight = "auto";
    backButton.style.transform = "translateX(-45%)";

    backButton.onclick = function() {
        window.open("/./index.html", "_self");
    }
    
    let icon = document.createElement("img");
    icon.src = "/./Icons/home.png";
    icon.className = "icon";
    icon.style.marginTop = "-0.1em";
    icon.style.filter = "invert(1) brightness(0.97)";
    
    backButton.appendChild(icon);

    let p = document.createElement("p");
    p.innerText = "Back";
    
    backButton.appendChild(p);

    let top = document.getElementsByClassName("top")[0];
    document.body.insertBefore(backButton, top);
}