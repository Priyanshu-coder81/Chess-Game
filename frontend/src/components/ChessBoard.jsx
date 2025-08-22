import { useEffect, useRef, useState } from "react";
import { MOVE } from "../constant";
import { ProfileCard } from "./ProfileCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

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
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const {socket} = useAuth();

  const timerRef = useRef(null);

  // Reset timer when game resets
  useEffect(() => {
    setWhiteTime(20);
    setBlackTime(20);
  }, [gameResetTrigger]);

  useEffect(() => {
    if (!socket) return;
    console.log("Socket is available in ChessBoard", socket);

   

    socket.on("time_update", ({whiteTime,blackTime})=> {
      console.log('Received time_update:', whiteTime, blackTime);
      setWhiteTime(Math.max(0, whiteTime/1000 ));
      setBlackTime(Math.max(0, blackTime/1000 ));
    });

    return () => {
      socket.off("time_update");
    };
  }, [socket]);

 
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
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={() => {
                    if (from) {
                      socket.emit(MOVE, {
                        move: { from, to: squareRepresentation },
                        gameId,
                      });
                      setFrom(null);
                    }
                  }}
                  key={j}
                  className={`flex items-center justify-center aspect-square w-full max-w-[12.5%] text-lg font-bold
                  ${
                    (i + j) % 2 === 0
                      ? "bg-lime-700"
                      : "bg-lime-50 text-lime-900"
                  }
                `}
                  style={{ minWidth: 0 }}
                >
                  {square ? (
                    <img
                      onDragStart={() => {
                        setFrom(squareRepresentation);
                      }}
                      className='w-15 cursor-grab active:cursor-grabbing'
                      src={`/${
                        square?.color === "b"
                          ? `b${square?.type}`
                          : `w${square?.type?.toLowerCase()}`
                      }.png`}
                      draggable='true'
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
