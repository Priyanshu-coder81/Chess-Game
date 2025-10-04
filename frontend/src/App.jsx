import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import Dashboard from "./screens/Dashboard";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { AuthProvider } from "./contexts/AuthContext";
import { GuestProvider } from "./contexts/GuestContext";
import { SocketProvider } from "./contexts/SocketContext";

function App() {
  return (
    <GuestProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div>
              <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/game' element={<Game />} />
                <Route path='/dashboard' element={<Dashboard />} />
              </Routes>
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </GuestProvider>
  );
}

export default App;
