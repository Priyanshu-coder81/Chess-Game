import { useEffect, useRef, useState } from "react";
import { INIT_GAME, MOVE } from "../constant";
import { ProfileCard } from "./ProfileCard.jsx";
import { useSocket } from "../contexts/SocketContext.jsx";

const ChessBoard = ({
  board,
  color,
  started,
  turn,
  gameResetTrigger,
  connect,
  gameId,
  playersData,
  opponentData,
  gameOver,
}) => {
  const [from, setFrom] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const {socket} = useSocket();

  const timerRef = useRef(null);

  // Initialize timers from props and handle game reset
  useEffect(() => {

      setWhiteTime(20);
      setBlackTime(20);

  }, [gameResetTrigger]);

  useEffect(() => {
    if (!socket) return;

   socket.on("time_update", (clocks) => {
      setWhiteTime(Math.max(0, clocks.white/1000));
      setBlackTime(Math.max(0, clocks.black/1000));
    });

    return () => {
      socket.off("time_update");
    };
  }, [socket]);

  useEffect(()=> {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleMediaQueryChange = (e) =>{
      setIsMobileView(e.matches);
    };

    setIsMobileView(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return ()=> {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  },[]);

 
  return (
    <div className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto p-2'>
      <ProfileCard
        time={color === "white" ? blackTime : whiteTime}
        started={started}
        connect={connect}
        playersData={opponentData}
      ></ProfileCard>
<div
  className={`flex flex-col ${
    color === "black" ? "flex-col-reverse" : ""
  }`}
>
  {board.map((row, i) => (
    <div
      key={i}
      className={`flex w-full ${
        color === "black" ? "flex-row-reverse" : ""
      }`}
    >
      {row.map((square, j) => {
        // Calculate file and rank based on color
        const file = String.fromCharCode(97 + j); // "a" to "h"
        const rank = 8 - i; // 8 (top) to 1 (bottom)

        const squareRepresentation = `${file}${rank}`;
        return (
          <div
            // Drag and drop handlers (active when not in mobile view)
            {...(!isMobileView && {
              onDragOver: (e) => {
                e.preventDefault();
              },
              onDrop: () => {
                if (from) {
                  socket.emit(MOVE, {
                    move: { from, to: squareRepresentation },
                    gameId,
                  });
                  setFrom(null);
                  setSelectedSquare(null); // Clear selected square after a drag-drop
                }
              },
            })}
            // Click-to-move handler (active when in mobile view)
            {...(isMobileView && {
              onClick: () => {
                if (!selectedSquare) {
                  // Select a piece if no piece is selected and the clicked square has a piece
                  if (square) {
                    setSelectedSquare(squareRepresentation);
                  }
                } else {
                  // If a piece is selected, try to move it to the clicked square
                  socket.emit(MOVE, {
                    move: { from: selectedSquare, to: squareRepresentation },
                    gameId,
                  });
                  setSelectedSquare(null);
                }
              },
            })}
            key={j}
            className={`flex items-center justify-center aspect-square w-full max-w-[12.5%] text-lg font-bold
              ${
                (i + j) % 2 === 0
                  ? "bg-lime-700"
                  : "bg-lime-50 text-lime-900"
              }
              ${
                selectedSquare === squareRepresentation
                  ? "border-2 border-black/50"
                  : ""
              } // Highlight selected square
            `}
            style={{ minWidth: 0 }}
          >
            {square ? (
              <img
                // Drag start handler (active when not in mobile view)
                {...(!isMobileView && {
                  onDragStart: () => {
                    setFrom(squareRepresentation);
                    setSelectedSquare(null); // Clear selected square when drag starts
                  },
                })}
                className={`w-15 ${
                  !isMobileView
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-pointer"
                }`}
                src={`/${
                  square?.color === "b"
                    ? `b${square?.type}`
                    : `w${square?.type?.toLowerCase()}`
                }.png`}
                draggable={!isMobileView ? "true" : "false"} // Conditionally enable/disable draggable
              />
            ) : null}
          </div>
        );
      })}
    </div>
  ))}
</div>


      <ProfileCard
        time={color === "white" ? whiteTime : blackTime}
        started={started}
        connect={connect}
        playersData={playersData}
      ></ProfileCard>
    </div>
  );
};

export default ChessBoard;
