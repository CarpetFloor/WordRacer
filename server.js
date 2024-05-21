/**
 * Note about storing users: To avoid frequent server computation, 
 * store, send, etc. all users as their socket id. To deal with 
 * usernames, create a map with socke ids as keys and usernames as 
 * values that should get updated whenever a user changes their 
 * username.
 */

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 8081;

const wordsList = require("./Client/wordsForServer");

// add static file(s)
app.use(express.static(__dirname + "/Client"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Client/index.html");
});

// players
let players = [];
let sockets = [];

let playersMap = new Map();

function Game() {
    this.host = null, 
    this.roomName = null, 
    this.type = null, 
    this.active = false, 
    this.players = [], 
    this.connectedCount = 0, 
    this.data = {
        width: -1, 
        height: -1, 
        words: [], 
        found: [], 
        foundPosesStart: [], 
        foundPosesEnd: [], 
        foundAllPoints: [], 
        grid: []
    }
}
let games = [];
let roomNames = [];

let maxPlayersMap = new Map();
maxPlayersMap.set("bout", 2);
maxPlayersMap.set("clash", 4);

let minPlayersMap = new Map();
minPlayersMap.set("bout", 2);
minPlayersMap.set("clash", 3);

let wordCountMap = new Map();
wordCountMap.set("bout", 12);

let gameSizeMap = new Map();
gameSizeMap.set("bout", {width: 15, height: 20});

function getGame(host) {
    let game = null;

    for(let i = 0; i < games.length; i++) {
        if(games[i].host == host) {
            game = games[i];
            break;
        }
    }

    return game;
}

// handle users
io.on("connection", (socket) => {
    // initiale user data when first connecting

    let lowestPlayerNumber = 1;

    for(let i = 0; i < players.length; i++) {
        let check = "player" + lowestPlayerNumber;

        while(playersMap.get(players[i]) == check) {
            ++lowestPlayerNumber;
            check = "player" + lowestPlayerNumber;
        }
    }

    players.push(socket.id);
    sockets.push(socket);
    playersMap.set(socket.id, "player" + lowestPlayerNumber);
    
    // send the newly-connected client their id
    io.to(socket.id).emit("connection established", socket.id);
    
    let playersMapAsArray = [];
    playersMap.forEach((value, key) => {
        playersMapAsArray.push([key, value]);
    });

    // send all clients the updated players map
    io.sockets.emit("players map updated", playersMapAsArray);

    socket.on("request active games", () => {
        // send the actve games to the requester
        io.to(socket.id).emit("send active games", games);
    });

    socket.on("create game", (type) => {
        let game = new Game();
        game.host = socket.id;
        game.type = type;
        game.active = false;
        game.players.push(socket.id);
        games.push(game);

        // let requester know that the game has been created
        io.to(socket.id).emit("created game", game);

        // send the updated games array to all clients
        io.sockets.emit("send active games", games);
    });

    socket.on("join game", (host) => {
        let game = getGame(host);
        
        if((game != null) && (game.players.length < maxPlayersMap.get(game.type))) {
            game.players.push(socket.id);
            io.to(socket.id).emit("created game", game);

            // notify all other players in the lobby that the players list has been updated
            for(let i = 0; i < game.players.length; i++) {
                if(game.players[i] != socket.id) {
                    io.to(game.players[i]).emit("lobby players modified", game.players);
                }
            }
        }
    })

    socket.on("leave lobby", (host) => {
        let game = getGame(host);

        if(socket.id == host) {
            let removeIndex = games.indexOf(game);
            games.splice(removeIndex, 1);

            for(let i = 0; i < game.players.length; i++) {
                io.to(game.players[i]).emit("game removed");
            }

            // send all clients the updated games array
            io.sockets.emit("send active games", games);
        }
        else {
            let removeIndex = game.players.indexOf(socket.id);
            game.players.splice(removeIndex, 1);
            
            for(let i = 0; i < game.players.length; i++) {
                io.to(game.players[i]).emit(
                    "lobby players modified", 
                    game.players
                );
            }
        }
    });

    socket.on("request game start", (host) => {
        let game = getGame(host);

        // first make sure there are enough players
        if(game.players.length >= minPlayersMap.get(game.type)) {
            // find first available name for room
            let smallest = 0;

            if(roomNames.length > 0) {
                smallest = roomNames[0];

                for(let j = 0; j < roomNames.length; j++) {
                    if(roomNames[j] < smallest) {
                        smallest = roomNames[j];
                    }
                }
            }

            game.roomName = "game" + smallest;
            roomNames.push(game.roomName);

            // add all players in the game to a room to allow broadcasting to all players at once
            for(let i = 0; i < game.players.length; i++) {                
                let playerIndex = players.indexOf(game.players[i]);
                let playerSocket = sockets[playerIndex];
                playerSocket.join(game.roomName);
            }
            
            game.active = true;
            io.to(game.roomName).emit("load game page");
        }
        else {
            io.to(socket.id).emit("not enough players to start game");
        }
    });

    socket.on("loaded game page", (host) => {
        let game = getGame(host);
        ++game.connectedCount;

        if(game.connectedCount == game.players.length) {
            setupGameData(game);
            io.to(game.roomName).emit("game has started", game.data);
        }
    });

    socket.on("disconnect", () => {
        let playerIndex = players.indexOf(socket.id);
        players.splice(playerIndex, 1);
        sockets.splice(playerIndex, 1);
        playersMap.delete(socket.id);

        playersMapAsArray = [];
        playersMap.forEach((value, key) => {
            playersMapAsArray.push([key, value]);
        });

        // send all clients the updated players map
        io.sockets.emit("players map updated", playersMapAsArray);

        // check if the player was in a game
        let game = null;
        for(let i = 0; i < games.length; i++) {
            if(games[i].players.includes(socket.id)) {
                game = games[i];
                break;
            }
        }

        if(game != null) {
            if(game.type == "bout") {
                /**
                 * If game has not yet started:
                 * -If player is not the host, simply remove them from the game 
                 *  and let the other players in the game know they left
                 * -If player is the host, end the game for everyone
                 */

                if(!(game.active)) {
                    // plyer is host
                    if(game.host == socket.id) {
                        let removeIndex = games.indexOf(game);
                        games.splice(removeIndex, 1);

                        for(let i = 0; i < game.players.length; i++) {
                            io.to(game.players[i]).emit("game removed");
                        }
                    }
                    // player is NOT the host
                    else {
                        let removeIndex = game.players.indexOf(socket.id);
                        game.players.splice(removeIndex, 1);

                        for(let i = 0; i < game.players.length; i++) {
                            io.to(game.players[i]).emit(
                                "lobby players modified", 
                                game.players
                            );
                        }
                    }
                }
                /**
                 * Game has started:
                 * -Kick everyone from the game
                 * -Reset/ remove data related to game
                 */
                else {
                    // kick players
                    for(let i = 0; i < game.players.length; i++) {
                        io.to(game.roomName).emit("game removed");
                    }

                    // remove room from tracked room names
                    let roomNameIndex = roomNames.indexOf(game.roomName);
                    roomNames.splice(roomNameIndex, 1);

                    // remove players from room
                    for(let i = 0; i < game.players.length; i++) {
                        if(game.players[i] != socket.id) {
                            let playerIndex = players.indexOf(game.players[i]);
                            let playerSocket = sockets[playerIndex];

                            playerSocket.leave(game.roomName);
                        }
                    }

                    // remove game from games list
                    let gameIndex = games.indexOf(game);
                    games.splice(gameIndex, 1);
                }
            }
        }

        // send all clients the updated games array
        io.sockets.emit("send active games", games);
    });
});

