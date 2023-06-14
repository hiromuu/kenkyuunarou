import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './Login';
import Welcome from './Welcome';

const App = () => {
  return (
    <Router>
      <Route path="/" exact component={Login} />
      <Route path="/welcome" component={Welcome} />
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
