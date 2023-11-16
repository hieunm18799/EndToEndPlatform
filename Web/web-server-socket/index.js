import { WebSocketServer } from "ws";
import 'dotenv/config'

const CONNECTION = {
    WEB: 'web',
    AGENT: 'daemon',
}

if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
}

// console.log(process.env.WS_PORT);
const wss = new WebSocketServer({ port: process.env.WS_PORT });

wss.on("connection", (ws) => {
    ws.on("message", (data) => {
        console.log("received: %s", data);
        data = JSON.parse(data);
        
        if (data.hello) {
            ws.send(JSON.stringify({
                hello: true,
                err: undefined
            }));

            ws.id = data.hello.connection + '-' + data.hello.projectId;
        } else {
            console.log(ws.id);
            if (ws.id.indexOf(CONNECTION.WEB) > -1) {
                const daemon_id = CONNECTION.AGENT + ws.id.slice(ws.id.indexOf(CONNECTION.WEB) + CONNECTION.WEB.length);
                wss.clients.forEach(x => {
                    if (x.id === daemon_id) x.send(JSON.stringify(data))
                });
            } else {
                const web_id = CONNECTION.WEB + ws.id.slice(ws.id.indexOf(CONNECTION.AGENT) + CONNECTION.AGENT.length);
                wss.clients.forEach(x => {
                    if (x.id === web_id) x.send(JSON.stringify(data));
                });
            }
        }
    });
});