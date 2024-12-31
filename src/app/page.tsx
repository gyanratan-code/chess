import ChessBoard from '@/components/chessBoard';
import './App.css';
import { Metadata } from 'next';

export const metadata:Metadata= {
  title : "Chess"
}

export default function Page(){
  return(
    <>
      <div className="chessboard-container">
        <ChessBoard />
      </div>
    </>
  );
}