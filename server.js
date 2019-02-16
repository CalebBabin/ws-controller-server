let config = {};
try {
    config = require(`${__dirname}/config/config.js`);
} catch (e) {
    config = require(`${__dirname}/config/config-default.js`);
}

const WebSocket = require('ws');
 
const wss = new WebSocket.Server(config.server);

wss.on('connection', function (ws, req) {
	ws.on('pong', function () {
		this.isAlive = true;
	});
    ws.on('message', (message)=>{
        incoming(message, ws);
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