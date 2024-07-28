// src/components/Todo/TaskService.js
import AWS from 'aws-sdk';
import axios from 'axios';
import awsConfig from '../../aws-config';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { nanoid } from 'nanoid';

AWS.config.update({ region: awsConfig.Region });

export async function getAWSCredentials(idToken) {
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: awsConfig.IdentityPoolId,
    Logins: {
      [`cognito-idp.${awsConfig.Region}.amazonaws.com/${awsConfig.UserPoolId}`]: idToken,
    },
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

export async function fetchTasks() {
  const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.UserPoolId,
    ClientId: awsConfig.ClientId,
  });

  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    const session = await new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    });

    const token = session.getIdToken().getJwtToken();
    await getAWSCredentials(token);

    const response = await axios.get('https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks', {
      headers: {
        Authorization: token,
      },
    });
    return response.data || [];
  } else {
    throw new Error('No current user found.');
  }
}

export async function addTask(name) {
  const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.UserPoolId,
    ClientId: awsConfig.ClientId,
  });

  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    const session = await new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    });

    const token = session.getIdToken().getJwtToken();
    const newTask = { id: `todo-${nanoid()}`, name, completed: false };

    const response = await axios.post('https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks', newTask, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return response.data.Item || newTask;
  } else {
    throw new Error('No current user found.');
  }
}

export async function toggleTaskCompleted(id, tasks) {
  const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.UserPoolId,
    ClientId: awsConfig.ClientId,
  });

  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    const session = await new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    });

    const token = session.getIdToken().getJwtToken();
    const taskToUpdate = tasks.find((task) => task.id === id);
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

    await axios.put(`https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`, updatedTask, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return updatedTask;
  } else {
    throw new Error('No current user found.');
  }
}

export async function deleteTask(id) {
  const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.UserPoolId,
    ClientId: awsConfig.ClientId,
  });

  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    const session = await new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    });

    const token = session.getIdToken().getJwtToken();

    await axios.delete(`https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`, {
      headers: {
        Authorization: token,
      },
    });
  } else {
    throw new Error('No current user found.');
  }
}

export async function editTask(id, newName, tasks) {
  const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.UserPoolId,
    ClientId: awsConfig.ClientId,
  });

  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    const session = await new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    });

    const token = session.getIdToken().getJwtToken();
    const taskToUpdate = tasks.find((task) => task.id === id);
    const updatedTask = { ...taskToUpdate, name: newName };

    await axios.put(`https://gh8polh35e.execute-api.us-east-1.amazonaws.com/default/tasks/${id}`, updatedTask, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return updatedTask;
  } else {
    throw new Error('No current user found.');
  }
}
