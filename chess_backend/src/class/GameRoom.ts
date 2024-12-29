import Board from './Board';
import Clock from './Clock';
import { Move } from 'chess.js';
export default class GameRoom{
    Id:string;
    player1:WebSocket;
    player2:WebSocket;
    p1Clock:Clock;
    p2Clock:Clock;
    board:Board;
    moves: Move[];
    constructor(id:string, p1 : WebSocket, p2: WebSocket){
        this.Id = id;
        this.player1 = p1;
        this.player2 = p2;
        this.p1Clock = new Clock(60);
        this.p2Clock = new Clock(60);
        this.board = new Board();
        this.moves = [];
        this.player1.send(JSON.stringify({"Message":`Your Room Id is :${this.Id}`})) // we will also send board and times
        this.player2.send(JSON.stringify({"Message":`Your Room Id is :${this.Id}`})) // we will also send board and times
        const p1Ended:Promise<void> = this.p1Clock.hasEnded().then((e)=>{
            this.player1.send(JSON.stringify({"Message":`${this.Id} Room, and Player1's Clock Ended.`}));
            this.player2.send(JSON.stringify({"Message":`${this.Id} Room, and Player1's Clock Ended.`}));
            this.p2Clock.stopCountdown();
            console.log("")
        });
        const p2Ended:Promise<void> = this.p2Clock.hasEnded().then((e)=>{
            this.player1.send(JSON.stringify({"Message":`${this.Id} Room, and Player2's Clock Ended.`}));
            this.player2.send(JSON.stringify({"Message":`${this.Id} Room, and Player2's Clock Ended.`}));
            this.p1Clock.stopCountdown();
        });
    }   
    // TODO:
    // Top level function to add validation logic
    //  Function to Handle new moves and send data subsequently
    


    

}