// start server
server.listen(port, () => {
  console.log("server started on port", port);
});

// for filling in random letters
const letters = [
    "a", 
    "b", 
    "c", 
    "d", 
    "e", 
    "f", 
    "g", 
    "h", 
    "i", 
    "j", 
    "k", 
    "l", 
    "m", 
    "n", 
    "o", 
    "p", 
    "q", 
    "r", 
    "s", 
    "t", 
    "u", 
    "v", 
    "w", 
    "x", 
    "y", 
    "z"
];

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function addWord(gameData, row, col, word) {
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
    if(row + (rchange * word.length) > gameData.width - 1) {
        return false;
    }
    if(row + (rchange * word.length) < 0) {
        return false;
    }
    if(col + (cchange * word.length) > gameData.height - 1) {
        return false;
    }
    if(col + (cchange * word.length) < 0) {
        return false;
    }

    // make sure a word has not already been filled in
    let r = row;
    let c = col;

    for(let i = 0; i < word.length; i++) {
        if(gameData.grid[r][c] != 0) {
            return false;
        }

        r += rchange;
        c += cchange;
    }

    // actually fill in word
    r = row;
    c = col;

    for(let i = 0; i < word.length; i++) {
        gameData.grid[r][c] = word[i];

        r += rchange;
        c += cchange;
    }

    return true;
}

function setupGameData(game) {
    let gameData = game.data;

    // set size of game
    let sizeData = gameSizeMap.get(game.type);
    gameData.width = sizeData.width;
    gameData.height = sizeData.height;

    // generate a random list of words
    for(let i = 0; i < wordCountMap.get(game.type); i++) {
        let index = random(0, wordsList.words.length - 1);
        let picked = wordsList.words[index];

        // make sure each word is distinct
        if(gameData.words.includes(picked)) {
            while(gameData.words.includes(picked)) {
                ++index;

                if(index == gameData.words.length) {
                    index = 0;
                }
            }

            picked = wordsList.words[index];
        }

        gameData.words.push(picked);
    }

    // generate array that represent game
    for(let row = 0; row < gameData.height; row++) {
        let row = [];

        for(let col = 0; col < gameData.width; col++) {
            row.push(0);
        }

        gameData.grid.push(row);
    }

    // fill words at random spots
    let index = 0;
    let done = false;
    while(index < gameData.words.length) {
        for(let row = 0; row < gameData.height; row++) {
            for(let col = 0; col < gameData.width; col++) {
                if(random(1, 500) == 1) {
                    let addCheck = addWord(gameData, row, col, gameData.words[index]);

                    if(addCheck) {
                        ++index;
                    }

                    if(index > gameData.words.length - 1) {
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
    for(let row = 0; row < gameData.height; row++) {
        for(let col = 0; col < gameData.width; col++) {
            if(gameData.grid[row][col] == 0) {
                gameData.grid[row][col] = letters[random(0, letters.length - 1)];
            }
        }
    }
}