import React, { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SignOut from './components/SignOut';
import RequestPasswordReset from './components/RequestPasswordReset';
import ConfirmPasswordReset from './components/ConfirmPasswordReset';
import Form from './components/Form';
import FilterButton from './components/FilterButton';
import Todo from './components/Todo';

import axios from 'axios';
import awsConfig from './aws-config';
import { nanoid } from 'nanoid';
import AWS from 'aws-sdk';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';

AWS.config.update({ region: awsConfig.Region });

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showResetForm, setShowResetForm] = useState(false);
  const [email, setEmail] = useState('');

  async function getAWSCredentials(idToken) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: awsConfig.IdentityPoolId,
      Logins: {
        [`cognito-idp.${awsConfig.Region}.amazonaws.com/${awsConfig.UserPoolId}`]: idToken
      }
    });

    return new Promise((resolve, reject) => {
      AWS.config.credentials.get((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(AWS.config.credentials);
        }
      });
    });
  }

  const fetchData = async () => {
    try {
      const userPool = new CognitoUserPool({
        UserPoolId: awsConfig.UserPoolId,
        ClientId: awsConfig.ClientId,
      });

      const cognitoUser = userPool.getCurrentUser();

      if (cognitoUser) {
        cognitoUser.getSession(async (err, session) => {
          if (err) {
            console.error('Error getting session:', err);
            return;
          }

          const token = session.getIdToken().getJwtToken();

          try {
            await getAWSCredentials(token);

            axios.get('https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks', {
              headers: {
                Authorization: token,
              },
            })
            .then(response => {
              setTasks(response.data || []);
            })
            .catch(error => {
              console.error('Error fetching data:', error);
              setTasks([]); // Set to empty array in case of error
            });
          } catch (error) {
            console.error('Error refreshing credentials:', error);
            setTasks([]); // Set to empty array in case of error
          }
        });
      } else {
        console.error('No current user found.');
        setTasks([]); // Set to empty array in case of error
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setTasks([]); // Set to empty array in case of error
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  function clearTasks() {
    setTasks([]);
  }

  function addTask(name) {
    const userPool = new CognitoUserPool({
      UserPoolId: awsConfig.UserPoolId,
      ClientId: awsConfig.ClientId,
    });

    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          return;
        }

        const token = session.getIdToken().getJwtToken();
        const newTask = { id: `todo-${nanoid()}`, name, completed: false };

        axios.post('https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks', newTask, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          const createdTask = response.data.Item || newTask;
          setTasks([...tasks, createdTask]);
        })
        .catch((error) => {
          console.error('Error adding task:', error);
        });
      });
    }
  }

  function toggleTaskCompleted(id) {
    const userPool = new CognitoUserPool({
      UserPoolId: awsConfig.UserPoolId,
      ClientId: awsConfig.ClientId,
    });

    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          return;
        }

        const token = session.getIdToken().getJwtToken();
        const taskToUpdate = tasks.find((task) => task.id === id);
        const updatedTasks = tasks.map((task) => {
          if (task.id === id) {
            return { ...task, completed: !task.completed };
          }
          return task;
        });

        axios.put(`https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`, {
          id: taskToUpdate.id,
          name: taskToUpdate.name,
          completed: !taskToUpdate.completed,
        }, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        })
        .then(() => {
          setTasks(updatedTasks);
        })
        .catch((error) => {
          console.error('Error updating task:', error);
        });
      });
    }
  }

  function deleteTask(id) {
    const userPool = new CognitoUserPool({
      UserPoolId: awsConfig.UserPoolId,
      ClientId: awsConfig.ClientId,
    });

    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          return;
        }

        const token = session.getIdToken().getJwtToken();

        axios.delete(`https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then(() => {
          const remainingTasks = tasks.filter((task) => id !== task.id);
          setTasks(remainingTasks);
        })
        .catch((error) => {
          console.error('Error deleting task:', error);
        });
      });
    }
  }

  function editTask(id, newName) {
    const userPool = new CognitoUserPool({
      UserPoolId: awsConfig.UserPoolId,
      ClientId: awsConfig.ClientId,
    });

    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          return;
        }

        const token = session.getIdToken().getJwtToken();
        const taskToUpdate = tasks.find((task) => task.id === id);
        const updatedTasks = tasks.map((task) => {
          if (task.id === id) {
            return { ...task, name: newName };
          }
          return task;
        });

        axios.put(`https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`, {
          id: taskToUpdate.id,
          name: newName,
          completed: taskToUpdate.completed,
        }, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        })
        .then(() => {
          setTasks(updatedTasks);
        })
        .catch((error) => {
          console.error('Error updating task:', error);
        });
      });
    }
  }

  return (
    <div className="todoapp stack-large">
      {!isAuthenticated ? (
        <div>
          <SignUp />
          <SignIn setIsAuthenticated={setIsAuthenticated} />
          <RequestPasswordReset setShowResetForm={setShowResetForm} setEmail={setEmail} />
          {showResetForm && <ConfirmPasswordReset email={email} />}
        </div>
      ) : (
        <div>
          <h1>TodoMatic</h1>
          <SignOut setIsAuthenticated={setIsAuthenticated} clearTasks={clearTasks} />
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
          <h2 id="list-heading">{tasks.length} tasks remaining</h2>
          <ul
            role="list"
            className="todo-list stack-large stack-exception"
            aria-labelledby="list-heading"
          >
            {tasks.filter(FILTER_MAP[filter]).map((task) => (
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
