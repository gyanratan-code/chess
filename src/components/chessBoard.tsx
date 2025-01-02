"use client";
import { Chess, Square, Move } from 'chess.js';
import Piece from '@/components/square.tsx';
import React, { use, useEffect, useRef, useState } from 'react';
import '@/app/App.css';
import { useSocket } from '@/contexts/socketContext';
import { playMoveHelper, toggleDataActiveHelper } from '@/utils/cheeBoardHelper';

// standard notation for chessBoard
const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
type ChessBoardProps = {
	roomId: string;
	authToken: string;
	username: string;
};
export default function ChessBoard({ roomId, authToken, username }: ChessBoardProps) {
	const chess = useRef(new Chess())
	const socket= useSocket();
	const highlighted = useRef<string>('##');
	const kingCheckedPos = useRef<string>("##");
	const roomJoined = useRef<boolean>(false);

	if (!roomJoined.current) {
		socket.emit("joinRoom", { "roomId": roomId, "authToken": authToken, "username": username });
		roomJoined.current=(true);
	}
	// const roomId = useRef<string | null>('');
	// const authToken = useRef<string | null>('');
	const roll = useRef<string | null>('');
	// const username= useRef<string| null>('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [position, setPosition] = useState(chess.current.board());
	const [chessBoard, setChessBoard] = useState<React.ReactNode[]>([]);
	const [message, setMessage] = useState<string | null>("Let's Begin match");

	const refs = useRef<Record<string, React.RefObject<HTMLDivElement | null>[]>>(
		columns.reduce<Record<string, React.RefObject<HTMLDivElement | null>[]>>((acc, col) => {
			acc[col] = Array.from({ length: 8 }, () => React.createRef<HTMLDivElement>());
			return acc;
		}, {})
	);

	function toggleDataActive(key: string, value: string) {
		const moves = chess.current.moves({ square: key as Square, verbose: true });
		toggleDataActiveHelper(key, value, moves, refs);
	}
	function playMove(movePlayed: Move | null) {
		playMoveHelper(movePlayed, refs, kingCheckedPos, highlighted, setMessage, chess.current.board());
	}
	function handleSquareClick(e: React.MouseEvent<HTMLDivElement>) {
		if (chess.current.isDraw()) {
			if (chess.current.isStalemate()) {
				setMessage("Draw by Stalemate");
			} else if (chess.current.isInsufficientMaterial()) {
				setMessage("Draw due to Insufficient Material.");
			} else if (chess.current.isDrawByFiftyMoves()) {
				setMessage("Draw due to 50 moves without capturing or check");
			} else if (chess.current.isThreefoldRepetition()) {
				setMessage("Draw due to Three-Fold Repetition");
			} else {
				setMessage("Match is Drawn");
			}
			return;
		}
		const square = e.target as HTMLDivElement;
		const squareKey: string = square.dataset?.key || "";
		// Handle move logic
		if (square.dataset.active == 'true') {
			toggleDataActive(highlighted.current, "false");
			const move = highlighted.current;
			let movePlayed: ReturnType<typeof chess.current.move> | null = null;
			try {
				// try running to intial square to target square
				movePlayed = chess.current.move({ from: move, to: squareKey });
				// console.log(movePlayed);
			} catch (error) {
				// It must be a promotion move since using only those square where move is possible
				try {
					const userPrefer: string | null = prompt("Please type only one: q/r/n/b");
					movePlayed = chess.current.move({ from: move, to: squareKey, promotion: `${userPrefer ? userPrefer : 'q'}` });
				} catch (error) {
					// console.log(error);
				}
				// console.log(error);
			}
			if (movePlayed?.color == roll.current) {
				socket.emit("sendMessage", { "roomId": roomId, "username": username, "message": movePlayed });
			}
			playMove(movePlayed);
			return;
		}
		// Handle toggling highlight and selection
		if (highlighted.current != '##') {
			toggleDataActive(highlighted.current, "false");
			if (highlighted.current == squareKey) {
				highlighted.current = "##";
				return;
			}
		}
		if (square.className) {
			const className = square.className;
			const color = (className >= 'A' && className <= 'Z') ? 'w' : 'b';
			// console.log(color, roll.current);
			// console.log(typeof (color), typeof (roll.current));
			if (color != roll.current) {
				return;
			}
		} else {
			return;
		}
		toggleDataActive(squareKey, "true");
		highlighted.current = squareKey;
	}

	useEffect(() => {
		const board = [];
		for (let row = 8; row > 0; row -= 1) {
			for (let col = 0; col < 8; col += 1) {
				const squareColor = (row + col) % 2;
				const column = columns[col];
				const initialPieceInfo = position[8 - row][col];
				let classNames = "";
				if (initialPieceInfo) {
					classNames = `${initialPieceInfo.color === 'b' ? initialPieceInfo?.type : (initialPieceInfo?.type).toUpperCase()}`;
				}
				board.push(
					<div key={`${columns[col]}${row}`} className={`${squareColor ? "black" : "white"}`}>
						<Piece ref={refs.current[column][row - 1]} customKey={`${columns[col]}${row}`} className={classNames} onClick={handleSquareClick} customCheck={"false"} />
					</div>
				);
			}
		}
		setChessBoard(board);
	}, [position]);
	setTimeout(() => {
		setMessage(null);
	}, 5000);
	// all sockets protocal which will be recieved here
	socket.on("connect", () => {
		console.log(`User with socket id${socket.id} connected.`);
	});
	socket.on("disconnect", () => {
		console.log(`User with socket id${socket.id} disconnected`);
		roomJoined.current=(false);
	});
	socket.on("receiveMessage", (msg) => {
		const movePlayedByOpponent: Move = msg.message;
		const fromSquare = movePlayedByOpponent.from;
		const toSquare = movePlayedByOpponent.to;
		// const prevDebug=chess.current.fen();
		// console.log(prevDebug);
		playMove(movePlayedByOpponent);
		try {
			if (movePlayedByOpponent.flags.includes("p")) {
				chess.current.move({ from: fromSquare, to: toSquare, promotion: movePlayedByOpponent.promotion });
			} else {
				chess.current.move({ from: fromSquare, to: toSquare });
			}
		} catch (e) {
			// console.log(e);
		}
		// console.log(chess.current.fen,chess.current.fen()===prevDebug)
	});
	socket.on("gameStart", (msg) => {
		// console.log(typeof (msg), msg);
		// start the clock
		// \to:do
	});
	socket.on("roll", (msg) => {
		roll.current = msg;
	});
	socket.on("joinedRoom", (response) => {
		if (response.success) {
			// console.log(response.moves);
			chess.current.load(response.fen);
			setPosition(chess.current.board());
		}
	});
	return (
		<>
				<div className='chessBoard-container'>
					<div className="chessBoard">
						{chessBoard}
						<div
							className={`announcement ${message ? "visible" : "hidden"}`}
							aria-hidden={!message}
						>
							{message}
						</div>
					</div>
				</div>
		</>
	);
}