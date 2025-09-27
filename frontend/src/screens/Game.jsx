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
  CONNECT,
  GAME_RECOVERED,
  RECOVER_GAME,
  RECOVERY_FAILED,
} from "../constant.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Navbar from "../components/Navbar";
import DrawOfferNotification from "../components/DrawOfferNotification.jsx";
import ConfirmationSidePopup from "../components/ConfirmationSidePopup.jsx";

const Game = () => {
  const { user, socket } = useAuth();
  const chessRef = useRef(new Chess());
  const gameIdRef = useRef(null);

  // Initialize board with a proper chess board structure
  const [board, setBoard] = useState(() => {
    const chess = new Chess();
    return chess.board();
  });

  const [authenticated, setAuthenticated] = useState(false);
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

  // New state for draw offer modal
  const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
  const [currentDrawOffer, setCurrentDrawOffer] = useState(null);

  const [showResignConfirmModal, setShowResignConfirmModal] = useState(false);
  const [showDrawConfirmModal, setShowDrawConfirmModal] = useState(false);

  const handleNewGame = () => {
    if (started && !gameOver) {
      const confirmNewGame = window.confirm(
        "Starting a new game will resign the current game. Are you sure you want to continue?"
      );
      if (!confirmNewGame) return;
    }
    socket.emit(RESIGN, { gameId: gameIdRef.current });
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
    setShowResignConfirmModal(true);

  }; 

  const handleCancelResign = () =>{
    setShowResignConfirmModal(false);
  }
  const handleConfirmResign = () => {
    socket.emit(RESIGN, { gameId: gameIdRef.current });
    
    setShowResignConfirmModal(false);
    console.log("Resignation sent to server");
  }

  const handleDraw = () => {
   setShowDrawConfirmModal(true);
   
  };

  const handleCancelDraw = () => {
    setShowDrawConfirmModal(false);
  }

  const handleConfirmDraw = () => {
    
    socket.emit(DRAW_OFFER, { gameId: gameIdRef.current });
    setShowDrawConfirmModal(false);
  }


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
    if (!socket?.connected) {
      console.log("Socket not connected, cannot start game");
      return;
    }
    if (!user) {
      console.log("No user data, cannot start game");
      return;
    }
    console.log("Requesting game initialization as:", user.username);
    socket.emit(INIT_GAME);
  };

  const handleCloseGameOver = () => {
    setShowGameOver(false);
  };
