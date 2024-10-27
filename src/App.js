import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Signup from './components/Signup';
import FaceAuthorization from './components/FaceAuthorization';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Signup} />
        <Route exact path="/face-recognition" component={FaceAuthorization} />
        <Route exact path = "/face-verification">
          <Redirect to="/face-recognition" />
        </Route>
        {/* Add more routes as needed */}
      </Switch>
    </Router>
  );
}

export default App;
