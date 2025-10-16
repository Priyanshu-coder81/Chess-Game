const Button = ({ children, onClick, className = "" , connect }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-lime-500 rounded-2xl hover:bg-lime-600 transition-colors w-full md:w-auto md:pr-2 max-w-md ${className}`}
    >
      <div className='flex items-center gap-4 p-4'>
        <div className='w-12'>
         {!connect? (<img
            src="./play-white.svg"
            alt='Play Icon'
            className='w-full h-auto'
          />) :  <img class="w-15 h-15 animate-spin invert" src="./loading-spinner.svg" alt="Loading icon" />}
        </div>
        <div>
          <h2 className='text-2xl md:text-3xl font-bold pr-1'>{children}</h2>
          
        </div>
      </div>
    </button>
  );
};

export default Button;
