import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Silk from "./Silk";

export const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, error, formError, clearError, setFormValidationError } =
    useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData);
      // Navigate to game or dashboard after successful login
      navigate("/game");
    } catch (error) {
      console.error("Login failed:", error);
      // Error is already set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <>
      <div className='min-h-screen flex flex-col relative overflow-hidden'>
        <Silk
          speed={5}
          scale={1}
          color='#adff2f'
          noiseIntensity={1.5}
          rotation={0}
          
          style={{ zIndex: -1 }}
        />
        {/* Dark overlay for better readability */}
        <div
          className='fixed inset-0 bg-neutral-800/40'
          style={{ zIndex: -1 }}
        ></div>
        {/* Navbar */}
        <div id='navbar' className='flex relative z-10 pt-10'>
          
          <h2 className='w-full text-white font-bold text-center mt-4 justify-center align-baseline text-4xl font-serif text-shadow-2xs text-shadow-lime-400 hover:text-lime-400 pointer-none:'>
            Chess Khelo
          </h2>
        </div>

        {/* Login Form Container */}
        <div className='flex-1 flex items-center justify-center px-4 relative z-10'>
          <div className='w-full max-w-md'>
            {/* Login Form */}
            <div className='bg-neutral-700 rounded-lg shadow-xl p-8'>
              <h2 className='text-2xl font-bold text-white text-center mb-6'>
                Login to Your Account
              </h2>

              {/* Error Message */}
              {(error || formError) && (
                <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md'>
                  <p className='text-red-400 text-sm'>{error || formError}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className='space-y-6'>
                {/* Username Field */}
                <div>
                  <label
                    htmlFor='username'
                    className='block text-sm font-medium text-gray-300 mb-2'
                  >
                    Username
                  </label>
                  <input
                    type='text'
                    id='username'
                    name='username'
                    value={formData.username}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent'
                    placeholder='Enter your username'
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-300 mb-2'
                  >
                    Password
                  </label>
                  <input
                    type='password'
                    id='password'
                    name='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent'
                    placeholder='Enter your password'
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Buttons Container */}
                <div className='flex flex-col space-y-3 pt-4'>
                  {/* Enter Button */}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full bg-lime-500 hover:bg-lime-600 disabled:bg-lime-600/50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-neutral-700'
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center'>
                        <svg
                          className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      "Enter"
                    )}
                  </button>

                  {/* Signup Button */}
                  <button
                    type='button'
                    onClick={handleSignup}
                    disabled={isSubmitting}
                    className='w-full bg-transparent border-2 border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Signup
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
