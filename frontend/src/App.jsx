import { useState } from 'react'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';

import './App.css'
import Landing from './screens/Landing';
import Game from './screens/Game';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Router>
      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </Router>
       
    </>
  )
}

export default App
