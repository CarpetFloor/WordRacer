pages[currentPage].activeScripts.push(function() {
    let myIndex = -1;
    let otherIndex = -1;
    const myFoundColor = "#26B4D9";
    const otherFoundColor = "#D94B26";
    let myFound = [];
    let otherFound = [];

    for(let i = 0; i < mygame.players.length; i++) {
        if(mygame.players[i] != myid) {
            otherIndex = i;
            document.querySelector("#otherName").innerText = playersMap.get(mygame.players[i]);
        }
        else {
            myIndex = i;
        }
    }

    // darken a hex by a given RGB amount
    function darken(hex, amount) {
        let decs = [];

        for(let i = 1; i < hex.length; i += 2) {
            let value = Number("0x" + hex.charAt(i) + hex.charAt(i + 1));
            value -= amount;
            if(value < 0) {
                value = 0;
            }

            decs.push(value);
        }

        let ansHex = "#";

        for(let i = 0; i < decs.length; i++) {
            let value = (decs[i]).toString(16);
            if(value.length == 1) {
                value = "0" + value;
            }
            ansHex += (value).toString(16);
        }

        return ansHex;
    }

    let myPoints = document.querySelector("#youPoints");
    // darken hex by given RGB value
    myPoints.style.color = darken(myFoundColor, 50);

    let otherPoints = document.querySelector("#otherPoints");
    // darken hex by given RGB value
    otherPoints.style.color = darken(otherFoundColor, 40);

    // for calculating point bonused based off of time
    let timer = {
        start: new Date(), 
        now: null
    }

    let game = null;

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
                    document.getElementById(startId).style.backgroundColor = myFoundColor;
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
                        document.getElementById(selected[i]).style.backgroundColor = myFoundColor;
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
                    r.strokeStyle = myFoundColor;
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
                    r.strokeStyle = myFoundColor;
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
        myFound.push(guessedWord);

        let parent = document.getElementsByClassName("found")[0];
        let wordElem = parent.children[game.words.indexOf(guessedWord) + 1];

        wordElem.style.textDecoration = "line-through";
        wordElem.style.backgroundColor = myFoundColor;
        wordElem.style.opacity = "0.85";

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
        animatedGainedPoints(
            gainedPointsInterval, 
            gainedPointsFadeAwayInteval, 
            document.getElementById("myGainedPoints"), 
            pointsGained
        );

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

        highlightFound();

        if(game.found.length == game.words.length) {
            endGame();
        }
    }

    function highlightFound() {
        for(let i = 0; i < game.found.length; i++) {
            if(myFound.includes(game.found[i])) {
                r.strokeStyle = myFoundColor;
            }
            else {
                r.strokeStyle = otherFoundColor;
            }
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

    function animatedGainedPoints(interval, fadeAwayInterval, elem, pointsGainedPassed) {
        if(interval != null) {
            window.clearInterval(interval);
        }

        let opacity = 0;
        let marginTop = 2.25;
        /**
         * Goal margin bottom - starting margin bottom
         *          --------------------
         * Goal opacity / opacity change
         */
        let marginChange = (3.5 - 2.25) / (1 / 0.2);
        let scale = 0.75;

        elem.style.opacity = opacity;
        elem.innerText = "+" + pointsGainedPassed + "pts";
        
        // well, this is certainly one way to do animation

        interval = window.setInterval(function() {
            opacity += 0.2;
            marginTop += marginChange;
            scale += 0.05;
            
            let done = false;
            // ensure values at end will be consistent
            if(opacity > 1) {
                opacity = 1;
                marginTop = 3.5;
                scale = 1;
                
                done = true;
            }

            elem.style.opacity = opacity;
            elem.style.marginTop = marginTop + "em";
            elem.style.scale = scale;

            if(done) {
                window.clearInterval(interval);
                interval = null;

                // fade away
                let timeout = window.setTimeout(function() {
                    // don't fade away if the animation has been started again
                    if(interval == null) {
                        let fadeOpacity = 1;

                        fadeAwayInterval = window.setInterval(function() {
                            if(interval == null) {
                                elem.style.opacity = fadeOpacity;

                                fadeOpacity -= 0.15;

                                if(fadeOpacity <= 0) {
                                    elem.style.opacity = "0";
                                    window.clearInterval(fadeAwayInterval);
                                }
                            }
                            else {
                                window.clearInterval(fadeAwayInterval);
                            }
                        }, 1000 / 30);

                        pages[currentPage].intervals.push(fadeAwayInterval);
                    }
                }, 1000 * 3.5);
                
                pages[currentPage].timeouts.push(timeout);
            }
        }, 1000 / 30);

        pages[currentPage].intervals.push(interval);
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

        document.querySelector(".navIconButton").style.marginLeft = "auto";
        document.querySelector(".navIconButton").style.marginRight = "auto";
        document.querySelector(".navIconButton").style.display = "flex";

        let gameOverMessage = document.createElement("p");
        gameOverMessage.id = "gameOverMessage";
        
        gameOverMessage.style.width = "fit-content";
        gameOverMessage.style.marginLeft = "auto";
        gameOverMessage.style.marginRight = "auto";

        let myPointsValue = parseInt(myPoints.innerText);
        let otherPointsValue = parseInt(otherPoints.innerText);

        if(myPointsValue > otherPointsValue) {
            gameOverMessage.innerText = "You Win!";
        }
        else {
            gameOverMessage.innerText = "You Lose!";
        }

        document.querySelector(".navIconButton").insertAdjacentElement("afterend", gameOverMessage);
    }

    socket.on("game removed", () => {
        globalErrorMessage.message = "The game has ended due to the other player losing connection.";
        globalErrorMessage.show = true;
        loadPage(0);
    });

    socket.emit("loaded game page", mygame.host);

    socket.on("game has started", (gameData) => {
        game = gameData;

        // show scores totals
        document.querySelector(".boutTop").style.opacity = "1";

        // hide waiting for players messages
        document.querySelector("#connectionStatus").style.display = "none";

        addWordsList();

        // show found words list
        document.querySelector(".found").style.opacity = "1";
        document.querySelector(".found").style.pointerEvents = "auto";

        fillTable();
        
        // show table
        // document.querySelector("table").style.transition = "none";
        document.querySelector("table").style.opacity = "1";
        document.querySelector("table").style.pointerEvents = "auto";

        setupCanvas();
        mobileResponsiveness();
        
        addEventListener();
    });

    let canvasStyleSize = {width: -1, height: -1};
    
    function setupCanvas() {
        let table = document.querySelector("table");
        let tableBounds = table.getBoundingClientRect();
        
        c.width = tableBounds.width;
        c.height = tableBounds.height;

        canvasStyleSize.width = tableBounds.width * 1;
        canvasStyleSize.height = tableBounds.height * 1;

        c.style.width = (tableBounds.width * 1) + "px";
        c.style.height = (tableBounds.height * 1) + "px";
        
        document.body.style.flexDirection = "column";
        c.style.position = "absolute";
        c.style.opacity = "0.5";
        c.style.display = "flex";
        
        w = c.width;
        h = c.height;
        
        r.lineCap = "round";

        spaceBetweenCells = (w - (25 * game.width)) / game.width;

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
            otherFound.push(word);

            // update words list
            let parent = document.querySelector(".found");
            let wordElem = parent.children[game.words.indexOf(word) + 1];

            wordElem.style.textDecoration = "line-through";
            wordElem.style.backgroundColor = otherFoundColor;
            wordElem.style.opacity = "0.85";

            animatedGainedPoints(
                otherGainedPointsInterval, 
                otherGainedPointsFadeAwayInteval, 
                document.getElementById("otherGainedPoints"), 
                pointsGained
            );

            game.found.push(word);
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
    });

    function mobileResponsiveness() {
        if(window.innerHeight > window.innerWidth) {
            document.body.style.flexDirection = "column";
            document.body.style.marginLeft = "0.5em";

            document.querySelector(".search").style.alignSelf = "center";

            document.querySelector("table").style.padding = "0";
            document.querySelector("table").style.margin = "0";
            document.querySelector("table").style.marginLeft = "0.2em";
    
            let letters = document.querySelectorAll("td");
            for(let letter of letters) {
                letter.style.width = "1.25em";
                letter.style.height = "1em";
                letter.style.padding = "0";
            }
    
            document.querySelector(".game").style.flexDirection = "column";
    
            document.querySelector(".found h1").style.display = "none";
    
            let foundHeading = document.createElement("h1");
            foundHeading.innerText = "Words";
            foundHeading.style.padding = "0";
            foundHeading.style.margin = "0";
            foundHeading.style.marginTop = "0.5em";
    
            document.querySelector(".game").insertBefore(foundHeading, document.querySelector(".found"));
    
            document.querySelector(".found").style.flexDirection = "row";
            document.querySelector(".found").style.flexWrap = "wrap";

            let table = document.querySelector("table");
            let tableBounds = table.getBoundingClientRect();

            let c = document.querySelector("canvas");
            // c.style.background = "purple";
            c.style.margin = "0";
            c.style.marginLeft = "0.25em";

            c.style.width = ((tableBounds.width * 1) * 0.87) + "px";
            c.style.height = ((tableBounds.height * 1) * 0.95) + "px";
            
            document.querySelector("h1").style.marginLeft = "0.5em";
            document.querySelector(".found").style.marginLeft = "0.5em";
        }
        else if(window.innerWidth < 1000) {
            window.alert("Please use portrait mode - this game was not designed for landscape mode");
        }
    }
});
pages[currentPage].activeScripts[pages[currentPage].activeScripts.length - 1]();