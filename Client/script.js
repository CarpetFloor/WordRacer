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

let debugGenerate = false;
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
                if(random(1, 10) == 1) {
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

            if(debugGenerate) {
                if(game.data[row][col].includes(".")) {
                    td.innerText = (game.data[row][col])[1];
                }
                else {
                    td.innerText = game.data[row][col];
                    td.style.color = "var(--black)";
                    td.style.fontWeight = "bold";
                    td.style.backgroundColor = "var(--grey3)";
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