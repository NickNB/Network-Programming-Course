const net = require('net');
const crypto = require('crypto');

class WebSocketServer {
    constructor(port) {
        this.webSockets = [];
        this.broadcastMessage = (webSocket, message) => {console.log(`No handlers for message: ${message}`)};
        this.server = net.createServer((connection) => {
            console.log('Client connected\n');

            connection.on('data', (data) => {
                if(this.webSocketContainsConnection(connection)) {
                    let webSocket = this.getWebSocket(connection);
                    this.broadcastMessage(webSocket, readFrame(connection, data));
                } else {
                    this.webSockets.push(new WebSocket(connection));
                    handshake(connection, data.toString());
                }
            });

            connection.on('end', () => {
                console.log('Client disconnected\n');
            });

            connection.on('error', (err => {
                console.error('Error: ', err);
            }))
        });
        this.server.on('error', (error) => {
            console.error('Error: ', error);
        });
        this.server.listen(port, () => {
            console.log('WebSocket server listening on port 3001');
        });
    }

    onMessage(func) {
        this.broadcastMessage = func;
    }

    webSocketContainsConnection(connection) {
        for(let webSocket of this.webSockets) {
            if(webSocket.connection === connection) return true;
        }
        return false;
    }

    getWebSocket(connection) {
        for(let webSocket of this.webSockets) {
            if(webSocket.connection === connection) return webSocket;
        }
        return null;
    }

    getWebSockets() {
        return this.webSockets;
    }
}

class WebSocket {
    constructor(connection) {
        this.connection = connection;
    }

    sendMessage(message) {
        let msgLen = Buffer.byteLength(message);
        let buffer;

        if(msgLen > 65535) {
            buffer = Buffer.alloc(2 + 8 + msgLen);
            buffer.writeUInt8(127, 1);
            buffer.writeBigUInt64BE(BigInt(msgLen), 2);
            buffer.write(message, 10);
        }else if(msgLen > 125) {
            buffer = Buffer.alloc(2 + 2 + msgLen);
            buffer.writeUInt8(126, 1);
            buffer.writeUInt16BE(msgLen, 2);
            buffer.write(message, 4);
        } else {
            buffer = Buffer.alloc(2 + msgLen);
            buffer.writeUInt8(msgLen, 1);
            buffer.write(message, 2);
        }
        buffer.writeUInt8(0b10000001, 0);
        this.connection.write(buffer);
    }
}

function readFrame(connection, data) {
    let mask;
    if(data[1] < 0x80) {
        connection.end('HTTP/1.1 1002 No Mask');
        return;
    }
    let messageLen = data.readUInt8(1) - 128;
    if(messageLen === 126) {
        messageLen = data.readUInt16BE(2)
        mask = data.readUInt32BE(4);
    }else if(messageLen === 127) {
        messageLen = data.readBigUInt64BE(2)
        mask = data.readUInt32BE(10);
    }else {
        mask = data.readUInt32BE(2);
    }
    return unmaskMessage(data, 6, messageLen, mask);
}

function handshake(connection, message) {
    if(getHeaderValue('Connection', message) !== 'Upgrade') {
        connection.end('HTTP/1.1 400 Bad Request');
        return;
    }
    if(getHeaderValue('Upgrade', message) !== 'websocket') {
        connection.end('HTTP/1.1 400 Bad Request');
        return;
    }

    let webSocketKey = getHeaderValue('Sec-WebSocket-Key', message);
    let hash = generateAcceptValue(webSocketKey);

    connection.write(
        'HTTP/1.1 101 Switching Protocols\n' +
        'Upgrade: websocket\n' +
        'Connection: Upgrade\n' +
        `Sec-WebSocket-Accept: ${hash}\n\n`);
}

function getHeaderValue(name, req) {
    let lines = req.split('\n');
    for(let line of lines) {
        let headerName = line.split(':')
        if(headerName.includes(name)) {
            line = line.replace(name, '');
            line = line.replace(':', '');
            line = line.trim();
            return line;
        }
    }
}

function generateAcceptValue (webSocketKey) {
    return crypto
        .createHash('sha1')
        .update(webSocketKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
        .digest('base64');
}

function unmaskMessage(data, dataBegin, messageLen, maskingKey) {
    const ret = Buffer.alloc(messageLen);
    for (let i = 0, j = 0; i < messageLen; ++i, j = i % 4) {
        const shift = j === 3 ? 0 : (3 - j) << 3;
        const mask = (shift === 0 ? maskingKey : (maskingKey >>> shift)) & 0xFF;
        const source = data.readUInt8(dataBegin++);
        ret.writeUInt8(mask ^ source, i);
    }
    return ret.toString();
}

module.exports.WebSocketServer = WebSocketServer;