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
playersMap.set(12345432, "BruceWayne");
playersMap.set(11335533, "Somebody");

// active games
function Game() {
    this.host = null, 
    this.type = null, 
    this.players = []
}
let games = [];

let temp = new Game();
temp.host = 12345432;
temp.type = "bout";
temp.players = [12345432, 11335533];
games.push(temp);

// handle users
io.on("connection", (socket) => {
    socket.on("request active games", () => {
        // because maps can't be sent, convert to array
        let playersMapAsArray = [];
        playersMap.forEach((value, key) => {
            playersMapAsArray.push([key, value]);
        });

        socket.emit("send active games", games, playersMapAsArray);
    })

    socket.on("disconnect", () => {
        // console.log(socket.id + " disconnected");
        let a = 5;
    });

});

// start server
server.listen(port, () => {
  console.log("server started on port ", port);
});

