import { RiTimerFlashLine } from "react-icons/ri";
import { BsPlusSquareFill } from "react-icons/bs";
export const Dashboard = ({color}) => {
  return (
    <div className='bg-zinc-700 w-full h-full '>
      <div className=' w-full md:w-auto   '>
        <div className='  w-full grid grid-cols-2 text-white'>
          <div className='  pt-2   '>
            <div className='hover:bg-zinc-800 w-[95%] h-auto text-center font-bold text-2xl flex flex-col items-center justify-center p-0.5 m-auto '>
              <RiTimerFlashLine className="text-xl" />
              Play
            </div>
          </div>
          <div className='  pt-2   '>
            <div className='hover:bg-zinc-800 w-[95%] h-auto text-center font-bold text-xl flex flex-col items-center justify-center p-1.5 m-auto'>
              <BsPlusSquareFill className="text-lg"/>
              New Game
            </div>
          </div>
        </div>
        <hr />
        <div>
            <h2>
                Your'e {color === "white"? "White!":"Black!"}
            </h2>
        </div>
      </div>
    </div>
  );
};
