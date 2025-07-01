import React, { Suspense } from "react"
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner"
import PageSkeleton from "./components/LoadingSpinner/PageSkeleton"
import HealthNutritionWebsite from "./components/HomePage/testing"

// Import i18n setup
import './i18n'
import { LanguageProvider } from './contexts/LanguageContext'
import Notifications from "./components/Councellor/Notifications/Notifications"
import Clients from "./components/Councellor/Clients/Client"
import Profile from "./components/Councellor/Profile/Profile"
import Schedule from "./components/Councellor/Schedule/Schedule"

// Lazy load components for better performance
const HomePage = React.lazy(() => import('./components/HomePage/HomePage'))
const ParentDashboard = React.lazy(() => import("./components/ParentPage/ParentPage"))
const HeroHighlightDemo = React.lazy(() => import("./components/MainPage/mainPage").then(module => ({ default: module.HeroHighlightDemo })))
const Activity = React.lazy(() => import("./components/Activities/activity"))
const Councellor = React.lazy(() => import("./components/Councellor/Councellor"))
const Quiz = React.lazy(() => import("./components/Games/quizgame"))
const VisionBoard = React.lazy(() => import("./components/VisionBoard/VisionBoard"))
const SudokuGame = React.lazy(() => import("./components/Games/sudoku"))
const CrosswordGame = React.lazy(() => import("./components/Games/Crosswords"))
const Leaderboard = React.lazy(() => import("./components/Badges and Leaderboard/Leaderboard"))
const OnBoardphase1 = React.lazy(() => import("./components/pages/OnBoardphase1"))
const OnBoardphase2 = React.lazy(() => import('./components/pages/OnBoardphase2'))
const OnBoardphase3 = React.lazy(() => import("./components/pages/OnBoardPhase3"))
const RoleSelection = React.lazy(() => import("./components/pages/RoleSelection"))
const ParentSignIn = React.lazy(() => import("./components/pages/ParentSignIn"))
const CounsellorSignIn = React.lazy(() => import("./components/pages/CounsellorSignIn"))
const ParentSignUp = React.lazy(() => import("./components/pages/ParentSignUp"))
const CounsellorSignUp = React.lazy(() => import("./components/pages/CounsellorSignUp"))
const Counsellorphase1 = React.lazy(() => import("./components/pages/Counsellorphase1"))
const StudentSignIn = React.lazy(() => import('./components/pages/StudentSignIn'))
const StudentSignUp = React.lazy(() => import('./components/pages/StudentSignUp'))
const JournalEntryWithSuggestions = React.lazy(() => import('./components/pages/JournalPage'))
const ResultPage = React.lazy(() => import('./components/pages/ResultPage'))
const ActivityRecommendations = React.lazy(() => import('./components/pages/Activity'))
const CreatePost = React.lazy(() => import('./components/pages/CreatePost'))
const SuccessStories = React.lazy(() => import("./components/HomePage/SuccessStories"))
const VideoChat = React.lazy(() => import("./components/Videochat/Videochat"))
const AIrecommendation = React.lazy(() => import("./components/Materialrecommendation/AIrecommendation"))
const CommunityChat = React.lazy(() => import("./components/Community/Communitychat"))
const Session = React.lazy(() => import("./components/Councellor/Session/Session"))
const UserProfile = React.lazy(() => import("./components/Profiles/userprofile"))
const CounsellorProfile = React.lazy(() => import("./components/Profiles/Councellorprofile"))
const ChatBox = React.lazy(() => import("./components/pages/Chatbot"))
const MusicPlayerApp = React.lazy(() => import("./components/Music/Musicplayer"))
const Breathingexercise = React.lazy(() => import("./components/Exercises/Breathing"))
const TodoListPage = React.lazy(() => import("./components/pages/Todolist"))

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
             <Route path="/test" element={<HealthNutritionWebsite />} />
            <Route path="/ParentDashboard" element={
              <Suspense fallback={<PageSkeleton />}>
                <ParentDashboard />
              </Suspense>
            } />
            <Route path="/MainPage" element={
              <Suspense fallback={<PageSkeleton />}>
                <HeroHighlightDemo />
              </Suspense>
            } />
            <Route path="/councellor" element={
              <Suspense fallback={<PageSkeleton />}>
                <Councellor />
              </Suspense>
            } />
            <Route path="/communitychat" element={
              <Suspense fallback={<PageSkeleton />}>
                <CommunityChat />
              </Suspense>
            } />
            <Route path="/Quiz" element={
              <Suspense fallback={<PageSkeleton />}>
                <Quiz />
              </Suspense>
            } />
            <Route path="/SudokuGame" element={
              <Suspense fallback={<PageSkeleton />}>
                <SudokuGame />
              </Suspense>
            } />
            <Route path="/Crossword" element={
              <Suspense fallback={<PageSkeleton />}>
                <CrosswordGame />
              </Suspense>
            } />
            <Route path="/Leaderboard" element={
              <Suspense fallback={<PageSkeleton />}>
                <Leaderboard />
              </Suspense>
            } />
            <Route path="/phase1" element={
              <Suspense fallback={<PageSkeleton />}>
                <OnBoardphase1 />
              </Suspense>
            } />
            <Route path="/phase2" element={
              <Suspense fallback={<PageSkeleton />}>
                <OnBoardphase2 />
              </Suspense>
            } />
            <Route path="/phase3" element={
              <Suspense fallback={<PageSkeleton />}>
                <OnBoardphase3 />
              </Suspense>
            } />
            <Route path="/Chatbot" element={
              <Suspense fallback={<PageSkeleton />}>
                <ChatBox />
              </Suspense>
            } />
            <Route path="/role-selection" element={
              <Suspense fallback={<PageSkeleton />}>
                <RoleSelection />
              </Suspense>
            } />
            <Route path="/student-signup" element={
              <Suspense fallback={<PageSkeleton />}>
                <StudentSignUp />
              </Suspense>
            } />
            <Route path="/parent-signin" element={
              <Suspense fallback={<PageSkeleton />}>
                <ParentSignIn />
              </Suspense>
            } />
            <Route path="/counsellor-signin" element={
              <Suspense fallback={<PageSkeleton />}>
                <CounsellorSignIn />
              </Suspense>
            } />
            <Route path="/parent-signup" element={
              <Suspense fallback={<PageSkeleton />}>
                <ParentSignUp />
              </Suspense>
            } />
            <Route path="/counsellor-signup" element={
              <Suspense fallback={<PageSkeleton />}>
                <CounsellorSignUp />
              </Suspense>
            } />
            <Route path="/counsellorphase1" element={
              <Suspense fallback={<PageSkeleton />}>
                <Counsellorphase1 />
              </Suspense>
            } />
            <Route path="/student-signin" element={
              <Suspense fallback={<PageSkeleton />}>
                <StudentSignIn />
              </Suspense>
            } /> 
            <Route path="/student-signup" element={
              <Suspense fallback={<PageSkeleton />}>
                <StudentSignUp />
              </Suspense>
            } />
            <Route path="/result" element={
              <Suspense fallback={<PageSkeleton />}>
                <ResultPage />
              </Suspense>
            } />
            <Route path="/journals" element={
              <Suspense fallback={<PageSkeleton />}>
                <JournalEntryWithSuggestions />
              </Suspense>
            } />
            <Route path="/activity" element={
              <Suspense fallback={<PageSkeleton />}>
                <ActivityRecommendations />
              </Suspense>
            } />
        
            <Route path="/createPost" element={
              <Suspense fallback={<PageSkeleton />}>
                <CreatePost />
              </Suspense>
            } />
            <Route path="/SuccessStories" element={
              <Suspense fallback={<PageSkeleton />}>
                <SuccessStories />
              </Suspense>
            } />
            <Route path="/video" element={
              <Suspense fallback={<PageSkeleton />}>
                <VideoChat />
              </Suspense>
            } />
            <Route path="/recommend" element={
              <Suspense fallback={<PageSkeleton />}>
                <AIrecommendation />
              </Suspense>
            } />
            <Route path="/community" element={
              <Suspense fallback={<PageSkeleton />}>
                <CommunityChat />
              </Suspense>
            } />
            <Route path="/sessions" element={
              <Suspense fallback={<PageSkeleton />}>
                <Session />
              </Suspense>
            } />
            <Route path="/userprofile" element={
              <Suspense fallback={<PageSkeleton />}>
                <UserProfile />
              </Suspense>
            } />
            <Route path="/Councellorprofile" element={
              <Suspense fallback={<PageSkeleton />}>
                <CounsellorProfile />
              </Suspense>
            } />
            <Route path="/Musicplayer" element={
              <Suspense fallback={<PageSkeleton />}>
                <MusicPlayerApp />
              </Suspense>
            } />
            <Route path="/Breathingexercise" element={
              <Suspense fallback={<PageSkeleton />}>
                <Breathingexercise />
              </Suspense>
            } />
            <Route path="/todo" element={
              <Suspense fallback={<PageSkeleton />}>
                <TodoListPage />
              </Suspense>
            } />
            <Route path="/vision-board" element={
              <Suspense fallback={<PageSkeleton />}>
                <VisionBoard />
              </Suspense>
            } />
            <Route path="/notifications" element={
              <Suspense fallback={<PageSkeleton />}>
                <Notifications />
              </Suspense>
            } />    
            <Route path="/clients" element={
              <Suspense fallback={<PageSkeleton />}>
                <Clients />
              </Suspense>
            } />  
            <Route path="/profile" element={
              <Suspense fallback={<PageSkeleton />}>
                <Profile />
              </Suspense>
            } /> 
            <Route path="/schedule" element={
              <Suspense fallback={<PageSkeleton />}>
                <Schedule />
              </Suspense>
            } />    </Routes>
        </Suspense>
      </Router>
    </LanguageProvider>
  )
}

export default App
