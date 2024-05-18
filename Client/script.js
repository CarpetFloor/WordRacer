const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

const settings = {
    wordCount: 12
}

const game = {
    width: 15, 
    height: 20, 
    words: [], 
    data: []
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

let debugGenerate = true;

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
                "mouseover", 
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
            td.addEventListener("mouseover", drawSelection);
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
    // c.style.backgroundColor = "green";
    c.style.opacity = "0.5";

    spaceBetweenCells = (w - (25 * game.width)) / game.width;
}

setupCanvas();

let selecting = false;

function cellHoverListen(elem) {
    elem.style.cursor = "pointer";
    
    if(!(selecting)) {
        elem.style.backgroundColor = "var(--grey2)";
        elem.style.fontWeight = "bold";
    }
    else {
        let split = elem.id.split(",");
        selection.end = [parseInt(split[0]), parseInt(split[1])];
        checkForValidSelection();
    }
}

function cellUnHoverListen(elem) {
    elem.style.cursor = "default";
    elem.style.backgroundColor = "transparent";
    elem.style.fontWeight = "normal";

    // make sure answers stay highlighted when mouse moves off
    if(debugGenerate && (elem.children.length == 1)) {
        elem.style.color = "var(--black)";
        elem.style.fontWeight = "bold";
        elem.style.backgroundColor = "var(--color2)";
    }
}

let selection = {
    valid: false, 
    start: [-1, -1], 
    end: [-1, -1], 
    letters: []
}
function cellClick(elem) {
    if(!(selecting)) {
        selecting = true;
        selection.valid = false;

        let split = elem.id.split(",");
        selection.start = [parseInt(split[0]), parseInt(split[1])];
        selection.end = [-1, -1];
    }
    else if(selection.valid) {
        guess();
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

function drawSelection(e) {
    if(selecting) {
        // reset
        let cells = document.getElementsByTagName("td");
        
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

                document.getElementById(selected[i]).style.backgroundColor = "var(--colorMain)";
                document.getElementById(selected[i]).style.fontWeight = "bold";
                document.getElementById(selected[i]).style.opacity = "0.85";
            }
        }
        // otherwise, draw line
        else {
            let bounds = c.getBoundingClientRect();
            let toX = e.pageX - bounds.left - scrollX;
            let toY = e.pageY - bounds.top - scrollY;

            toX /= bounds.width; 
            toY /= bounds.height;

            toX *= w;
            toY *= h;

            let offset = 5 / 2;

            r.clearRect(0, 0, w, h);
            
            r.beginPath();
            r.moveTo(
                startMousePos[0], 
                startMousePos[1]
            );
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
}

function guess() {
    console.log("You guessed:");
    console.log(selection.letters);
}