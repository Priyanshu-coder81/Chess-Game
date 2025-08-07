export const ProfileCard = ({ time, started,connect, playersData }) => {
 
  const mins = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const secs = (time % 60).toString().padStart(2, "0");

  const formatTime = `${mins}:${secs}`;

  return (
    <div className={`w-full text-white flex justify-between m-2 `}>
      <div className='flex'>
        <img src={playersData? playersData.avatar : "/white_400.png"} alt='' className='w-10 h-auto' />
        <h2 className='pl-2'>{(connect && playersData.username === "Opponent")? "Searching" : playersData? playersData.username: ""}</h2>
      </div>
      <div className='bg-zinc-700 px-5  p-1.5 m-1'>
        {started === false ? `10:00` : formatTime}
      </div>
    </div>
  );
};
