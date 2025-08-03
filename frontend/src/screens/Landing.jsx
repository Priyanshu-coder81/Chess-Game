import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IoIosLogIn } from "react-icons/io";
import { Card } from "../components/Card";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // If user is logged in, show logout option
      logout();
      navigate("/");
    } else {
      // If user is not logged in, navigate to login
      navigate("/login");
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleOnPlay = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={`min-h-screen bg-neutral-800 `}>
      {/* Navbar */}
      <div
        id='navbar'
        className='flex items-center justify-between px-4 py-2 md:px-8'
      >
        {/* Logo and Title */}
        <div className='flex items-center'>
          <img src='./white_on_trans.png' alt='' className='w-16 md:w-20' />
        </div>
        <div className='flex items-center '>
          {" "}
          <h2 className='ml-2 md:ml-4 text-white font-bold text-xl md:text-3xl font-serif text-shadow-2xs text-shadow-lime-400 hover:text-lime-400 transition-colors duration-200 '>
            Chess Khelo
          </h2>
        </div>

        {/* Auth Buttons */}
        <div className='flex items-center space-x-2 md:space-x-4'>
          {isAuthenticated ? (
            // User is logged in - show profile and logout
            <div className='flex items-center space-x-2 md:space-x-4'>
              {/* User Avatar/Profile */}
              <div className='flex items-center space-x-2'>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className='w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-lime-400'
                  />
                ) : (
                  <div className='w-8 h-8 md:w-10 md:h-10 rounded-full bg-lime-500 flex items-center justify-center'>
                    <span className='text-white font-bold text-sm md:text-base'>
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <span className='hidden md:block text-white font-medium'>
                  {user?.username}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleAuthAction}
                className='px-3 py-1.5 md:px-4 md:py-2 bg-red-500 hover:bg-red-600 text-white text-sm md:text-base font-semibold rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-800'
              >
                <span className='hidden md:inline'>Logout</span>
                <span className='md:hidden'>Out</span>
              </button>
            </div>
          ) : (
            // User is not logged in - show login and signup
            <div className='flex items-center space-x-2 md:space-x-4 '>
              {/* Login Button */}
              <button
                onClick={handleAuthAction}
                className='px-3 py-1.5 md:px-4 md:py-2 bg-lime-500 hover:bg-lime-600 text-white text-sm md:text-base font-semibold rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-neutral-800 hidden md:inline'
              >
                <span className='hidden md:inline'>Login</span>
              </button>

              {/* Signup Button */}
              <button
                onClick={handleSignup}
                className='px-3 py-1.5 md:px-4 md:py-2 bg-transparent border-2 border-lime-500 hover:border-lime-400 text-lime-400 hover:text-white text-sm md:text-base font-semibold rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-neutral-800'
              >
                <span className=''>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8 md:py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
          <div className='w-full max-w-xl mx-auto order-2 md:order-1'>
            <img
              src='./Top-Chess-board.png'
              alt='Chess Board'
              className='w-full h-auto object-contain'
            />
          </div>
          <div className='flex flex-col items-center md:items-start text-white md:gap-20 order-1 md:order-2 md:py-0 py-10 space-y-2.5'>
            <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left'>
              <span className='block'>Play Chess Online</span>
              <span className='block mt-2'>On the #1 Site</span>
            </h1>
            <Button onClick={handleOnPlay}>
              Play Online
              <p className='text-sm md:text-base opacity-90 pt-1'>
                Play with someone
              </p>
            </Button>
          </div>
        </div>
      </div>
      {/* Modal */}
      <Card isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Landing;
