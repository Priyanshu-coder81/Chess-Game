export const ProfileCard = ({ time, started,connect }) => {
  

  const mins = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const secs = (time % 60).toString().padStart(2, "0");

  const formatTime = `${mins}:${secs}`;


  return (
    <div className={`w-full text-white flex justify-between m-2 `}>
      <div className='flex'>
        <img src='/white_400.png' alt='' className='w-10 h-auto' />
        <h2 className='pl-2'>{connect? "Searching" : "Guest24344428"}</h2>
      </div>
      <div className='bg-zinc-700 px-5  p-1.5 m-1'>
        {started === false ? `10:00` : formatTime}
      </div>
    </div>
  );
};
