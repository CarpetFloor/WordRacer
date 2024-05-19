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
let players = [12345432, 11335533];

let playersMap = new Map();

function Game() {
    this.host = null, 
    this.type = null, 
    this.active = false, 
    this.players = []
}
let games = [];

// don't decrement so that if a player leaves there won't be 2 player1
let countForNewPlayerName = 0;

// handle users
io.on("connection", (socket) => {
    // initiale user data when first connecting
    ++countForNewPlayerName;
    playersMap.set(socket.id, "player" + countForNewPlayerName);
    io.to(socket.id).emit("connection established", socket.id);
    
    let playersMapAsArray = [];
    playersMap.forEach((value, key) => {
        playersMapAsArray.push([key, value]);
    });

    socket.emit("players map updated", playersMapAsArray);

    socket.on("request active games", () => {
        socket.emit("send active games", games);
    });

    socket.on("create game", (type) => {
        let game = new Game();
        game.host = socket.id;
        game.type = type;
        game.active = false;
        game.players.push(socket.id);
        games.push(game);

        io.to(socket.id).emit("created game");

        socket.emit("send active games", games);
    });

    socket.on("disconnect", () => {
        playersMap.delete(socket.id);

        let playersMapAsArray = [];
        playersMap.forEach((value, key) => {
            playersMapAsArray.push([key, value]);
        });

        socket.emit("players map updated", playersMapAsArray);

        // if player was in a bout game, end the game

        // otherwise if player was in a clash game just remove them
    });

});

// start server
server.listen(port, () => {
  console.log("server started on port ", port);
});

