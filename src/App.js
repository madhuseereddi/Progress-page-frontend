import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Signup from './components/Signup';
import FaceAuthorization from './components/FaceAuthorization';
import TodoList from './components/TodoList';

function App() {
  // Get the email query parameter from the URL
  const query = new URLSearchParams(window.location.search);
  const email = query.get("email");
  const emailSuffix = email ? email.split("@")[0] : ""; // Get the part before the '@'
  console.log(emailSuffix);

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Signup} />

        {/* Pass the email suffix as a prop to FaceAuthorization */}
        <Route
          path="/face-recognition"
          render={(props) => (
            <FaceAuthorization {...props} emailSuffix={emailSuffix} email = {email} />
          )}
        />

        <Route exact path="/todolist" component={TodoList} />
        
        <Route exact path="/face-recognition">
          <Redirect to="/face-recognition" />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
