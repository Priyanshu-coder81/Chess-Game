import { RiTimerFlashLine } from "react-icons/ri";
import { BsPlusSquareFill } from "react-icons/bs";
import { LuAlarmClock } from "react-icons/lu";
import { IoHomeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { useRef } from "react";

export const Dashboard = ({
  color,
  moveHistory,
  onNewGame,
  isPlaying,
  onResign,
  onDraw,
  onGoHome,
  started,
  gameOver
}) => {
  const navigate = useNavigate();
  const op = useRef(null);
  const op2 = useRef(null);

  // Ensure moveHistory is always an array
  const safeMoveHistory = moveHistory || [];

  // Group moves into pairs: [whiteMove, blackMove]
  const movePairs = [];
  for (let i = 0; i < safeMoveHistory.length; i += 2) {
    movePairs.push([safeMoveHistory[i], safeMoveHistory[i + 1]]);
  }

  const handleResign = () => {
    if (onResign) {
      onResign();
    }
  };

  const handleDraw = () => {
    if (onDraw) {
      onDraw();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate("/");
    }
  };

  return (
    <div className='bg-zinc-700 w-full h-full p-4'>
      {/* Top Buttons */}
      <div className='grid grid-cols-2 gap-2 text-white mb-4'>

        <div>
        <button
          className='hover:bg-zinc-800 w-full text-center font-bold text-xl flex flex-col items-center justify-center p-2 bg-zinc-800 transition-colors duration-200'
          onClick={(e) => op.current.toggle(e)}
        >
          <BsPlusSquareFill className='text-sm' />
          New Game
        </button>
        <OverlayPanel ref={op}>
          <div className="flex flex-col gap-2">
            <h2 className="font-bold ">Are you Sure? </h2>
            <div className="grid grid-cols-2 gap-5 ">
              <Button   unstyled type="button" label="Yes" onClick={onNewGame} className="bg-lime-400 hover:bg-lime-500 text-white text-lg px-3 py-1 rounded-xl shadow-md border-none" />  
              <Button unstyled type="button" label="No" onClick={(e) => op.current.toggle(e)} 
              className="bg-lime-400 hover:bg-lime-500 text-white text-lg px-3 py-1 rounded-xl shadow-md border-none" />  
            </div>
          </div>
        </OverlayPanel>
        </div>
        <div>
        <button
          className='hover:bg-zinc-800 w-full text-center font-bold text-lg flex flex-col items-center justify-center p-2 bg-zinc-800 transition-colors duration-200'
          onClick={(e) => op2.current.toggle(e)}
        >
          <IoHomeOutline className='text-lg' />
          Home
        </button>
        <OverlayPanel ref={op2}>
          <div className="flex flex-col gap-2">
            <h2 className="font-bold ">Are you Sure? </h2>
            <div className="grid grid-cols-2 gap-5 ">
              <Button   unstyled type="button" label="Yes" onClick={handleGoHome} className="bg-lime-400 hover:bg-lime-500 text-white text-lg px-3 py-1 rounded-xl shadow-md border-none" />  
              <Button unstyled type="button" label="No" onClick={(e) => op2.current.toggle(e)} 
              className="bg-lime-400 hover:bg-lime-500 text-white text-lg px-3 py-1 rounded-xl shadow-md border-none" />  
            </div>
          </div>
        </OverlayPanel>
        </div>
      </div>

      {/* Resign and Draw Buttons */}
      <div className='flex justify-center gap-6 mb-4'>
        <button
          onClick={handleResign}
          disabled={!isPlaying}
          className={`text-sm font-medium transition-all duration-200 cursor-pointer px-3 py-1 rounded ${
            isPlaying
              ? "text-red-400 hover:text-red-300 hover:bg-red-400/10"
              : "text-zinc-500 cursor-not-allowed"
          }`}
        >
          Resign
        </button>
        <button
          onClick={handleDraw}
          disabled={!isPlaying}
          className={`text-sm font-medium transition-all duration-200 cursor-pointer px-3 py-1 rounded ${
            isPlaying
              ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
              : "text-zinc-500 cursor-not-allowed"
          }`}
        >
          Draw
        </button>
      </div>

      <hr className='border-zinc-600 mb-4' />

      <div className='text-white mb-2'>
        <h2>
          You're{" "}
          <span className='font-bold'>
            {color === "white" ? "White!" : "Black!"}
          </span>
        </h2>
      </div>

      {/* Move Table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-white text-sm table-auto'>
          <thead className='bg-zinc-800 text-left'>
            <tr>
              <th className='p-2'>#</th>
              <th className='p-2'>White</th>
              <th className='p-2'>Black</th>
              <th className='p-2 text-2xl'>
                <LuAlarmClock />
              </th>
            </tr>
          </thead>
          <tbody>
            {movePairs.map((pair, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-zinc-600" : "bg-zinc-700"}
              >
                <td className='p-2'>{idx + 1}</td>
                <td className='p-2'>{pair[0]?.san || ""}</td>
                <td className='p-2'>{pair[1]?.san || ""}</td>
                <td className='p-2 text-xs'>
                  {pair[0]?.timeSpent
                    ? (pair[0].timeSpent / 1000).toFixed(1) + "s"
                    : ""}
                  {pair[0]?.timeSpent && pair[1]?.timeSpent ? " | " : ""}
                  {pair[1]?.timeSpent
                    ? (pair[1].timeSpent / 1000).toFixed(1) + "s"
                    : ""}
                </td>
                {/* Debug info */}
                <td className='p-2 text-xs text-gray-500 hidden'>
                  MS: {pair[0]?.timeSpent || ""} | {pair[1]?.timeSpent || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
