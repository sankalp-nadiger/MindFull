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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OnBoardphase1 />} />
        <Route path="/phase2" element={<OnBoardphase2 />} />
      </Routes>
    </Router>
  );
};

export default App;

