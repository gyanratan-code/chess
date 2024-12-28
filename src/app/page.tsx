import ChessBoard from '@/components/chessBoard';
import './App.css';

export default function Page(){
  return(
    <>
      <div className="chessboard-container">
        <ChessBoard />
      </div>
    </>
  );
}