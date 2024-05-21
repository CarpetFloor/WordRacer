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
const port = 8080;

// add static file(s)
app.use(express.static(__dirname + "/Client"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Client/index.html");
});

// players
let players = [];

let playersMap = new Map();

function Game() {
    this.host = null, 
    this.type = null, 
    this.active = false, 
    this.players = []
}
let games = [];

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

    socket.on("disconnect", () => {
        players.splice(players.indexOf(socket.id), 1);
        playersMap.delete(socket.id);

        let playersMapAsArray = [];
        playersMap.forEach((value, key) => {
            playersMapAsArray.push([key, value]);
        });

        // send all clients the updated players map
        io.sockets.emit("players map updated", playersMapAsArray);

        for(let i = 0; i < games.length; i++) {
            let inGame = games[i].players.includes(socket.id);

            if(inGame) {
                // if player was in a bout game, end the game
                if(games[i].type == "bout") {
                    games.splice(i, 1);

                    // kick other players
                }
                // otherwise if player was in a clash game just remove them
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

