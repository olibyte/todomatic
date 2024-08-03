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

export async function fetchTasks(listId) {
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

    const response = await axios.get(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      params: { ListId: listId }  // Ensure this matches the query parameter name expected by your API
    });
    return response.data || [];
  } else {
    throw new Error('No current user found.');
  }
}
export async function addTask(name, listId) {
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
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token to get the userId
    const userId = decodedToken.sub;

    const newTask = { TaskId: nanoid(), listId, taskName: name, completed: false, userId };

    const response = await axios.post('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks', newTask, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return response.data || newTask;
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
    const taskToUpdate = tasks.find((task) => task.TaskId === id);
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

    await axios.put('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks', updatedTask, {
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
export async function deleteTask(taskId) {
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

    try {
      await axios.delete('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks', {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        data: {
          TaskId: taskId
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  } else {
    throw new Error('No current user found.');
  }
}

export async function editTask(TaskId, taskName) {
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

    try {
      const response = await axios.put(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks`, {
        TaskId: TaskId,
        taskName: taskName
      }, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      return response.data || { TaskId: TaskId, taskName };
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  } else {
    throw new Error('No current user found.');
  }
}