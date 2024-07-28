// src/components/Todo/TodoList.js
import React, { useState, useEffect } from 'react';
import Form from './Form';
import FilterButton from './FilterButton';
import Todo from './Todo';
import axios from 'axios';
import awsConfig from '../../aws-config';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';

AWS.config.update({ region: awsConfig.Region });

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

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
            setTasks([]);
          }
        });
      } else {
        console.error('No current user found.');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    <div>
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
  );
}

export default TodoList;
