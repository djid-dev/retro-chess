import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import CRT from './components/CRT'
import './App.css'
import GameBoard from './components/GameBoard'

function App() {
  return (
    <>
      <CRT>
        <GameBoard />
        
      </CRT>
    </>
  )
}

export default App
