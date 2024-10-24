import "./index.css";
import { Component } from "react";


class TodoList extends Component {
  state = {
    work: "",
    responseMessage: "",
    todoListArr: [], // Array to store fetched tasks
  };

  // Function to handle input changes
  handleInputChange = (event) => {
    this.setState({ work: event.target.value });
  };

  // Function to handle form submission and post the data
  handleSubmit = async () => {
    const { work } = this.state;
    if (work.trim() === "") {
      alert("Please enter a task.");
      return;
    }

    // Post request to the localhost endpoint
    const response = await fetch("http://localhost:5000/posting_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ todoItem: work }),
    });

    if (response.ok) {
      const data = await response.json();
      this.setState({ responseMessage: data.message, work: "" });

      // After successfully posting, fetch the updated task list
      this.fetchTasks();
    } else {
      alert("Failed to post the task.");
    }
  };

  // Function to get data from the server and update state
  fetchTasks = async () => {
    const response = await fetch("http://localhost:5000/getting_data");
    if (response.ok) {
      const data = await response.json();
      this.setState({ todoListArr: data });
    } else {
      alert("Failed to fetch tasks.");
    }
  };

  // Fetch the tasks when the component mounts
  componentDidMount() {
    this.fetchTasks();
  }

  render() {

    const { work, todoListArr } = this.state;
    console.log(todoListArr)

    return (
      <div>
        <h1>My Daily Progress</h1>

        <div>
          <label htmlFor="work">Enter the Work</label>
          <input
            type="text"
            placeholder="Enter work"
            className="work-input"
            id="work"
            value={work}
            onChange={this.handleInputChange}
          />
        </div>
        <button onClick={this.handleSubmit}>Submit</button>

        {/* Render the list of tasks */}
        <ul>
          {todoListArr.length > 0 ? (
            todoListArr.map((todo, index) => (
              <li key={index}>{todo.item}</li>
            ))
          ) : (
            <li>No tasks available</li>
          )}
        </ul>
      </div>
    );
  }
}

export default TodoList;
