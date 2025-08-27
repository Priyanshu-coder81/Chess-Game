# ♟️ Real-Time Multiplayer Chess Game

A real-time online chess game built with modern web technologies. Players can log in, challenge others, and enjoy a seamless multiplayer chess experience.

---

## ✨ Features Achieved

- **Authentication System**: Login/Signup support for registered users.  
- **Multiplayer Gameplay**: Play chess in real time with another player.  
- **Move Validation & Timer**: Enforces proper chess rules with a working chess clock that switches turns automatically.  
- **Game Controls**: Players can **resign mid-game** or **offer a draw**.  
- **Complete Game Flow**: From match start to game-over, everything works smoothly.  

---

## 🚧 Work in Progress

- Hide the **Play button** while searching (or replace it with a **Cancel button**).  
- Store **moves in Redis** for persistence and potential replay.  
- Add **Guest IDs** for quick play without signup.  
- Implement a **Recovery Mechanism** so players can reconnect after refresh or disconnection.
- User Dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS  
- **Backend**: Node.js, Express.js, Socket.IO  
- **Database**: MongoDB, Redis (for moves & sessions)  

---

## 🚀 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/chess-game.git
   cd chess-game
2. Install dependencies:
  ```bash
  npm install
```
3. Run the development server:
  ```bash
npm run dev
```

📌 Future Scope

Match history and replay system.

Player profiles and rankings.

AI opponent mode.


🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork this repo and submit a pull request.

