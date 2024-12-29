"use client";
import { Chess } from '@/lib/chess/chess';
import Square from '@/components/square.tsx';
import React, { useEffect, useRef, useState } from 'react';

export default function ChessBoard() {
	let chess = new Chess();
	const [position, setPosition] = useState(chess.board());
	// @ts-ignore
	const [chessBoard, setChessBoard] = useState<JSX.Element[]>([]);
	let highlighted = useRef<string>('##');

	const get_piece_position = ( piece: { type: string, color: string} ) => {
    let squares: string[] = [];
      chess.board().map(row => {
        row.map(p => {
            if (p?.color === piece.color && p?.type === piece.type) {
                squares.push(p.square)
            }
            
        })
    })
    return squares;
  }
	const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
	const refs = useRef(
		Object.fromEntries(
			columns.map((col) => [
				col,
				Array.from({ length: 8 }, () => React.createRef<HTMLDivElement>()),
			])
		)
	);

	const toggleDataActive = (key: string, value: string) => {
		// Get possible moves for the selected square
		// @ts-ignore
		const moves = chess.moves({ square: key, verbose: true });
		moves.forEach((move) => {
			// Handle castling
			if (move.flags.includes("k") || move.flags.includes("q")) {
				// King-side castling (O-O)
				const rookSquare = move.flags.includes("k")
					? refs.current[key[0]][7] // Last square in the row
					: refs.current[key[0]][0]; // First square in the row
				// Mark the rook's square as active
				if (rookSquare.current) {
					rookSquare.current.dataset.active = value;
				}
			}
			// Handle en passant
			if (move.flags.includes("e")) {
				const captureSquare = refs.current[move.to[0]][parseInt(move.to[1]) - 1];
				if (captureSquare.current) {
					captureSquare.current.dataset.active = value;
				}
			}
			// Handle normal moves
			const targetSquare = refs.current[move.to[0]][parseInt(move.to[1]) - 1];
			if (targetSquare.current) {
				targetSquare.current.dataset.active = value;
			}
		});
	};


	function handleSquareClick(e: React.MouseEvent<HTMLDivElement>) {
		const square = e.target as HTMLDivElement;
		// @ts-ignore
		const squareKey: string = square.dataset.key;
		// Handle move logic
		if (square.dataset.active == 'true') {
			toggleDataActive(highlighted.current, "false");
			const move = highlighted.current;
			const movePlayed = chess.move({ from: move, to: squareKey });
			// console.log(movePlayed);
			if (movePlayed) {
				// console.log(movePlayed);
				// check if opponent is check or mate
				if(movePlayed.san.at(-1)==='+'){
					const squareKing= get_piece_position({type:'k','color':(movePlayed.color==='b'?'w':'b')})[0];
					refs.current[squareKing[0]][parseInt(squareKing[1])-1].current.dataset.check="true"; //set data-active to true
				}else if(movePlayed.san.at(-1)==='#'){
					;
					//to do
				}else{
					const colors= ['b','w'];
					colors.forEach(color => {
						const squareKing= get_piece_position({type:'k','color':color})[0];
						refs.current[squareKing[0]][parseInt(squareKing[1])-1].current.dataset.check="false";
					});
				}
				// Handle castling
				if (movePlayed.flags.includes("k") || movePlayed.flags.includes("q")) {
					const isKingSide = movePlayed.flags.includes("k");
					const rookFromKey = movePlayed.color === "w"
						? (isKingSide ? "h1" : "a1") // White's king-side or queen-side rook
						: (isKingSide ? "h8" : "a8"); // Black's king-side or queen-side rook

					const rookToKey = movePlayed.color === "w"
						? (isKingSide ? "f1" : "d1") // White's king-side or queen-side rook destination
						: (isKingSide ? "f8" : "d8"); // Black's king-side or queen-side rook destination

					const rookFrom = refs.current[rookFromKey[0]][parseInt(rookFromKey[1])-1];
					const rookTo = refs.current[rookToKey[0]][parseInt(rookToKey[1])-1];
					console.log(rookFrom.current,rookTo.current);
					if (rookFrom && rookFrom.current && rookTo && rookTo.current) {
						rookTo.current.className = rookFrom.current.className; // Move rook class
						rookFrom.current.className = ""; // Clear previous rook square
					}
				}
				// Handle en passant
				if (movePlayed.flags.includes("e")) {
					const captureSquare = refs.current[movePlayed.to[0]][
						parseInt(movePlayed.to[1]) - 1 - (movePlayed.color === 'w' ? 1 : -1)
					];
					if (captureSquare.current) {
						captureSquare.current.className = ""; // Remove the captured pawn
					}
				}
				// Handle the promotion
				// create a prompt and then place it \to:do

				// Update the square for the moved piece
				const prevSquare = refs.current[move[0]][parseInt(move[1]) - 1];
				square.className = prevSquare.current?.className;
				prevSquare.current.className = "";
				// Reset highlighted
				highlighted.current = "##";
			}
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
						<Square ref={refs.current[column][row - 1]} customKey={`${columns[col]}${row}`} className={classNames} onClick={handleSquareClick} customCheck={"false"}/>
					</div>
				);
			}
		}
		setChessBoard(board);
	}, []);
	return (
		<div className="chessBoard">
			{chessBoard}
		</div>
	);
}