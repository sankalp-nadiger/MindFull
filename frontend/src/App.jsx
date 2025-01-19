import React from "react"
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import './App.css'
import HomePage from './components/HomePage/HomePage'
import ParentDashboard from "./components/ParentPage/ParentPage"
import { HeroHighlightDemo } from "./components/MainPage/mainPage"
import Activity from "./components/Activities/activity"
function App() {

  return (
    <>
      <Router>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ParentDashboard" element={<ParentDashboard />} />
        <Route path="/MainPage" element={<HeroHighlightDemo />} />
        <Route path="/Activities" element={<Activity />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
