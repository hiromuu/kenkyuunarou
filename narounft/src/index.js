import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login/login';
import Welcome from './welcome/welcome';
import NovelList from './novellist/novellist';
import NewNovel from './newnovels/newnovels';
import Editnovel from './editnovel/editnovel';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/novellist" element={<NovelList />} />
        <Route path="/newnovels" element={< NewNovel />} />
        <Route path="/editnovel" element={< Editnovel />} />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);