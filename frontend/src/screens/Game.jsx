import ChessBoard from "../components/ChessBoard";
import Button from "../components/Button";
import { useSocket } from "../hooks/useSocket.js";
import { use, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Dashboard } from "../components/Dashboard.jsx";
import { GameOver } from "../components/GameOver.jsx";
import { CONNECTING, GAME_OVER, INIT_GAME, MOVE } from "../constant.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Navbar from "../components/Navbar";

const Game = () => {
  const socket = useSocket();
  const {user} = useAuth();
  const chessRef = useRef(new Chess());
  const gameIdRef = useRef(null);
  const [board, setBoard] = useState(chessRef.current.board());
  const [started, setStarted] = useState(false);
  const [color, setColor] = useState(null);
  const [connect, setConnect] = useState(false);
  const [turn, setTurn] = useState("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [gameResetTrigger, setGameResetTrigger] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [showGameOver , setShowGameOver] = useState(false);
  const [playersData , setPlayersData] = useState({username:user?user.username:"Guest111",avatar:user?user.avatar:"/white_400.png"});
  const [opponentData , setOpponentData] = useState({username:"Opponent",avatar:"/white_400.png"});


  const handleNewGame = () => {
    setGameOver(false);
    setWinner(null);
    setGameOverReason(null);
    setStarted(false);
    chessRef.current = new Chess();
    setBoard(chessRef.current.board());
    setTurn("white");
    setGameResetTrigger((prev) => prev + 1);
    socket.emit(INIT_GAME);
  };

  const handleOnClick = () => {
    socket.emit(INIT_GAME);
  };
  
  const handleCloseGameOver = () => {
    setShowGameOver(false);
  }

  
useEffect(() => {
  if (user) {
    setPlayersData({ username: user.username, avatar: user.avatar || "/white_400.png" });
  }
}, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
    });
    socket.on(CONNECTING, () => {
      setConnect(true);
    });

    socket.on(INIT_GAME, ({ gameId, color, players }) => {
      setConnect(false);
      setBoard(chessRef.current.board());
      setStarted(true);
      setColor(color);
      setTurn("white");
      setGameOver(false);
      setMoveHistory([]);
      gameIdRef.current = gameId;
      setPlayersData(players.player);
      setOpponentData(players.opponent);
      console.log("Game Intialized");
    });

    socket.on(GAME_OVER, ({ winner, reason }) => {
      setGameOver(true);
      setWinner(winner);
      setGameOverReason(reason);
      setShowGameOver(true);
      console.log("Game End", { winner, reason });
    });

    socket.on(MOVE, ({ move, timeSpent }) => {
      const result = chessRef.current.move(move);
      if (result) {
        setBoard(chessRef.current.board().map((row) => [...row]));
        setMoveHistory((prev) => [
          ...prev,
          {
            san: result.san,
            color: result.color === "w" ? "white" : "black",
            timeSpent,
          },
        ]);
        console.log("Move Applied : ", move);
      } else {
        console.warn("Invalid move recieved: ", move);
      }
      setTurn(chessRef.current.turn() === "w" ? "white" : "black");
    });

    return () => {
      socket.off(CONNECTING);
      socket.off(INIT_GAME);
      socket.off(MOVE);
      socket.off(GAME_OVER);
    };
  }, [socket]);

  if (!socket) {
    return <div>Connecting....</div>;
  }

  return (
    <div className='min-h-screen  bg-neutral-800 text-white'>
      <Navbar />

      <div
        className={` flex justify-center items-center`}
      >
        {gameOver && showGameOver && (
          <GameOver
            winner={winner}
            reason={gameOverReason}
            onNewGame={()=> {handleNewGame();
              setShowGameOver(false);
            }}
            onClose={handleCloseGameOver}
          />
        )}

        <div className={`pt-8 w-full max-w-5xl mx-auto`}>
          <div className='flex flex-col w-full gap-8 md:grid md:grid-cols-6 md:gap-4'>
            <div className='flex justify-center items-center w-full md:col-span-4 mb-8 md:mb-0'>
              <ChessBoard
                socket={socket}
                color={color}
                board={board}
                started={started}
                turn={turn}
                gameResetTrigger={gameResetTrigger}
                connect={connect}
                gameId={gameIdRef.current}
                playersData = {playersData}
                opponentData = {opponentData}
                gameOver ={gameOver}
              />
            </div>

            <div className='flex justify-center items-center w-[95%] m-auto md:col-span-2'>
              {!started ? (
                <Button
                  onClick={handleOnClick}
                  className='w-full md:w-auto min-w-3xs'
                >
                  Start Game
                </Button>
              ) : (
                <Dashboard color={color} moveHistory={moveHistory}  onPlay={() => {/* implement play logic if needed */}}
      onNewGame={handleNewGame}
      isPlaying={started && !gameOver}
      canStartNewGame={gameOver} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
