"use client";
import { Chess, Square, Move } from "chess.js";
import Piece from "@/components/square.tsx";
import React, { useEffect, useRef, useState } from "react";
import "@/app/App.css";
import { useSocket } from "@/contexts/socketContext";
import Clock from "./Clock";
import {
	playMoveHelper,
	toggleDataActiveHelper,
} from "@/utils/cheeBoardHelper";
import Loading from "./Loading";

// standard notation for chessBoard
const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
type ChessBoardProps = {
	roomId: string;
	authToken: string;
	username: string;
};
export default function ChessBoard({
	roomId,
	authToken,
	username,
}: ChessBoardProps) {
	const chess = useRef(new Chess());
	const socket = useSocket();
	const highlighted = useRef<string>("##");
	const kingCheckedPos = useRef<string>("##");
	const [roomJoined, setRoomJoined] = useState<boolean>(false);
	const [isGameOff, setIsGameOff] = useState<boolean>(true);

	if (!roomJoined) {
		socket.emit("joinRoom", {
			roomId: roomId,
			authToken: authToken,
			username: username,
		});
	}

	const gameOverByTime = useRef<boolean>(false);
	// const username= useRef<string| null>('');
	const [position, setPosition] = useState(chess.current.board());
	const [chessBoard, setChessBoard] = useState<React.ReactNode[]>([]);
	const [message, setMessage] = useState<string | null>(null);
	const [rotate, setRotate] = useState<boolean>(false);
	const [wClock, setWClock] = useState<number>(30 * 1000);
	const [bClock, setBClock] = useState<number>(30 * 1000);

	const [turn, setTurn] = useState<string>('w');
	const [roll, setRoll] = useState<string>('w');
	const refs = useRef<Record<string, React.RefObject<HTMLDivElement | null>[]>>(
		columns.reduce<Record<string, React.RefObject<HTMLDivElement | null>[]>>(
			(acc, col) => {
				acc[col] = Array.from({ length: 8 }, () =>
					React.createRef<HTMLDivElement>()
				);
				return acc;
			},
			{}
		)
	);

	function toggleDataActive(key: string, value: string) {
		const moves = chess.current.moves({ square: key as Square, verbose: true });
		toggleDataActiveHelper(key, value, moves, refs);
	}
	function playMove(movePlayed: Move | null, opponent: boolean) {
		const res= playMoveHelper(
			movePlayed,
			opponent,
			refs,
			kingCheckedPos,
			highlighted,
			setMessage,
			chess.current.board()
		);
		if(res){
			setTurn((prev) => (prev === 'w' ? 'b' : 'w'));
		}
	}
	function handleSquareClick(e: React.MouseEvent<HTMLDivElement>) {
		e.preventDefault();
		if (gameOverByTime.current) {
			return;
		}
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
		if (square.dataset.active == "true") {
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
					const userPrefer: string | null = prompt(
						"Please type only one: q/r/n/b"
					);
					movePlayed = chess.current.move({
						from: move,
						to: squareKey,
						promotion: `${userPrefer ? userPrefer : "q"}`,
					});
				} catch (error) {
					console.log(error);
				}
				console.log(error);
			}
			if (movePlayed?.color == roll) {
				socket.emit("sendMessage", {
					roomId: roomId,
					username: username,
					message: movePlayed,
				});
			}
			playMove(movePlayed, false);
			return;
		}
		// Handle toggling highlight and selection
		if (highlighted.current != "##") {
			toggleDataActive(highlighted.current, "false");
			if (highlighted.current == squareKey) {
				highlighted.current = "##";
				return;
			}
		}
		if (square.className) {
			const className = square.className;
			const color = className >= "A" && className <= "Z" ? "w" : "b";
			if (color != roll) {
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
					classNames = `${initialPieceInfo.color === "b"
						? initialPieceInfo?.type
						: (initialPieceInfo?.type).toUpperCase()
						}`;
				}
				board.push(
					<div
						key={`${columns[col]}${row}`}
						className={`${squareColor ? "black" : "white"}`}
					>
						<Piece
							ref={refs.current[column][row - 1]}
							customKey={`${columns[col]}${row}`}
							className={classNames}
							onClick={handleSquareClick}
							customCheck={"false"}
							style={{ transform: `rotate(${rotate ? 180 : 0}deg)` }}
						/>
					</div>
				);
			}
		}
		setChessBoard(board);
	}, [position, rotate]);
	const closePopup = () => {
		setMessage(null);
	};
	// all sockets protocal which will be recieved here
	useEffect(() => {
		socket.on("connect", () => {
			console.log(`User with socket id${socket.id} connected.`);
		});
		socket.on("disconnect", () => {
			console.log(`User with socket id${socket.id} disconnected`);
			setRoomJoined(false);
		});
		socket.on("receiveMessage", (msg) => {
			const movePlayedByOpponent: Move = msg.message;
			const fromSquare = movePlayedByOpponent.from;
			const toSquare = movePlayedByOpponent.to;
			// const prevDebug=chess.current.fen();
			// console.log(prevDebug);
			playMove(movePlayedByOpponent, true);
			try {
				if (movePlayedByOpponent.flags.includes("p")) {
					chess.current.move({
						from: fromSquare,
						to: toSquare,
						promotion: movePlayedByOpponent.promotion,
					});
				} else {
					chess.current.move({ from: fromSquare, to: toSquare });
				}
			} catch (e) {
				console.log(e);
			}
			// console.log(chess.current.fen,chess.current.fen()===prevDebug)
		});
		socket.on("gameStart", (msg) => {
			console.log(msg);
			setMessage("Let's Begin the match");
			// start the clock
			setIsGameOff(false);
		});
		socket.on("roll", (msg) => {
			setRoll(msg);
			if (roll == 'b') {
				setRotate(true);
			}
		});
		socket.on("joinedRoom", (response) => {
			if (response.success) {
				// console.log(response.moves);
				chess.current.load(response.fen);
				setPosition(chess.current.board());
				// \to:do set clocks
				setIsGameOff(!response.gameState);
				setRoll(response.roll);
				setTurn(String(chess.current.turn()));
				if (response.roll === 'b') {
					setRotate(true);
				}
			}
			setRoomJoined(true);
		});
		socket.on("gameEnd", (response) => {
			setMessage(response);
			gameOverByTime.current= true;
		});
		socket.on("clockUpdate", (response) => {
			setWClock(response.w);
			setBClock(response.b);
		});
	}, []);
	if (roomJoined) {
		return (
			<>
				<div className="chessBoard-container">
					<div className="experiment">
						<Clock className="left" time={roll === 'b' ? wClock : bClock} stop={isGameOff || (roll==='b'? (turn!=='w') : (turn!=='b'))} setTime={roll === 'b' ? setWClock : setBClock} />
						<div className="chessBoard" style={{ transform: `rotate(${rotate ? 180 : 0}deg)` }}>
							{chessBoard}
						</div>
						<Clock className="left" time={roll === 'b' ? bClock : wClock} stop={isGameOff || (roll=='b'? (turn!=='b') : (turn!=='w'))} setTime={roll === 'b' ? setBClock : setWClock} />
					</div>
					{message && (
						<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
							<div className="relative bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-md text-center">
								<button
									onClick={closePopup}
									className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
								>
									&times;
								</button>
								<h2 className="text-lg font-bold mb-2">Announcement</h2>
								<p className="text-gray-700">{message}</p>
							</div>
						</div>
					)}
				</div>
			</>
		);
	} else {
		return <Loading />
	}
}
