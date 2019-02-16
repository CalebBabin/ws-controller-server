let config = {};
try {
    config = require(`${__dirname}/config/config.js`);
} catch (e) {
    config = require(`${__dirname}/config/config-default.js`);
}


////////////////////////////////////////////////////////////
//////////////////////  Parse      /////////////////////////
//////////////////////  WebSocket  /////////////////////////
//////////////////////  Messages   /////////////////////////
////////////////////////////////////////////////////////////

const parseMessage = (message, socket) => {
    let data = {};
    try {
        data = JSON.parse(message);
    } catch (e) {
        console.error(e);
        return;
    }
    
    switch (data.c) { // "c" is short for "command"

        case 'l': // "l" is short for "listen"
            socket.channels[data.d] = true;
        break;

        case 's': // "s" is short for "send"
            broadcastMessage(data.c, {
                i: 'c', // Indicate message is coming from a controller
                d: data.d,
            });
        break;

    }
}

const broadcastMessage = (channel, data) => {
    const message = JSON.stringify(data);
    
    wss.clients.forEach(function each(ws) {
        if (ws.channels && ws.channels[channel] === true) {
            ws.send(message);
        }
    });

}

if (config.test) {
    setInterval(()=>{
        broadcastMessage('test', {
            i: 'c',
            d: [
                Math.floor(Math.random()*127),
                Math.floor(Math.random()*127),
                Math.floor(Math.random()*127)
            ]
        })
    }, 1000);
}

////////////////////////////////////////////////////////////
//////////////////////  Init       /////////////////////////
//////////////////////  WebSocket  /////////////////////////
//////////////////////  Server     /////////////////////////
////////////////////////////////////////////////////////////

const WebSocket = require('ws');
 
const wss = new WebSocket.Server(config.server);

wss.on('connection', function (ws, req) {
    ws.channels = {};

	ws.on('pong', function () {
		this.isAlive = true;
	});
    ws.on('message', (message)=>{
        parseMessage(message, ws);
    })
})

let interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            console.log("no beat, remove socket")
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping('', false, true);
    });
}, 30000);