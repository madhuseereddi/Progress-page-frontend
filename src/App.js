import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Signup from './components/Signup';
import FaceAuthorization from './components/FaceAuthorization';
import TodoList from './components/TodoList';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Signup} />
        <Route exact path="/face-verification" component={FaceAuthorization} />
        <Route exact path="/todolist" component={TodoList} />
        <Route exact path = "/face-recognition">
          <Redirect to="/face-verification" />
        </Route>
        {/* Add more routes as needed */}
      </Switch>
    </Router>
  

  );
}

export default App;
