import { type Square, PieceSymbol, Color, type Move } from "chess.js";

interface Board2DProp {
  square: Square;
  type: PieceSymbol;
  color: Color;
}
interface RefDomMap {
  current: Record<string, React.RefObject<HTMLDivElement | null>[]>;
}

export const getPiecePosition = (piece: { type: PieceSymbol; color: Color; board2d: (Board2DProp | null)[][] }): string[] => {
  const squares: string[] = [];
  piece.board2d.forEach(row => {
    row.forEach(p => {
      if (p && p.color === piece.color && p.type === piece.type) {
        squares.push(p.square);
      }
    });
  });
  return squares;
};

export const playMoveHelper = (movePlayed: Move | null, refs: RefDomMap, kingCheckedPos: { current: string }, highlighted: { current: string }, setMessage: React.Dispatch<React.SetStateAction<string | null>>, board2d: (Board2DProp | null)[][]) => {
  if (movePlayed) {
    // console.log(movePlayed);
    // check if opponent is check or mate
    if (kingCheckedPos.current != "##") {
      const squareKing: string = kingCheckedPos.current;
      const squareRef = refs.current?.[squareKing[0]]?.[parseInt(squareKing[1]) - 1];
      if (squareRef?.current) {
        squareRef.current.dataset.check = "false";
      }
    }
    kingCheckedPos.current = "##";
    if (movePlayed.san.at(-1) === '+') {
      const squareKing = getPiecePosition({ type: 'k', 'color': (movePlayed.color === 'b' ? 'w' : 'b'), board2d: board2d })[0];
      const squareRef = refs.current?.[squareKing[0]]?.[parseInt(squareKing[1]) - 1];
      if (squareRef?.current) {
        squareRef.current.dataset.check = "true";
      }
      kingCheckedPos.current = squareKing;
    } else if (movePlayed.san.at(-1) === '#') {
      const squareKing = getPiecePosition({ type: 'k', 'color': (movePlayed.color === 'b' ? 'w' : 'b'), board2d: board2d })[0];
      const squareRef = refs.current?.[squareKing[0]]?.[parseInt(squareKing[1]) - 1];
      if (squareRef?.current) {
        squareRef.current.dataset.check = "true";
      }
      setMessage("CheckMate");
    } else {
      // console.log(movePlayed.san);
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

      const rookFrom = refs.current[rookFromKey[0]][parseInt(rookFromKey[1]) - 1];
      const rookTo = refs.current[rookToKey[0]][parseInt(rookToKey[1]) - 1];
      // console.log(rookFrom.current,rookTo.current);
      if (rookFrom && rookFrom.current && rookTo && rookTo.current) {
        rookTo.current.className = (movePlayed.color=='w'? 'R':'r'); // Move rook class
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

    // Update the square for the moved piece
    const from = movePlayed.from;
    const prevSquare = refs.current[from[0]][parseInt(from[1]) - 1];
    const to = movePlayed.to;
    const square = (refs.current[to[0]][parseInt(to[1]) - 1]).current;
    if (square) {
      square.className = movePlayed.color == 'b' ? movePlayed.piece : movePlayed.piece.toLocaleUpperCase();
    }

    if (prevSquare.current) {
      prevSquare.current.className = ""; // Clear previous class
    }
    // Reset highlighted
    highlighted.current = "##";
    // Handle the promotion
    if (movePlayed.flags.includes("p")) {
      const promotedClass: string | undefined = (movePlayed.color == 'b' ? movePlayed.promotion : movePlayed.promotion?.toLocaleUpperCase());
      if (promotedClass) {
        if (square) {
          square.className = promotedClass;
        }
      }
    }
    return true;
  }
  return false;
}

export const toggleDataActiveHelper = (key: string, value: string, moves: Move[], refs: RefDomMap) => {
  // add data-from class to the key using refs
  const currentSquare = refs.current[key[0]][parseInt(key[1]) - 1].current?.dataset;
  if (currentSquare) {
    currentSquare.from = value;
  }
  moves.forEach((move: { flags: string; to: string }) => {
    const targetSquare = refs.current[move.to[0]][parseInt(move.to[1]) - 1];
    if (targetSquare.current) {
      targetSquare.current.dataset.active = value;
    }
  });
};