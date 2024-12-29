import { Chess } from 'chess.js';
class Board {
    chess: Chess;

    constructor() {
        this.chess = new Chess();
        
    }

    getBoard() {
        return this.chess.board();
    }

    makeMove(move: string) {
        const result = this.chess.move(move);
        if (result === null) {
            throw new Error("Invalid move");
        }
        return result;
    }

    resetBoard() {
        this.chess.reset();
    }

    getFen() {
        return this.chess.fen();
    }

    getPgn() {
        return this.chess.pgn();
    }
}

export default Board;
