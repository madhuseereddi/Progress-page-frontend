import "./index.css";
import { Component } from "react";

class TodoList extends Component {
  state = {
    visitorId: "", // State to store visitor ID
  };

  // Function to initialize FingerprintJS and get the visitor ID
  getFingerprint = async () => {
    const FingerprintJS = await import('https://openfpcdn.io/fingerprintjs/v4')
      .then(FingerprintJS => FingerprintJS.load());

    // Get the visitor identifier
    const result = await FingerprintJS.get();
    const visitorId = result.visitorId;
    
    // Set the visitorId in the state
    this.setState({ visitorId });

    console.log("Visitor ID:", visitorId);
  };

  // Call the getFingerprint function when the component mounts
  componentDidMount() {
    this.getFingerprint();
  }

  render() {
    const { visitorId } = this.state;

    return (
      <div>
        <h1>Todo List</h1>
        <p>Visitor ID: {visitorId ? visitorId : "Fetching..."}</p>
        {/* The rest of your component code can go here */}
        <div>madhu</div>
      </div>
    );
  }
}

export default TodoList;
