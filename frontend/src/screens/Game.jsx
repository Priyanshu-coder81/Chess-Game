import ChessBoard from "../components/ChessBoard";
import Button from "../components/Button";
import { useSocket } from "../hooks/useSocket.js";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Dashboard } from "../components/Dashboard.jsx";
import { GAME_OVER, INIT_GAME, MOVE } from "../constant.js";



const Game = () => {
  const socket = useSocket();
  const chessRef = useRef(new Chess());
  const [board, setBoard] = useState(chessRef.current.board());
  const [started, setStarted] = useState(false);
  const [color, setColor] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      console.log("Received From Socket - ", message);

      switch (message.type) {
        case INIT_GAME:
          setBoard(chessRef.current.board());
          setStarted(true);
          setColor(message.payload.color);
          console.log("Game Intialized");
          break;
        case GAME_OVER:
          setStarted(false);
          console.log("Game End");
          break;
        case MOVE:
          const move = message.payload;
          const result = chessRef.current.move(move);
          if (result) {
            setBoard(chessRef.current.board().map((row) => [...row]));
            console.log("Move Applied : ", move);
          } else {
            console.warn("Invalid move recieved: ", move);
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
      <div className='pt-8 w-full max-w-5xl mx-auto'>
        <div className='flex flex-col w-full gap-8 md:grid md:grid-cols-6 md:gap-4'>
          <div className='flex justify-center items-center w-full md:col-span-4 mb-8 md:mb-0'>
            <ChessBoard
              socket={socket}
              color = {color}
              board = {board}
            />
          </div>

          <div className='flex justify-center items-center w-[95%] m-auto md:col-span-2'>
            {!started ? (
              <Button
                onClick={() => socket.send(JSON.stringify({ type: INIT_GAME }))}
                className='w-full md:w-auto min-w-3xs'
              >
                Start Game
              </Button>
            ) : (
              <Dashboard color = {color}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
