"use client";
import { Chess, Square,Move } from 'chess.js';
import Piece from '@/components/square.tsx';
import React, { useEffect, useRef, useState, Suspense,RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { playMoveHelper, toggleDataActiveHelper } from '@/utils/cheeBoardHelper';

const socket = io('wss://chess-backend-b7hj.onrender.com',{transports: ['websocket']});
import { useSearchParams } from 'next/navigation';

// standard notation for chessBoard
const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
// for fetching roomId and authToken for a room
async function fetchData(link: string) {
	const data = await fetch(link);
	const details = await data.json();
	return details;
}
interface roomComponentProps {
  roomId: RefObject<string | null>;
  authToken: RefObject<string | null>;
	roll: RefObject<string|null>;
}
function RoomComponent({roomId,authToken,roll}:roomComponentProps) {
	const router = useRouter();
	roomId.current = useSearchParams().get('roomId');
	authToken.current = useSearchParams().get('authToken');
	roll.current= useSearchParams().get('roll');
	if (roomId.current && authToken.current) {
		// console.log(roomId.current,authToken.current);
		socket.emit("joinRoom",{"roomId":roomId.current,"authToken":authToken.current});
		return (
			<>
				<div>Copy Url from your browser and send to your friend</div>
			</>
		);
	} else if (roomId.current || authToken.current) {
		return (
			<>
				<div>Ask correct params from your friend</div>
			</>
		);
	} else {
		return (
			<>
				<button onClick={(e) => {
					e.preventDefault();
					fetchData('/ids').then(roomDetails => {
						const newLink:string= "/?roomId="+roomDetails.roomId+"&authToken="+roomDetails.authToken+"&roll=w";
						// redirect to new link
						socket.emit("createRoom",{"roomId":roomDetails.roomId,"authToken":roomDetails.authToken});
						router.push(newLink);
						// console.log(roomDetails);
					}).catch(error => {
						console.error('Error fetching room details:', error);
					});
				}}>Get Link</button>
			</>
		);
	}
}

export default function ChessBoard() {
	const chess = new Chess();
	const highlighted = useRef<string>('##');
	const kingCheckedPos = useRef<string>("##");
	const roomId = useRef<string|null>('');
	const authToken = useRef<string|null>('');
	const roll= useRef<string|null>('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [position, setPosition] = useState(chess.board());
	const [chessBoard, setChessBoard] = useState<React.ReactNode[]>([]);
	const [message, setMessage] = useState<string | null>("Let's Begin match");

	const refs = useRef<Record<string, React.RefObject<HTMLDivElement | null>[]>>(
		columns.reduce<Record<string, React.RefObject<HTMLDivElement | null>[]>>((acc, col) => {
			acc[col] = Array.from({ length: 8 }, () => React.createRef<HTMLDivElement>());
			return acc;
		}, {})
	);

	function toggleDataActive(key: string, value: string){
		const moves = chess.moves({ square: key as Square, verbose: true });
		toggleDataActiveHelper(key,value,moves,refs);
	}
	function playMove(movePlayed:Move|null){
		playMoveHelper(movePlayed,refs,kingCheckedPos,highlighted,setMessage,chess.board());
	}
	function handleSquareClick(e: React.MouseEvent<HTMLDivElement>) {
		if (chess.isDraw()) {
			if (chess.isStalemate()) {
				setMessage("Draw by Stalemate");
			} else if (chess.isInsufficientMaterial()) {
				setMessage("Draw due to Insufficient Material.");
			} else if (chess.isDrawByFiftyMoves()) {
				setMessage("Draw due to 50 moves without capturing or check");
			} else if (chess.isThreefoldRepetition()) {
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
			let movePlayed: ReturnType<typeof chess.move> | null = null;
			try {
				// try running to intial square to target square
				movePlayed = chess.move({ from: move, to: squareKey });
				// console.log(movePlayed);
			} catch (error) {
				// It must be a promotion move since using only those square where move is possible
				try {
					const userPrefer: string | null = prompt("Please type only one: q/r/n/b");
					movePlayed = chess.move({ from: move, to: squareKey, promotion: `${userPrefer ? userPrefer : 'q'}` });
				} catch (error) {
					console.log(error);
				}
				console.log(error);
			}
			if(movePlayed?.color==roll.current){
				socket.emit("sendMessage",{"roomId":roomId.current,"message":movePlayed});
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
	}, []);
	setTimeout(() => {
		setMessage(null);
	}, 5000);
	// all sockets protocal which will be recieved here
	socket.on("connect", () => {
		console.log(`User with socket id${socket.id} connected.`); 
	});
	socket.on("disconnect",()=>{
		console.log(`User with socket id${socket.id} disconnected`);
	});
	socket.on("receiveMessage",(msg)=>{
		console.log(msg.message);
		const movePlayedByOpponent= msg.message;
		const fromSquare= movePlayedByOpponent.from;
		const toSquare= movePlayedByOpponent.to;
		if(movePlayedByOpponent.flags.includes("p")){
			chess.move({ from: fromSquare, to: toSquare, promotion: movePlayedByOpponent.promotion });
		}else{
			chess.move({ from: fromSquare, to: toSquare });
		}
		playMove(movePlayedByOpponent);
	});
	return (
		<>
			<Suspense fallback={<div>Loading...</div>}>
				<RoomComponent  roomId={roomId} authToken={authToken} roll={roll}/>
			</Suspense>
			<div className="chessBoard">
				{chessBoard}
				<div
					className={`announcement ${message ? "visible" : "hidden"}`}
					aria-hidden={!message}
				>
					{message}
				</div>
			</div>
		</>
	);
}