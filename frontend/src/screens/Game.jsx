import ChessBoard from "../components/ChessBoard";
import Button from "../components/Button";
import { useSocket } from "../hooks/useSocket.js";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";

// make a single place for this
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.stringify(event.data);
      
      console.log(message);

      switch (message.type) {
        case INIT_GAME:
            setChess(new Chess());
            setBoard(chess.board());
          console.log("Game Intialized");
          break;
        case GAME_OVER:
          console.log("Game End");
          break;
        case MOVE:
            const move = message.payload;
            chess.move(move);
            setBoard(chess.board());
          console.log("Move made");
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
            <ChessBoard board={board} chess={chess} setBoard={setBoard} socket={socket}/>
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
