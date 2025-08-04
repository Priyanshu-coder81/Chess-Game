import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Silk from "./Silk";

export const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, error, formError, clearError, setFormValidationError } =
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "All fields are required";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (!avatar) {
      return "Avatar is required";
    }

    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormValidationError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        avatar: avatar,
      };

      await register(userData);
      // Navigate to game or dashboard after successful registration
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      // Error is already set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className='min-h-screen flex flex-col'>
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

      {/* Signup Form Container */}
      <div className='flex-1 flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md'>
          {/* Signup Form */}
          <div className='bg-neutral-700 rounded-lg shadow-xl p-8'>
            <h2 className='text-2xl font-bold text-white text-center mb-6'>
              Create Your Account
            </h2>

            {/* Error Message */}
            {(error || formError) && (
              <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md'>
                <p className='text-red-400 text-sm'>{error || formError}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className='space-y-6'>
              {/* Avatar Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Profile Picture
                </label>
                <div className='flex items-center space-x-4'>
                  <div className='w-16 h-16 rounded-full bg-neutral-600 border-2 border-gray-500 flex items-center justify-center overflow-hidden'>
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt='Avatar preview'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <svg
                        className='w-8 h-8 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                    )}
                  </div>
                  <div className='flex-1'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleAvatarChange}
                      className='w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-lime-500 file:text-white hover:file:bg-lime-600 file:cursor-pointer cursor-pointer'
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>

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

              {/* Email Field */}
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-300 mb-2'
                >
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent'
                  placeholder='Enter your email'
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

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-300 mb-2'
                >
                  Confirm Password
                </label>
                <input
                  type='password'
                  id='confirmPassword'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent'
                  placeholder='Confirm your password'
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Buttons Container */}
              <div className='flex flex-col space-y-3 pt-4'>
                {/* Signup Button */}
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
                      Creating Account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>

                {/* Login Button */}
                <button
                  type='button'
                  onClick={handleLogin}
                  disabled={isSubmitting}
                  className='w-full bg-transparent border-2 border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
