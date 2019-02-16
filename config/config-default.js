module.exports = {
    test: true, // sends regular broadcasts on the test channel
    server: { // passed to the websocket server, see https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback
        port: 8000
    }
}