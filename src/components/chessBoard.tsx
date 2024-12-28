"use client";
import {Chess} from '@/lib/chess/chess';
import Square from '@/components/square.tsx';
import React,{ useEffect, useRef,useState } from 'react';

export default function ChessBoard(){
	let chess= new Chess();

	const [position,setPosition] = useState(chess.board());
	// @ts-ignore
	const [chessBoard, setChessBoard] = useState<JSX.Element[]>([]);
	let highlighted = useRef<string>('##');

	const columns=['a','b','c','d','e','f','g','h'];
	const refs = useRef(
    Object.fromEntries(
      columns.map((col) => [
        col,
        Array.from({ length: 8 }, () => React.createRef<HTMLDivElement>()),
      ])
    )
  );

	const toggleDataActive =(key:string,value:string)=>{
		// const squareKey:string= element.dataset.key;
		// @ts-ignore
		const moves= chess.moves({ square: key });
		moves.forEach((move)=>{
			console.log(move);
			// handle castling and en-pessant
			move= (move.endsWith('+')? move.slice(0,-1): move);
			const possibleMoving = refs.current[move[move.length-2]][parseInt(move[move.length-1])-1];
			if (possibleMoving.current) {
				possibleMoving.current.dataset.active = value;
			}
		})
	}

	function handleSquareClick(e:React.MouseEvent<HTMLDivElement>){
		const square= e.target as HTMLDivElement;
		// @ts-ignore
		const squareKey:string= square.dataset.key;
		if(square.dataset.active=='true'){
			toggleDataActive(highlighted.current,"false");
			const move= highlighted.current;
			const movePlayed= chess.move({ from: move, to: squareKey });
			console.log(movePlayed);
			const prevSquare= refs.current[move[move.length-2]][parseInt(move[move.length-1])-1];
			square.className= prevSquare.current?.className;
			prevSquare.current.className="";
			highlighted.current="##";
			return;
		}
		// if(highlighted.current!='##'){
		// 	const isMoveAvailable = ;
		// 	if(isMoveAvailable.current){
		// 		isMoveAvailable.current.dataset.
		// 	}
		// }
		if(highlighted.current!='##'){
			toggleDataActive(highlighted.current,"false");
			if(highlighted.current==squareKey){
				highlighted.current ="##";
				return;
			}
		}
		toggleDataActive(squareKey,"true");
		highlighted.current = squareKey;
	}


	useEffect(() =>{
		const board=[];
		for(let row=8;row>0;row-=1){
			for(let col=0;col<8;col+=1){
				const squareColor= (row+col)%2;
				const column= columns[col];
				const initialPieceInfo= position[8-row][col];
				let classNames="";
				if(initialPieceInfo){
					classNames= `${initialPieceInfo.color==='b' ?initialPieceInfo?.type : (initialPieceInfo?.type).toUpperCase() }`;
				}
				board.push(
					<div key={`${columns[col]}${row}`} className={`${squareColor ? "black":"white"}`}>
						<Square ref={refs.current[column][row - 1]} customKey={`${columns[col]}${row}`} className={classNames} onClick={handleSquareClick}/>
					</div>
				);
			}
		}
		setChessBoard(board);
	},[]);
	return(
		<div className="chessBoard">
			{chessBoard}
		</div>
	);
}