import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IoPerson, IoLogOutOutline } from "react-icons/io5";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    navigate("/dashboard");
    setIsDropdownOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return (
    <nav className='flex items-center justify-between px-4 py-3 md:px-8 bg-neutral-800 border-b border-neutral-700'>
      {/* Logo */}
      <div className='flex items-center'>
        <img
          src='./white_on_trans.png'
          alt='Chess Logo'
          className='w-12 h-12 md:w-20 md:h-20 p-2'
        />
      </div>

      {/* Centered Title */}
      <div className='flex-1 flex justify-center'>
        <h1 className='text-white font-bold text-xl md:text-3xl font-serif text-shadow-lg hover:text-lime-400 transition-colors duration-200 cursor-pointer'>
          Chess Khelo
        </h1>
      </div>

      {/* Right Side - Auth/User */}
      <div className='flex items-center space-x-2 md:space-x-4'>
        {isAuthenticated ? (
          // User is logged in - show avatar and dropdown
          <div className='relative' ref={dropdownRef}>
            <div
              className='flex items-center space-x-2 cursor-pointer hover:bg-neutral-700 rounded-lg p-2 transition-colors duration-200'
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {/* Avatar */}
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

              {/* Username */}
              <span className='text-white font-medium hidden md:block'>
                {user?.username}
              </span>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-white transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-neutral-700 rounded-lg shadow-lg border border-neutral-600 z-50'>
                <div className='py-1'>
                  {/* Profile Option */}
                  <button
                    onClick={handleProfileClick}
                    className='w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-neutral-600 transition-colors duration-200 rounded-t-lg'
                  >
                    <IoPerson className='w-5 h-5' />
                    <span>Profile</span>
                  </button>

                  {/* Divider */}
                  <div className='border-t border-neutral-600'></div>

                  {/* Logout Option */}
                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-neutral-600 hover:text-red-300 transition-colors duration-200 rounded-b-lg'
                  >
                    <IoLogOutOutline className='w-5 h-5' />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // User is not logged in - show login and signup buttons
          <div className='flex items-center space-x-2 md:space-x-4'>
            {/* Login Button */}
            <button
              onClick={handleLoginClick}
              className='px-3 py-1.5 md:px-4 md:py-2 bg-lime-500 hover:bg-lime-600 text-white text-sm md:text-base font-semibold rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-neutral-800 hidden md:inline'
            >
              Login
            </button>

            {/* Signup Button */}
            <button
              onClick={handleSignupClick}
              className='px-3 py-1.5 md:px-4 md:py-2 bg-transparent border-2 border-lime-500 hover:border-lime-400 text-lime-400 hover:text-white text-sm md:text-base font-semibold rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-neutral-800'
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
