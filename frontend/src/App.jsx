// import React from 'react';
// //import AuthPage from './components/pages/Authpage';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import OnBoardphase1 from './components/OnBoardphase1';
// const App = () => <OnBoardphase1 />;

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnBoardphase1 from './components/pages/OnBoardphase1';
import OnBoardphase2 from './components/pages/OnBoardphase2';
import OnBoardphase3 from "./components/pages/OnBoardphase3";
import Home from "./components/pages/Home"; // The landing page for student sign-in
import RoleSelection from "./components/pages/RoleSelection"; // Role selection page for Parent, Counsellor
import StudentSignUp from "./components/pages/StudentSignUp"; // Student sign-up page
import ParentSignIn from "./components/pages/ParentSignIn"; // Parent sign-in page
import CounsellorSignIn from "./components/pages/CounsellorSignIn"; // Counselor sign-in page
import ParentSignUp from "./components/pages/ParentSignUp"; // Parent sign-up page
import CounsellorSignUp from "./components/pages/CounsellorSignUp"; // Counselor sign-up page


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/phase1" element={<OnBoardphase1 />} />
        <Route path="/phase2" element={<OnBoardphase2 />} />
        <Route path="/phase3" element={<OnBoardphase3/>}/>
        {/* <Route path="/" element={<SignInSignUp />} />
        <Route path="/parent-signin" element={<ParentSignIn />} />
        <Route path="/counsellor-signin" element={<CounsellorSignIn />} />
        <Route path="/student-signin" element={<StudentSignIN />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/student-signup" element={<StudentSignUp />} />
        <Route path="/parent-signin" element={<ParentSignIn />} />
        <Route path="/counsellor-signin" element={<CounsellorSignIn />} />
        <Route path="/parent-signup" element={<ParentSignUp />} />
        <Route path="/counsellor-signup" element={<CounsellorSignUp />} />

      </Routes>
    </Router>
  );
};

export default App;

