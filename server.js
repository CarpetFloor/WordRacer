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

// active games
function Game() {
    this.host = null, 
    this.type = null, 
    this.players = []
}
let games = [];

let temp = new Game();
temp.host = "BruceWayne";
temp.type = "bout";
temp.players = [12345432, 11335533];
games.push(temp)

// handle users
io.on("connection", (socket) => {
    socket.on("request active games", () => {
        console.log("Sending active games");
        socket.emit("send active games", games);
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

