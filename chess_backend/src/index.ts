import  { WebSocketServer } from "ws";
import GameManager from "./class/GameManager";
const GM = new GameManager();
var waiter:WebSocket|null = null;
const wss = new WebSocketServer({port:4040});
console.log("Websocket Server on port ws://localhost:4040");
wss.on("connection", (ws:WebSocket)=>{
    if(waiter){
        GM.AddRoom(waiter, ws);
    }
    else{
        waiter = ws
    }
})