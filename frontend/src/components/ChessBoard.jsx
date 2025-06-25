import { useState } from "react";
import { MOVE } from "../constant";

const ChessBoard = ({ board, socket, color }) => {
  const [from, setFrom] = useState(null);

  return (
    <div className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto p-2'>
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
                      socket.send(
                        JSON.stringify({
                          type: MOVE,
                          payload: {
                            from,
                            to: squareRepresentation,
                          },
                        })
                      );
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
    </div>
  );
};

export default ChessBoard;
