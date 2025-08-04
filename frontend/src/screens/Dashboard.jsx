import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBackToGame = () => {
    navigate("/game");
  };

  return (
    <div className='min-h-screen bg-neutral-800'>
      <Navbar />

      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              Welcome, {user?.username}!
            </h1>
            <p className='text-gray-300 text-lg'>
              This is your Chess Khelo dashboard
            </p>
          </div>

          {/* Placeholder Content */}
          <div className='bg-neutral-700 rounded-lg p-8 mb-6'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              🚧 Dashboard Under Construction 🚧
            </h2>
            <p className='text-gray-300 mb-6'>
              This dashboard will include features like:
            </p>
            <ul className='text-gray-300 space-y-2 mb-6'>
              <li>• Game history and statistics</li>
              <li>• Profile settings and avatar management</li>
              <li>• Achievement badges</li>
              <li>• Friends list and matchmaking</li>
              <li>• Tournament participation</li>
            </ul>
            <p className='text-gray-400 text-sm'>
              Coming soon! For now, enjoy playing chess online.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={handleBackToGame}
              className='px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-neutral-800'
            >
              Play Chess
            </button>
            <button
              onClick={() => navigate("/")}
              className='px-6 py-3 bg-transparent border-2 border-lime-500 hover:border-lime-400 text-lime-400 hover:text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-neutral-800'
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
