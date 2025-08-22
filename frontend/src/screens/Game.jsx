import ChessBoard from "../components/ChessBoard";
import Button from "../components/Button";
import { useSocket } from "../hooks/useSocket.js";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Dashboard } from "../components/Dashboard.jsx";
import { GameOver } from "../components/GameOver.jsx";
import {
  CONNECTING,
  GAME_OVER,
  INIT_GAME,
  MOVE,
  RESIGN,
  DRAW_OFFER,
  DRAW_ACCEPTED,
  DRAW_DECLINED,
  RESIGN_ACCEPTED,
} from "../constant.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Navbar from "../components/Navbar";

const Game = () => {
  const { user,socket} = useAuth();
  const chessRef = useRef(new Chess());
  const gameIdRef = useRef(null);

  // Initialize board with a proper chess board structure
  const [board, setBoard] = useState(() => {
    const chess = new Chess();
    return chess.board();
  });

  const [started, setStarted] = useState(false);
  const [color, setColor] = useState(null);
  const [connect, setConnect] = useState(false);
  const [turn, setTurn] = useState("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [gameResetTrigger, setGameResetTrigger] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [showGameOver, setShowGameOver] = useState(false);
  const [playersData, setPlayersData] = useState({
    username: user ? user.username : "Guest111",
    avatar: user ? user.avatar : "/white_400.png",
  });
  const [opponentData, setOpponentData] = useState({
    username: "Opponent",
    avatar: "/white_400.png",
  });

  const handleNewGame = () => {
    if (started && !gameOver) {
      const confirmNewGame = window.confirm(
        "Starting a new game will resign the current game. Are you sure you want to continue?"
      );
      if (!confirmNewGame) return;
    }

    // Reset all game state
    setGameOver(false);
    setWinner(null);
    setGameOverReason(null);
    setStarted(false);
    setConnect(false);
    setTurn("white");
    setMoveHistory([]);
    setShowGameOver(false);

    // Reset chess board
    chessRef.current = new Chess();
    const newBoard = chessRef.current
      .board()
      .map((row) => row.map((square) => (square ? { ...square } : null)));
    setBoard(newBoard);

    // Reset opponent data
    setOpponentData({ username: "Searching", avatar: "/white_400.png" });

    // Trigger reset in ChessBoard component
    setGameResetTrigger((prev) => prev + 1);

    // Emit new game event
    socket.emit(INIT_GAME);
  };

  const handleResign = () => {
    if (socket && gameIdRef.current && started && !gameOver) {
      const confirmResign = window.confirm(
        "Are you sure you want to resign? This will end the game immediately."
      );
      if (!confirmResign) return;

      // Emit resign event
      socket.emit(RESIGN, { gameId: gameIdRef.current });

      // Show immediate feedback
      console.log("Resignation sent to server");
    }
  };

  const handleDraw = () => {
    if (socket && gameIdRef.current && started && !gameOver) {
      const confirmDraw = window.confirm(
        "Are you sure you want to offer a draw to your opponent?"
      );
      if (!confirmDraw) return;

      // Emit draw offer event
      socket.emit(DRAW_OFFER, { gameId: gameIdRef.current });

      // Show notification that draw offer was sent
      console.log("Draw offer sent to opponent");
    }
  };

  const handleGoHome = () => {
    if (started && !gameOver) {
      const confirmHome = window.confirm(
        "Going home will resign the current game. Are you sure you want to continue?"
      );
      if (!confirmHome) return;

      // If user confirms, emit resign event before going home
      if (socket && gameIdRef.current) {
        socket.emit(RESIGN, { gameId: gameIdRef.current });
      }
    }

    // Navigate to home
    window.location.href = "/";
  };

  const handleOnClick = () => {
    socket.emit(INIT_GAME);
  };

  const handleCloseGameOver = () => {
    setShowGameOver(false);
  };

  useEffect(() => {
    if (user) {
      setPlayersData({
        username: user.username,
        avatar: user.avatar || "/white_400.png",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on(CONNECTING, () => {
      console.log("Connecting to game...");
      setConnect(true);
    });

    socket.on(INIT_GAME, ({ gameId, color, players }) => {
      setConnect(false);

      // Create a proper deep copy of the board for React state update
      const newBoard = chessRef.current
        .board()
        .map((row) => row.map((square) => (square ? { ...square } : null)));
      setBoard(newBoard);

      setStarted(true);
      setColor(color);
      setTurn("white");
      setGameOver(false);
      setMoveHistory([]);
      gameIdRef.current = gameId;
      setPlayersData(players.player);
      setOpponentData(players.opponent);
    });

    socket.on(GAME_OVER, ({ winner, reason }) => {
      setGameOver(true);
      setWinner(winner);
      setGameOverReason(reason);
      setShowGameOver(true);
      console.log("Game End", { winner, reason });
    });

    socket.on(
      MOVE,
      ({ move, timeSpent, whiteTimeRemaining, blackTimeRemaining }) => {
        const result = chessRef.current.move(move);
        if (result) {
          // Create a proper deep copy of the board for React state update
          const newBoard = chessRef.current
            .board()
            .map((row) => row.map((square) => (square ? { ...square } : null)));
          setBoard(newBoard);

          setMoveHistory((prev) => [
            ...prev,
            {
              san: result.san,
              color: result.color === "w" ? "white" : "black",
              timeSpent: timeSpent || 0,
            },
          ]);
          console.log("Move applied successfully:", result.san);

          // Update turn after successful move
          setTurn(chessRef.current.turn() === "w" ? "white" : "black");
        } else {
          console.warn("Invalid move received:", move);
        }
      }
    );

    socket.on(RESIGN_ACCEPTED, ({ gameId, winner, reason }) => {
      console.log("Resign accepted:", { gameId, winner, reason });
      if (gameId === gameIdRef.current) {
        setGameOver(true);
        setWinner(winner);
        setGameOverReason(reason);
        setShowGameOver(true);
      }
    });

    socket.on(DRAW_OFFER, ({ gameId, fromPlayer }) => {
      console.log("Draw offer received:", { gameId, fromPlayer });
      if (gameId === gameIdRef.current && fromPlayer !== color) {
        // Show draw offer dialog
        const acceptDraw = window.confirm(
          "Your opponent has offered a draw. Accept?"
        );
        if (acceptDraw) {
          console.log("Draw offer accepted");
          socket.emit(DRAW_ACCEPTED, { gameId });
        } else {
          console.log("Draw offer declined");
          socket.emit(DRAW_DECLINED, { gameId });
        }
      }
    });

    socket.on(DRAW_ACCEPTED, ({ gameId }) => {
      console.log("Draw accepted:", { gameId });
      if (gameId === gameIdRef.current) {
        setGameOver(true);
        setWinner(null);
        setGameOverReason("draw");
        setShowGameOver(true);
      }
    });

    socket.on(DRAW_DECLINED, ({ gameId }) => {
      console.log("Draw declined:", { gameId });
      if (gameId === gameIdRef.current) {
        console.log("Your opponent declined the draw offer");
      }
    });

    return () => {
      // Clean up all socket event listeners
      socket.off(CONNECTING);
      socket.off(INIT_GAME);
      socket.off(MOVE);
      socket.off(GAME_OVER);
      socket.off(RESIGN_ACCEPTED);
      socket.off(DRAW_OFFER);
      socket.off(DRAW_ACCEPTED);
      socket.off(DRAW_DECLINED);
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [socket, color]);

  if (!socket) {
    return <div>Connecting....</div>;
  }

  return (
    <div className='min-h-screen  bg-neutral-800 text-white'>
      <Navbar />

      <div className={` flex justify-center items-center`}>
        {gameOver && showGameOver && (
          <GameOver
            winner={winner}
            reason={gameOverReason}
            onNewGame={() => {
              handleNewGame();
              setShowGameOver(false);
            }}
            onClose={handleCloseGameOver}
          />
        )}

        <div className={`pt-8 w-full max-w-5xl mx-auto`}>
          <div className='flex flex-col w-full gap-8 md:grid md:grid-cols-6 md:gap-4'>
            <div className='flex justify-center items-center w-full md:col-span-4 mb-8 md:mb-0'>
              <ChessBoard
                color={color}
                board={board || []}
                started={started}
                turn={turn}
                gameResetTrigger={gameResetTrigger}
                connect={connect}
                gameId={gameIdRef.current}
                playersData={playersData}
                opponentData={opponentData}
                gameOver={gameOver}
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
                <Dashboard
                  color={color}
                  moveHistory={moveHistory}
                  onPlay={() => {
                    /* implement play logic if needed */
                  }}
                  onNewGame={handleNewGame}
                  isPlaying={started && !gameOver}
                  canStartNewGame={gameOver}
                  onResign={handleResign}
                  onDraw={handleDraw}
                  onGoHome={handleGoHome}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
