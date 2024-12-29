import Board from './Board';
import Clock from './Clock';
// import { Move } from 'chess.js';
import {Move} from 'chess.js';

enum STATE{
    A = 0,
    B = 1,
    E = 2
}
export default class GameRoom{
    Id:string;
    player1:WebSocket;
    player2:WebSocket;
    p1Clock:Clock;
    p2Clock:Clock;
    board:Board;
    moves: Move[];
    gameState:STATE;
    constructor(id:string, p1 : WebSocket, p2: WebSocket){
        this.Id = id;
        this.player1 = p1;
        this.player2 = p2;
        this.p1Clock = new Clock(60);
        this.p2Clock = new Clock(60);
        this.board = new Board();
        this.moves = [];
        this.gameState = STATE.A;
        this.player1.send(JSON.stringify({"Message":`Your Room Id is :${this.Id}`, "Board":this.board})) // we will also send board and times
        this.player2.send(JSON.stringify({"Message":`Your Room Id is :${this.Id}`, "Board":this.board})) // we will also send board and times
        this.p1Clock.startCountdown(); // Player 1's Turn so CountDown Started
        const p1Ended:Promise<void> = this.p1Clock.hasEnded().then((e)=>{
            this.player1.send(JSON.stringify({"Message":`${this.Id} Room, and Player1's Clock Ended.`}));
            this.player2.send(JSON.stringify({"Message":`${this.Id} Room, and Player1's Clock Ended.`}));
            this.p2Clock.stopCountdown();
            this.gameState = STATE.E;
            console.log("Player1's Clock Ended First");
        });
        const p2Ended:Promise<void> = this.p2Clock.hasEnded().then((e)=>{
            this.player1.send(JSON.stringify({"Message":`${this.Id} Room, and Player2's Clock Ended.`}));
            this.player2.send(JSON.stringify({"Message":`${this.Id} Room, and Player2's Clock Ended.`}));
            this.p1Clock.stopCountdown();
            this.gameState = STATE.E;
            console.log("Player2's Clock Ended First");
        });
        this.startGame();
    }   

    // TODO:
    // Top level function to add validation logic
    validateMove = (data: any): boolean => {
        const { from, to, before, after } = data;
        // 1. Check if the current board matches the "before" board
        console.log("Current Board FEN:", this.board.chess.fen());
        console.log("Before FEN:", before);
        if (this.board.chess.fen() !== before) {
            console.error("Board state mismatch: before");
            return false;
        }
        // 2. Clone the board and attempt the move
        const tempBoard = new Board();
        tempBoard.chess.load(before); // Load the 'before' FEN
        const move = tempBoard.chess.move({ from, to });
        // If the move is invalid, return false
        if (!move) {
            console.error("Invalid move from:", from, "to:", to);
            return false;
        }
        // 3. Check if the resulting board matches the "after" board
        console.log("After FEN after move:", tempBoard.chess.fen());
        console.log("Expected after FEN:", after);
        // if (tempBoard.chess.fen() !== after) {
        //     console.error("Board state mismatch: after");
        //     return false;
        // }
        return true;
    };

    //  Function to Handle new moves and send data subsequently
    handlePlayer1Move(event:MessageEvent) {
        if(this.gameState != STATE.A){
            throw new Error("Invalid Player's Turn");
        }
        const handleMove = (event: MessageEvent) => {
            console.log(event.data);
            const data = JSON.parse(event.data);
            if (data && data.from && data.to && data.before && data.after) {
                const isValid = this.validateMove(data);
                if (isValid) {
                    // Apply the move to the actual board
                    this.board.chess.move({ from: data.from, to: data.to });
                    // const nextMove = new Move({from: data.from, to: data.to})
                    // this.moves.push(); // TODO: Correct Move Pushing
                    // Switch turn logic
                    this.p1Clock.stopCountdown();
                    this.p2Clock.startCountdown();
                    this.gameState = STATE.B;
    
                    // Notify both players
                    this.player1.send(
                        JSON.stringify({
                            Message: "Move accepted",
                            Move: { from: data.from, to: data.to },
                            Board: this.board.chess.fen(),
                        })
                    );
                    this.player2.send(
                        JSON.stringify({
                            Message: "Opponent made a move",
                            Move: { from: data.from, to: data.to },
                            Board: this.board.chess.fen(),
                        })
                    );
                } else {
                    this.player1.send(
                        JSON.stringify({
                            Message: "Invalid move or board state",
                        })
                    );
                }
            } else {
                this.player1.send(
                    JSON.stringify({
                        Message: "Invalid message format",
                    })
                );
            }
            this.player1.removeEventListener("message", handleMove);
        };
        handleMove(event);
    }

    handlePlayer2Move(event:MessageEvent){
        if(this.gameState != STATE.B){
            throw new Error("Invalid Player's Turn");
        }
        const handleMove = (event: MessageEvent) => {
            console.log(event.data);
            const data = JSON.parse(event.data);
            if (data && data.from && data.to && data.before && data.after) {
                const isValid = this.validateMove(data);
                if (isValid) {
                    this.board.chess.move({ from: data.from, to: data.to });
                    // const nextMove = new Move({from: data.from, to: data.to})
                    // this.moves.push(); // TODO: Correct Move Pushing
                    this.p2Clock.stopCountdown();
                    this.p1Clock.startCountdown();
                    this.gameState = STATE.A;
                    // Notify both players
                    this.player2.send(
                        JSON.stringify({
                            Message: "Move accepted",
                            Move: { from: data.from, to: data.to },
                            Board: this.board.chess.fen(),
                        })
                    );
                    this.player1.send(
                        JSON.stringify({
                            Message: "Opponent made a move",
                            Move: { from: data.from, to: data.to },
                            Board: this.board.chess.fen(),
                        })
                    );
                } else {
                    this.player2.send(
                        JSON.stringify({
                            Message: "Invalid move or board state",
                        })
                    );
                }
            } else {
                this.player2.send(
                    JSON.stringify({
                        Message: "Invalid message format",
                    })
                );
            }
            this.player2.removeEventListener("message", handleMove);
        };
        handleMove(event);
    }
    private endGame() {
        this.player1.send(JSON.stringify({ Message: "Game Over" }));
        this.player2.send(JSON.stringify({ Message: "Game Over" }));
        console.log(`Game Room ${this.Id} has ended.`);
    }
    private waitForPlayerMove(player: WebSocket, handler: (event: MessageEvent) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const wrappedHandler = (event: MessageEvent) => {
                try {
                    handler(event);
                    // console.log(this.board.getBoard());
                    resolve(); 
                } catch (error) {
                    reject(error); 
                } finally {
                    player.removeEventListener("message", wrappedHandler);
                }
            };
            player.addEventListener("message", wrappedHandler);
        });
    }
    
    startGame() {
        const playTurn = async () => {
            while (this.gameState !== STATE.E) {
                if (this.gameState === STATE.A) {
                    console.log("Waiting for Player 1's move...");
                    await this.waitForPlayerMove(this.player1, (event) => this.handlePlayer1Move(event));
                } else if (this.gameState === STATE.B) {
                    console.log("Waiting for Player 2's move...");
                    await this.waitForPlayerMove(this.player2, (event) => this.handlePlayer2Move(event));
                }
            }
            console.log("Game Over!");
            this.endGame();
        };
    
        playTurn().catch((error) => {
            console.error("Error during game execution:", error);
        });
    }
    

}