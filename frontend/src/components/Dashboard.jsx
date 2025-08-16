import { RiTimerFlashLine } from "react-icons/ri";
import { BsPlusSquareFill } from "react-icons/bs";
import { LuAlarmClock } from "react-icons/lu";
import { IoHomeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export const Dashboard = ({
  color,
  moveHistory,
  onPlay,
  onNewGame,
  isPlaying,
  canStartNewGame,
  onResign,
  onDraw,
}) => {
  const navigate = useNavigate();

  // Group moves into pairs: [whiteMove, blackMove]
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1]]);
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
    navigate("/");
  };

  return (
    <div className='bg-zinc-700 w-full h-full p-4'>
      {/* Top Buttons */}
      <div className='grid grid-cols-3 gap-2 text-white mb-4'>
        <button
          className={`hover:bg-zinc-800 w-full text-center font-bold text-2xl flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
            isPlaying ? "bg-lime-500 text-black" : "bg-zinc-800"
          }`}
          onClick={onPlay}
        >
          <RiTimerFlashLine className='text-xl' />
          Play
        </button>
        <button
          className='hover:bg-zinc-800 w-full text-center font-bold text-xl flex flex-col items-center justify-center p-2 bg-zinc-800 transition-colors duration-200'
          onClick={onNewGame}
        >
          <BsPlusSquareFill className='text-lg' />
          New Game
        </button>
        <button
          className='hover:bg-zinc-800 w-full text-center font-bold text-lg flex flex-col items-center justify-center p-2 bg-zinc-800 transition-colors duration-200'
          onClick={handleGoHome}
        >
          <IoHomeOutline className='text-lg' />
          Home
        </button>
      </div>

      {/* Resign and Draw Buttons */}
      <div className='flex justify-center gap-6 mb-4'>
        <button
          onClick={handleResign}
          className='text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200 cursor-pointer'
        >
          Resign
        </button>
        <button
          onClick={handleDraw}
          className='text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors duration-200 cursor-pointer'
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
                <td className='p-2'>
                  {pair[0]?.timeSpent
                    ? (pair[0].timeSpent / 1000).toFixed(1) + "s"
                    : ""}
                  {pair[1]?.timeSpent
                    ? " | " + (pair[1].timeSpent / 1000).toFixed(1) + "s"
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
