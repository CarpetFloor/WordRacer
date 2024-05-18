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

// handle users
io.on("connection", (socket) => {
    console.log(socket.id + " connected");

    socket.on("disconnect", () => {
        console.log(socket.id + " disconnected");
    });
});

// start server
server.listen(port, () => {
  console.log("server started on port ", port);
});