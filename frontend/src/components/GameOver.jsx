import Button from "./Button.jsx";
import { HiOutlineTrophy } from "react-icons/hi2";
import { ImCross } from "react-icons/im";

export const GameOver = ({ winner, reason, onNewGame, onClose }) => {
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
      case "resignation":
        return "Opponent resigned";
      case "draw":
        return "Draw by agreement";
      case "disconnect":
        return "Opponent disconnected";
      case "stalemate":
        return "Stalemate!";
      case "insufficient_material":
        return "Insufficient material";
      case "threefold_repetition":
        return "Threefold repetition";
      case "fifty_move_rule":
        return "Fifty-move rule";
      default:
        return "Game ended";
    }
  };

  const getIcon = () => {
    if (reason === "draw") {
      return "🤝";
    }
    if (reason === "timeout") {
      return "⏰";
    }
    if (reason === "disconnect") {
      return "📡";
    }
    if (winner) {
      return <HiOutlineTrophy />;
    }
    return "🏁";
  };

  // Overlay click handler
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 flex items-center justify-center z-50 bg-black/40 animate-fadeIn'
      onClick={handleOverlayClick}
    >
      <div className='bg-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-lime-500/20 shadow-2xl relative animate-slideUp'>
        {/* Animated Cross Button */}
        <button
          className='absolute w-8 h-8 right-5 top-5  flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110  active:scale-90'
          onClick={onClose}
          aria-label='Close'
        >
          <ImCross className='text-2xl animate-spin-slow' />
        </button>
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
              <span className='text-6xl'>{getIcon()}</span>
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
