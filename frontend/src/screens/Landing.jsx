import  Button  from "../components/Button";
import {useNavigate} from "react-router-dom";


const Landing = () => {
    const nvaigate = useNavigate();
  return (
    <div className='min-h-screen bg-neutral-800 '>
      <div id='navbar' className='flex  '>
        <div>
          <img src='./white_on_trans.png' alt='' className='w-20' />
        </div>
        <h2 className="w-full text-white font-bold text-center mt-4 justify-center align-baseline text-3xl font-serif text-shadow-2xs text-shadow-lime-400 hover:text-lime-400 pointer-none:">Chess Khelo </h2>
      </div>
      <div className='container mx-auto px-4 py-8 md:py-16 '>
        <div className='grid grid-cols-1 md:grid-cols-2  gap-8 items-center'>
          <div className='w-full max-w-xl mx-auto order-2 md:order-1'>
            <img
              src='./Top-Chess-board.png'
              alt='Chess Board'
              className='w-full h-auto object-contain'
            />
          </div>
          <div className='flex flex-col  items-center md:items-start text-white md:gap-20 order-1 md:order-2 md:py-0 py-10  space-y-2.5  '>
            <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left '>
              <span className='block'>Play Chess Online</span>
              <span className='block mt-2'>On the #1 Site</span>
            </h1>
           <Button onClick={()=> nvaigate("/game")}> 
            Play Online
            <p className='text-sm md:text-base opacity-90 pt-1'>
                Play with someone
              </p>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
