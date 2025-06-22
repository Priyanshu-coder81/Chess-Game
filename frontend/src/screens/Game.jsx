import ChessBoard from "../components/ChessBoard";
import Button from "../components/Button";
import { useSocket } from "../hooks/useSocket.js";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";

// make a single place for this
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

const Game = () => {
  const socket = useSocket();
  const chessRef = useRef(new Chess());
  const [board, setBoard] = useState(chessRef.current.board());

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      console.log("Received From Socket - ",message);

      switch (message.type) {
        case INIT_GAME:
            setBoard(chessRef.current.board());
          console.log("Game Intialized");
          break;
        case GAME_OVER:
          console.log("Game End");
          break;
        case MOVE:
            const move = message.payload;
            const result = chessRef.current.move(move);
            if(result) {
                setBoard(chessRef.current.board().map(row => [...row]));
                console.log("Move Applied : ",move);
            }
            else {
                console.warn("Invalid move recieved: ",move);
            }
          break;
      }
    };
  }, [socket]);

  if (!socket) {
    return <div>Connecting....</div>;
  }

  return (
    <div className='min-h-screen bg-zinc-900 text-white flex justify-center items-center'>
      <div className='pt-8 w-full max-w-4xl mx-auto'>
        <div className='flex flex-col w-full gap-8 md:grid md:grid-cols-6 md:gap-4'>

          <div className='flex justify-center items-center w-full md:col-span-4 mb-8 md:mb-0'>
            <ChessBoard board={board} chess={chessRef} setBoard={setBoard} socket={socket}/>
          </div>
          
          <div className='flex justify-center items-center w-full md:col-span-2'>
            <Button
              onClick={() => socket.send(JSON.stringify({ type: INIT_GAME  }))}
              className='w-full md:w-auto'
            >
              Play
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
