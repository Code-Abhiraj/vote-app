const { WebSocketServer, WebSocket } = require('ws');

const setupWebSocketServer = () => {
    const wss = new WebSocketServer({ port: 5001 });

    const clients = new Set();

    wss.on('connection', (ws) => {
        
        ws.on('message', async (data) => {
            const d = data.toString();
            
              if(d === 'Init') {
                console.log(`connected: ${ws}`);
                clients.add(ws);
              }
              if(d === 'Vote') {
                clients.forEach((client) => {
                    console.log(client.readyState);
                    if(client.readyState === WebSocket.OPEN) {
                        client.send('Voted');
                    }
                })
                ws.send('Done');
              }
        });

        ws.on('close', () => {
            console.log(`disconnected: ${ws}`);
            clients.delete(ws);
        });
    });
};

module.exports = {setupWebSocketServer};