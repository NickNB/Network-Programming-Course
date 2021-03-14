const net = require('net');
const fs = require('fs');
const {WebSocketServer} = require("./web");

const httpServer = net.createServer((connection) => {
    connection.on('data', () => {
        let content = fs.readFileSync('index.html', 'utf8');
        connection.write('HTTP/1.1 200 OK\r\nContent-Length: ' + content.length + '\r\n\r\n' + content);
    });
});
httpServer.listen(3000, () => {
    console.log('HTTP server listening on port 3000\n');
});

let webSocketServer = new WebSocketServer(3001);
webSocketServer.onMessage((webSocket, message) => {
    for(let ws of webSocketServer.getWebSockets()) {
        ws.sendMessage(webSocket.getId() + ': ' + message);
    }
})