import Button from "./Button.jsx";
import { HiOutlineTrophy } from "react-icons/hi2";
export const GameOver = ({ winner, reason, onNewGame }) => {
  const getWinnerText = () => {
    if (!winner) return "Game Over";
    return `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!`;
  };

  const getReasonText = () => {
    switch (reason) {
      case "timeout":
        return "Time's up!";
      case "checkmate":
        return "Checkmate!";
      case "disconnect":
        return "Opponent disconnected";
      default:
        return "Game ended";
    }
  };

  return (
    <div className='fixed inset-0  flex items-center justify-center z-50'>
      <div className='bg-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-lime-500/20 shadow-2xl'>
        <div className='text-center space-y-6'>
          {/* Winner Display */}
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold text-white'>{getWinnerText()}</h1>
            <p className='text-lime-400 text-lg font-medium'>
              {getReasonText()}
            </p>
          </div>

          {/* Trophy or Crown Icon */}
          <div className='flex justify-center'>
            <div className='w-16 h-16 flex items-center justify-center text-white'>
              <span className='text-6xl'>
                <HiOutlineTrophy />
              </span>
            </div>
          </div>

          {/* New Game Button */}
          <div className='pt-4'>
            <Button
              onClick={onNewGame}
              className='w-full bg-lime-500 text-white'
            >
              New Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
