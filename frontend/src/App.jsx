import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Landing from "./screens/Landing";
import Game from "./screens/Game";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/game' element={<Game />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