useEffect(() => {
  if (socket && socket.connected && authenticated) {
    // Only attempt recovery when both are true
    attemptRecovery();
  }
}, [socket, authenticated]);

  useEffect(() => {
    if (user) {
      setPlayersData({
        username: user.username,
        avatar: user.avatar || "/white_400.png",
      });
    }
  }, [user]);
  
    const attemptRecovery = () => {
      console.log("Finding stored game ID for recovery...");
      const storedGameId = localStorage.getItem("chess_game_id");
      if (storedGameId) {
        console.log("Attempting to recover game:", storedGameId);
        console.log(Date.now());
        socket.emit(RECOVER_GAME, { gameId: storedGameId });
      }
      return;
    };

  useEffect(() => {
    if (!socket) {
      console.log("Socket not initialized yet");
      return;
    }
    console.log("Socket initialization in Game component:", {
      connected: socket.connected,
      id: socket.id,
      authenticated: !!user
    });
    
    // Listen for authentication events
    socket.on("auth_success", (data) => {
      console.log("Authentication successful:", data);
      setAuthenticated(true);
    });

    socket.on("auth_error", (data) => {
      console.error("Authentication error:", data);
      setAuthenticated(false);
    });
    

  socket.on("connect", () => {
      console.log("Socket connected successfully", socket.id);
    
    }); 


    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      console.error("Socket auth token:", localStorage.getItem("token"));
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on(CONNECTING, () => {
      console.log("Matchmaking in progress... Socket ID:", socket.id);
      console.log("Current user: line 220",user?.username);
      setConnect(true);
    });

    socket.on(GAME_RECOVERED, (data) => {
      console.log("Game recovered:", data);
      chessRef.current.load(data.fen);
      setBoard(chessRef.current.board());
      setColor(data.color);
      setPlayersData(data.players.player);
      setOpponentData(data.players.opponent);
      setStarted(true);
      setMoveHistory(data.moves || []);
      setTurn(chessRef.current.turn() === "w" ? "white" : "black");
      setGameOver(data.status !== "playing");
      gameIdRef.current = data.gameId;
      setConnect(false);
    });

    socket.on(RECOVERY_FAILED, (data) => {
      console.log("Game recovery failed:", data);
      localStorage.removeItem("chess_game_id");
    });


    socket.on(INIT_GAME, (data) => {
      console.log("Received INIT_GAME event with full data:", data);
      const { gameId, color, players, initialWhiteTime, initialBlackTime } = data;
      
      if (!gameId || !color || !players) {
        console.error("Invalid INIT_GAME data received:", data);
        return;
      }
      
      setConnect(false);
      localStorage.setItem("chess_game_id", gameId);
      gameIdRef.current = gameId;

      // Reset and initialize the chess board
      chessRef.current = new Chess();
      const newBoard = chessRef.current
        .board()
        .map((row) => row.map((square) => (square ? { ...square } : null)));
      
      console.log("Setting game state:", {
        color,
        players,
        gameId,
        time: { white: initialWhiteTime, black: initialBlackTime }
      });

      setBoard(newBoard);
      setStarted(true);
      setColor(color);
      setTurn("white"); // Chess always starts with white
      setGameOver(false);
      setMoveHistory([]);

      if (players) {
        if (players.player) {
          setPlayersData({
            username: players.player.username,
            avatar: players.player.avatar || "/white_400.png"
          });
        }
        if (players.opponent) {
          setOpponentData({
            username: players.opponent.username,
            avatar: players.opponent.avatar || "/white_400.png"
          });
        }
      }

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
       localStorage.removeItem("chess_game_id");
      setGameOver(true);
      setWinner(winner);
      setGameOverReason(reason);
      setShowGameOver(true);
      setShowDrawOfferModal(false);
      setCurrentDrawOffer(false);
      console.log("Game End", { winner, reason });
    });

    socket.on(
      MOVE,
      ({ move, timeSpent }) => {
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
      console.log("Draw offer received:", { gameId, fromPlayer });
      if (gameId === gameIdRef.current && fromPlayer !== color) {
        setCurrentDrawOffer({ gameId, fromPlayer });
        setShowDrawOfferModal(true);
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
      if (!socket) return;
      
      // Clean up all socket event listeners
      socket.off("connect");
      socket.off("auth_success");
      socket.off("auth_error");
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
      socket.off(RECOVERY_FAILED);
      socket.off(GAME_RECOVERED);
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
         <DrawOfferNotification
        socket={socket}
        gameId={gameIdRef.current}
        showDrawOfferModal={showDrawOfferModal}
        currentDrawOffer={currentDrawOffer}
        setShowDrawOfferModal={setShowDrawOfferModal}
        setCurrentDrawOffer={setCurrentDrawOffer}
      />
       <ConfirmationSidePopup
           showModal={showResignConfirmModal}
     title="Confirm Resignation"
         message="Are you sure you want to resign? This will end the game immediately."
    onClose={handleCancelResign}
      onConfirm={handleConfirmResign}
    />
   <ConfirmationSidePopup
       showModal={showDrawConfirmModal}
    title="Confirm Draw Offer"
        message="Are you sure you want to offer a draw to your opponent?"
         onClose={handleCancelDraw}
          onConfirm={handleConfirmDraw}
        />

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
                !connect? 
               ( <Button
                  onClick={handleOnClick}
                  connect = {connect}
                  className='w-full md:w-auto min-w-3xs'
                >
                  Start Game
                </Button>) : <Button connect = {connect} >Loading... </Button>
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
