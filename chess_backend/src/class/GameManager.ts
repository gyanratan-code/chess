import GameRoom from "./GameRoom";
import { v4 as uuidv4 } from 'uuid'; 
const generateUniqueId = (): string => { return uuidv4(); };
export default class GameManager {
    rooms:GameRoom[];
    // waitingPlayer:WebSocket|null;
    // coreSocket:WebSocket;
    constructor() {
        this.rooms = [];
        // this.coreSocket= coreSocket;
    }
    AddRoom(player1:WebSocket, player2:WebSocket):void {
        const id = generateUniqueId();
        const gr = new GameRoom(id,player1, player2);
        this.rooms.push(gr);
    }
 
}