import React, { Component } from "react";
import { ClipLoader } from "react-spinners";
import Popup from "reactjs-popup";
import { MdDelete } from "react-icons/md"; // Import the delete icon
import { TiTime } from "react-icons/ti"; 
import { AiOutlineHistory } from "react-icons/ai";
import "reactjs-popup/dist/index.css";
import "./index.css";

class TodoList extends Component {
    state = {
        work: "",
        todoListArr: [],
        loading: false,
        popupOpen: false,
        lastWeekTasks: {},
    };

    handleInputChange = (event) => {
        this.setState({ work: event.target.value });
    };

    handleSubmit = async () => {
        const { work } = this.state;
        if (work.trim() === "") {
            alert("Please enter a task.");
            return;
        }

        const email = localStorage.getItem("userEmail");
        this.setState({ loading: true });

        try {
            const response = await fetch("https://sharp-instinctive-ceres.glitch.me/posting_data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ todoItem: work, email }),
            });

            if (response.ok) {
                this.setState({ work: "", loading: false });
                this.fetchTasks();
            } else {
                alert("Failed to post the task.");
                this.setState({ loading: false });
            }
        } catch (error) {
            alert("Failed to post the task due to an error.");
            this.setState({ loading: false });
        }
    };

    fetchTasks = async () => {
        const email = localStorage.getItem("userEmail");
        this.setState({ loading: true });

        try {
            const response = await fetch(`https://sharp-instinctive-ceres.glitch.me/getting_data/${email}`);
            if (response.ok) {
                const data = await response.json();
                this.setState({ todoListArr: data, loading: false });
                this.getLastWeekTasks(data);
            } else {
                alert("Failed to fetch tasks.");
                this.setState({ loading: false });
            }
        } catch (error) {
            alert("Error fetching tasks.");
            this.setState({ loading: false });
        }
    };

    getLastWeekTasks = (tasks) => {
        const now = new Date();
        const lastWeekTasks = {};

        tasks.forEach(task => {
            const createdAt = new Date(task.created_at);
            const dateKey = createdAt.toISOString().split("T")[0];
            if ((now - createdAt) <= 7 * 24 * 60 * 60 * 1000) {
                if (!lastWeekTasks[dateKey]) {
                    lastWeekTasks[dateKey] = [];
                }
                lastWeekTasks[dateKey].push(task);
            }
        });

        Object.keys(lastWeekTasks).forEach(date => {
            lastWeekTasks[date].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });

        this.setState({ lastWeekTasks });
    };

    handleDelete = async (id) => {
        const email = localStorage.getItem("userEmail");
        if (window.confirm("Are you sure you want to delete this task?")) {
            this.setState({ loading: true });

            const response = await fetch("https://sharp-instinctive-ceres.glitch.me/delete_task", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, email }),
            });

            if (response.ok) {
                this.fetchTasks();
            } else {
                alert("Failed to delete task.");
                this.setState({ loading: false });
            }
        }
    };

    toggleCompletion = async (id) => {
        const email = localStorage.getItem("userEmail");
        const taskToToggle = this.state.todoListArr.find(task => task.id === id);
        if (!taskToToggle) return;

        const updatedStatus = !taskToToggle.completed;
        this.setState(prevState => ({
            todoListArr: prevState.todoListArr.map(task =>
                task.id === id ? { ...task, completed: updatedStatus } : task
            )
        }));

        try {
            const response = await fetch("https://sharp-instinctive-ceres.glitch.me/update_task", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, completed: updatedStatus, email }),
            });

            if (!response.ok) throw new Error("Failed to update the completion status.");
            this.fetchTasks();
        } catch (error) {
            alert(error.message);
            this.setState(prevState => ({
                todoListArr: prevState.todoListArr.map(task =>
                    task.id === id ? { ...task, completed: !updatedStatus } : task
                )
            }));
        }
    };

    componentDidMount() {
        this.fetchTasks();
    }

    openPopup = () => this.setState({ popupOpen: true });
    closePopup = () => this.setState({ popupOpen: false });

    render() {
        const { work, todoListArr, loading, popupOpen, lastWeekTasks } = this.state;

        return (
            <div>
                <nav className="navbar">
                    <img src="https://res.cloudinary.com/dx97khgxd/image/upload/v1729914264/Screenshot_2024-10-26_091353-removebg-preview_h1oae1.png" alt="Logo" className="logo" />
                    <div className="navbar-right">
                    <button className="details-button" onClick={this.openPopup}>
                            <AiOutlineHistory style={{ marginRight: '5px' }} /> Last Week Details {/* Add time icon here */}
                        </button>
                    </div>
                </nav>
                <div className="todo-modal">
                    <h1 className="modal-title">My Daily Progress</h1>
                    <div className="input-group">
                        <label htmlFor="work" className="input-label">Enter the Work</label>
                        <input type="text" placeholder="Enter work" className="work-input" id="work" value={work} onChange={this.handleInputChange} />
                        <button className="submit-button" onClick={this.handleSubmit}>Add Task</button>
                    </div>
                    {loading ? (
                        <div className="loader"><ClipLoader color="#6200ea" loading={loading} size={35} /></div>
                    ) : (
                        <div className="table-body">
                            <table className="todo-table">
                                <thead>
                                    <tr>
                                        <th>Serial No</th>
                                        <th>Task</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Completion</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todoListArr.length > 0 ? (
                                        todoListArr.map((todo, index) => (
                                            <tr key={todo.id}>
                                                <td>{index + 1}</td>
                                                <td><div className="task-scroll"><span className="task-text">{todo.item}</span></div></td>
                                                <td>{new Date(todo.created_at).toLocaleDateString()}</td>
                                                <td>{new Date(todo.created_at).toLocaleTimeString()}</td>
                                                <td>
                                                    <input type="checkbox" checked={todo.completed} onChange={() => this.toggleCompletion(todo.id)} />
                                                </td>
                                                <td>
                                                    <button className="delete-button" onClick={() => this.handleDelete(todo.id)}>
                                                    Delete<MdDelete /> {/* Add delete icon here */}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="no-tasks">No tasks available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <Popup open={popupOpen} onClose={this.closePopup} modal>
                    <div className="popup-content">
                        <h2>Last Week Tasks</h2>
                        {Object.keys(lastWeekTasks).length > 0 ? (
                            Object.keys(lastWeekTasks).map(date => (
                                <div key={date}>
                                    <h3>{new Date(date).toLocaleDateString()}</h3>
                                    <table className="last-week-table">
                                        <thead>
                                            <tr>
                                                <th>Task</th>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lastWeekTasks[date].map(task => (
                                                <tr key={task.id}>
                                                    <td>{task.item}</td>
                                                    <td>{new Date(task.created_at).toLocaleDateString()}</td>
                                                    <td>{new Date(task.created_at).toLocaleTimeString()}</td>
                                                    <td>{task.completed ? 'Completed' : 'Pending'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        ) : (
                            <p>No tasks found for the last week.</p>
                        )}
                    </div>
                </Popup>
            </div>
        );
    }
}

export default TodoList;
