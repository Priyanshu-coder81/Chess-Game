export const ProfileCard = ({ time, started, connect, playersData }) => {
  // For a 20-second game, we only need to show seconds
  const formatTime = () => {
    if (!started) return "00:20";
    if (time === null || time === undefined) return "00:20"; // wait until first socket update

    const timeInSeconds = Math.max(0, Math.floor(time || 0));
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;

      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
   
  };

  // Ensure playersData is always defined
  const safePlayersData = playersData || {
    username: "Player",
    avatar: "/white_400.png",
  };

  return (
    <div className={`w-full text-white flex justify-between m-2 `}>
      <div className='flex'>
        <img
          src={safePlayersData.avatar || "/white_400.png"}
          alt=''
          className='w-10 h-auto'
        />
        <h2 className='pl-2'>
          {connect && safePlayersData.username === "Opponent"
            ? "Searching"
            : safePlayersData.username || "Player"}
        </h2>
      </div>
      <div className='bg-zinc-700 px-5 p-1.5 m-1 rounded'>{formatTime()}</div>
    </div>
  );
};
