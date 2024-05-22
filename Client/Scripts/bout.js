pages[currentPage].activeScripts.push(function() {
    let myIndex = -1;
    let otherIndex = -1;

    for(let i = 0; i < mygame.players.length; i++) {
        if(mygame.players[i] != myid) {
            otherIndex = i;
            document.querySelector("#otherName").innerText = playersMap.get(mygame.players[i]);
        }
        else {
            myIndex = i;
        }
    }

    // for calculating point bonused based off of time
    let timer = {
        start: new Date(), 
        now: null
    }

    let game = null;

    function random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    let c = document.querySelector("canvas");
    let r = c.getContext("2d");
    let w = -1;
    let h = -1;

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

                    if(elem.children.length == 0) {
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
                if(cells[i].children.length == 0) {
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
                    
                    let timeout = window.setTimeout(function() {
                        animation.active = false;
                        r.clearRect(0, 0, w, h);

                        highlightFound();

                        // add word to found words
                        if(found) {
                            foundWord();
                        }
                    }, 250);

                    pages[currentPage].timeouts.push(timeout);
                }
            }

            animation.interval = window.setInterval(animation.loop, (1000 / 30));
            pages[currentPage].intervals.push(animation.interval);
        }
    }

    let points = 0;
    let gainedPointsInterval = null;
    let gainedPointsFadeAwayInteval = null;

    let otherGainedPointsInterval = null;
    let otherGainedPointsFadeAwayInteval = null;

    function foundWord() {
        // calculate how many points are gained from word

        // get more points the shorter the word is
        let pointsGained = 0;

        let lengthBonus = (5 * 15) - guessedWord.length * 5;
        if(lengthBonus < 0) {
            lengthBonus = 0;
        }
        pointsGained += lengthBonus;
        
        timer.now = new Date();
        let secondsDiff = 
            Math.floor(timer.now / 1000) - 
            Math.floor(timer.start / 1000);
        
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

        socket.emit("found word", mygame.host, guessedWord, pointsGained, guessedPosStart, guessedPosEnd);

        // animate gained points

        // first, if animation is already playing clear it
        if(gainedPointsInterval != null) {
            window.clearInterval(gainedPointsInterval);
        }
        document.getElementById("myGainedPoints").style.opacity = "0";
        document.getElementById("myGainedPoints").style.marginTop = "0.25em";
        document.getElementById("myGainedPoints").style.marginBottom = "-2em";
        document.getElementById("myGainedPoints").style.scale = "1";
        document.getElementById("myGainedPoints").style.marginLeft = "50vw";
        
        document.getElementById("myGainedPoints").innerText = "+" + pointsGained + "pts";
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

            document.getElementById("myGainedPoints").style.opacity = opacity;
            document.getElementById("myGainedPoints").style.marginTop = marginTop + "em";
            document.getElementById("myGainedPoints").style.marginBottom = marginBottom + "em";
            document.getElementById("myGainedPoints").style.scale = scale;

            if(done) {
                window.clearInterval(gainedPointsInterval);
                gainedPointsInterval = null;

                // ensure floating-point errors don't cause styles to not be set properly
                document.getElementById("myGainedPoints").style.opacity = "1";
                document.getElementById("myGainedPoints").style.marginTop = "0.25em";
                document.getElementById("myGainedPoints").style.marginBottom = "-2em";
                document.getElementById("myGainedPoints").style.scale = "1";

                // fade away
                let timeout = window.setTimeout(function() {
                    // don't fade away if the animation has been started again
                    if(gainedPointsInterval == null) {
                        let fadeOpacity = 1;
                        let fadeMarginLeft = 50;
                        gainedPointsFadeAwayInteval = window.setInterval(function() {
                            if(gainedPointsInterval == null) {
                                document.getElementById("myGainedPoints").style.opacity = fadeOpacity;
                                document.getElementById("myGainedPoints").style.marginLeft = fadeMarginLeft + "vw";

                                fadeOpacity -= 0.15;
                                fadeMarginLeft += 2;

                                if(fadeOpacity <= 0) {
                                    document.getElementById("myGainedPoints").style.opacity = "0";
                                    window.clearInterval(gainedPointsFadeAwayInteval);
                                }
                            }
                            else {
                                window.clearInterval(gainedPointsFadeAwayInteval);
                            }
                        }, 1000 / 30);

                        pages[currentPage].intervals.push(gainedPointsFadeAwayInteval);
                    }
                }, 1000 * 3.5);
                
                pages[currentPage].timeouts.push(timeout);
            }
        }, 1000 / 30);
        
        pages[currentPage].intervals.push(gainedPointsInterval);

        points += pointsGained;
        document.getElementById("youPoints").innerText = points + "pts";

        timer.start = new Date();

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

        highlightFound();

        if(game.found.length == game.words.length) {
            endGame();
        }
    }

    function highlightFound() {
        for(let i = 0; i < game.found.length; i++) {
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

    let gameOver = false;
    function endGame() {
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
    }

    socket.on("game removed", () => {
        globalErrorMessage.message = "The game has ended due to the other player losing connection.";
        globalErrorMessage.show = true;
        loadPage(0);
    });

    socket.emit("loaded game page", mygame.host);

    socket.on("game has started", (gameData) => {
        game = gameData;

        // hide waiting for players messages
        document.querySelector("#connectionStatus").style.opacity = "0";
        document.querySelector("#connectionStatus").style.pointerEvents = "none";

        addWordsList();

        // show found words list
        document.querySelector(".found").style.opacity = "1";
        document.querySelector(".found").style.pointerEvents = "auto";

        fillTable();
        
        // show table
        document.querySelector("table").style.opacity = "1";
        document.querySelector("table").style.pointerEvents = "auto";

        setupCanvas();

        // add event listeners
        addEventListener();
    });

    function setupCanvas() {
        let table = document.querySelector("table");
        
        c.style.position = "absolute";
        c.style.display = "flex";
        
        c.width = table.scrollWidth;
        c.height = table.scrollHeight;
        
        w = c.width;
        h = c.height;

        r.lineCap = "round";
    }

    function addWordsList() {
        let elem = document.getElementsByClassName("found")[0];

        for(let i = 0; i < game.words.length; i++) {
            let p = document.createElement("p");
            p.innerText = game.words[i];

            elem.appendChild(p);
        }
    }

    function fillTable() {
        for(let row = 0; row < game.height; row++) {
            let tr = document.createElement("tr");
    
            for(let col = 0; col < game.width; col++) {
                let td = document.createElement("td");
                td.id = row + "," + col;
                
                td.innerText = (game.grid[row][col]);
    
                tr.appendChild(td);
            }
    
            document.querySelector("table").appendChild(tr);
        }
    }

    function addEventListener() {
        document.querySelector("table").addEventListener("mouseover", drawSelection);

        addCellEventListeners();
    }

    function addCellEventListeners() {
        let table = document.querySelector("table");
        for(let trIndex = 0; trIndex < table.children.length; trIndex++) {
            for(let cellIndex = 0; cellIndex < table.children[trIndex].children.length; cellIndex++) {
                let cell = table.children[trIndex].children[cellIndex];

                cell.addEventListener(
                    "mousemove", 
                    function(){cellHoverListen(cell);}
                );
                cell.addEventListener(
                    "mouseleave", 
                    function(){cellUnHoverListen(cell);}
                );
                cell.addEventListener(
                    "click", 
                    function(){cellClick(cell);}
                );
                
                // listeners for selection
                cell.addEventListener("mousemove", drawSelection);
                cell.addEventListener("click", drawSelection);
            }
        }
    }

    let myPoints = document.querySelector("#youPoints");
    let otherPoints = document.querySelector("#otherPoints");

    /**
     * This implementation was the easiest to implement without a significant amount 
     * of moving code to the server and restructuring. Whenever the user finds a word, 
     * it does the exact same thing as is done in practice, the only difference is also 
     * letting the server know what word has been found, and other relevant data so that 
     * the server can let every other player about the word that was found. Next, every 
     * player receives the following socket emit from the server, and each player just 
     * makes sure that if they aren't the person who just found the word, they do all 
     * of the same things that the person who just found the word did so that the word 
     * shows up as found on their end.
     */
    /**
     * Alternatively, it probably would have been better to handle all point calculations 
     * server-side, and then have all word found html/ css changes be done only here, but 
     * the goal with this was to create a multiplayer version of the practice mode as 
     * quick as possible.
     */
    socket.on("word has been found", (word, allPoints, pointsGained, playerId, guessedPosStart, guessedPosEnd) => {
        myPoints.innerText = allPoints[myIndex];
        otherPoints.innerText = allPoints[otherIndex];
        
        if(playerId != myid) {
            // update words list
            let parent = document.querySelector(".found");
            let wordElem = parent.children[game.words.indexOf(word) + 1];

            wordElem.style.textDecoration = "line-through";
            wordElem.style.backgroundColor = "#8ada88";
            wordElem.style.opacity = "0.85";

            // first, if animation is already playing clear it
            if(otherGainedPointsInterval != null) {
                window.clearInterval(otherGainedPointsInterval);
            }
            document.getElementById("otherGainedPoints").style.opacity = "0";
            document.getElementById("otherGainedPoints").style.marginTop = "0.25em";
            document.getElementById("otherGainedPoints").style.marginBottom = "-2em";
            document.getElementById("otherGainedPoints").style.scale = "1";
            document.getElementById("otherGainedPoints").style.marginLeft = "50vw";
            
            document.getElementById("otherGainedPoints").innerText = "+" + pointsGained + "pts";
            let opacity = 0;

            let marginTop = 0.75;
            let marginBottom = 0 - 2.75;
            let marginChange = 0.15;
            
            let scale = 0.75;

            otherGainedPointsInterval = window.setInterval(function() {
                opacity += 0.2;
                marginTop -= marginChange;
                marginBottom += marginChange;
                scale += 0.05;
                
                let done = false;
                if(opacity > 1) {
                    opacity = 1;
                    
                    done = true;
                }

                document.getElementById("otherGainedPoints").style.opacity = opacity;
                document.getElementById("otherGainedPoints").style.marginTop = marginTop + "em";
                document.getElementById("otherGainedPoints").style.marginBottom = marginBottom + "em";
                document.getElementById("otherGainedPoints").style.scale = scale;

                if(done) {
                    window.clearInterval(otherGainedPointsInterval);
                    otherGainedPointsInterval = null;

                    // ensure floating-point errors don't cause styles to not be set properly
                    document.getElementById("otherGainedPoints").style.opacity = "1";
                    document.getElementById("otherGainedPoints").style.marginTop = "0.25em";
                    document.getElementById("otherGainedPoints").style.marginBottom = "-2em";
                    document.getElementById("otherGainedPoints").style.scale = "1";

                    // fade away
                    let timeout = window.setTimeout(function() {
                        // don't fade away if the animation has been started again
                        if(otherGainedPointsInterval == null) {
                            let fadeOpacity = 1;
                            let fadeMarginLeft = 50;
                            otherGainedPointsFadeAwayInteval = window.setInterval(function() {
                                if(otherGainedPointsInterval == null) {
                                    document.getElementById("otherGainedPoints").style.opacity = fadeOpacity;
                                    document.getElementById("otherGainedPoints").style.marginLeft = fadeMarginLeft + "vw";

                                    fadeOpacity -= 0.15;
                                    fadeMarginLeft += 2;

                                    if(fadeOpacity <= 0) {
                                        document.getElementById("otherGainedPoints").style.opacity = "0";
                                        window.clearInterval(otherGainedPointsFadeAwayInteval);
                                    }
                                }
                                else {
                                    window.clearInterval(otherGainedPointsFadeAwayInteval);
                                }
                            }, 1000 / 30);

                            pages[currentPage].intervals.push(otherGainedPointsFadeAwayInteval);
                        }
                    }, 1000 * 3.5);
                    
                    pages[currentPage].timeouts.push(timeout);
                }
            }, 1000 / 30);
            
            pages[currentPage].intervals.push(otherGainedPointsInterval);

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

            for(let i = 0; i < word.length; i++) {
                game.foundAllPoints.push([row, col]);

                row += rowChange;
                col += colChange;
            }

            highlightFound();

            if(game.found.length == game.words.length) {
                endGame();
            }
        }
    })
});
pages[currentPage].activeScripts[pages[currentPage].activeScripts.length - 1]();