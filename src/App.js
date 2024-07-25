import React, { useState, useRef, useEffect } from "react";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import SignOut from "./components/SignOut";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import Todo from "./components/Todo";

import { signOut } from "./auth";
import awsConfig from "./aws-config";
import AWS from "aws-sdk";

import { nanoid } from "nanoid";
import axios from "axios";

AWS.config.update(awsConfig);

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState("All");

  /*
  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks"
      );

      setTasks(response.data.Items);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
*/

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        try {
          const session = AWS.config.credentials;

          const token = session.getIdToken().getJwtToken();

          const response = await axios.get(
            "https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks",
            {
              headers: {
                Authorization: token,
              },
            }
          );
          setTasks(response.data.Items);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [isAuthenticated]);

  function toggleTaskCompleted(id) {
    const taskToUpdate = tasks.find((task) => task.id === id);
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        // Toggle the completed status
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    // Send a PUT request to update the task's completion status
    axios
      .put(
        `https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`,
        {
          id: taskToUpdate.id,
          name: taskToUpdate.name,
          completed: !taskToUpdate.completed, // Toggle the completion status
        }
      )
      .then(() => {
        // If the PUT request is successful, update the state with the changes
        setTasks(updatedTasks);
      })
      .catch((error) => {
        console.error("Error updating task:", error);
      });
  }

  function addTask(name) {
    const newTask = { id: `todo-${nanoid()}`, name, completed: false };

    // Send a POST request to your API Gateway endpoint to add the new task
    axios
      .post(
        "https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks",
        newTask
      )
      .then((response) => {
        console.log("API response:", response.data);
        // If the POST request is successful, update the state with the new task
        // If the API does not return the created task, use the newTask object
        const createdTask = response.data.Item || newTask;
        setTasks([...tasks, createdTask]);
      })
      .catch((error) => {
        console.error("Error adding task:", error);
      });
  }

  function deleteTask(id) {
    // Send a DELETE request to your API Gateway endpoint to delete the task
    axios
      .delete(
        `https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`
      )
      .then(() => {
        // If the DELETE request is successful, remove the task from the state
        const remainingTasks = tasks.filter((task) => id !== task.id);
        setTasks(remainingTasks);
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
      });
  }
  function editTask(id, newName) {
    // Find the task in the current state by its ID
    const taskToUpdate = tasks.find((task) => task.id === id);

    // Make the changes locally first
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, name: newName };
      }
      return task;
    });

    // Send a PUT request to update the task in the database
    axios
      .put(
        `https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`,
        {
          id: taskToUpdate.id,
          name: newName,
          completed: taskToUpdate.completed,
        }
      )
      .then(() => {
        // If the PUT request is successful, update the state with the changes
        setTasks(updatedTasks);
      })
      .catch((error) => {
        console.error("Error updating task:", error);
      });
  }
  /*
  const taskList = tasks
    .filter(FILTER_MAP[filter])
    .map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        completed={task.completed}
        key={task.id}
        toggleTaskCompleted={toggleTaskCompleted}
        deleteTask={deleteTask}
        editTask={editTask}
      />
    ));
  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));
  const tasksNoun = taskList.length !== 1 ? "tasks" : "task";
  const headingText = `${taskList.length} ${tasksNoun} remaining`;

  const listHeadingRef = useRef(null);
  const prevTaskLength = usePrevious(tasks.length);
  useEffect(() => {
    if (tasks.length - prevTaskLength === -1) {
      listHeadingRef.current.focus();
    }
  }, [tasks.length, prevTaskLength]);

  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask} />
      <div className="filters btn-group stack-exception">{filterList}</div>
      <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}>
        {headingText}
      </h2>

      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {taskList}
      </ul>
    </div>
  );
}
  */
  return (
    <div className="todoapp stack-large">
      {!isAuthenticated ? (
        <div>
          <SignUp />

          <SignIn setIsAuthenticated={setIsAuthenticated} />
        </div>
      ) : (
        <div>
          <h1>TodoMatic</h1>
          <SignOut setIsAuthenticated={setIsAuthenticated} />

          <Form addTask={addTask} />

          <div className="filters btn-group stack-exception">
            {FILTER_NAMES.map((name) => (
              <FilterButton
                key={name}
                name={name}
                isPressed={name === filter}
                setFilter={setFilter}
              />
            ))}
          </div>

          <h2 id="list-heading" tabIndex="-1">
            {tasks.length} tasks remaining
          </h2>

          <ul
            role="list"
            className="todo-list stack-large stack-exception"
            aria-labelledby="list-heading"
          >
            {tasks

              .filter(FILTER_MAP[filter])

              .map((task) => (
                <Todo
                  id={task.id}
                  name={task.name}
                  completed={task.completed}
                  key={task.id}
                  toggleTaskCompleted={toggleTaskCompleted}
                  deleteTask={deleteTask}
                  editTask={editTask}
                />
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
