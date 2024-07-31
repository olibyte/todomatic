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

export async function fetchLists(userId) {
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

    const response = await axios.get(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/lists`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      params: { userId }
    });
    return response.data || [];
  } else {
    throw new Error('No current user found.');
  }
}


export async function addList(listName, userId) {
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
    const newList = { ListId: nanoid(), userId, listName };

    try {
      const response = await axios.post('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/lists', newList, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      return response.data.Item || newList;
    } catch (error) {
      console.error('Error adding list:', error);
      throw error;
    }
  } else {
    throw new Error('No current user found.');
  }
}

export async function updateList(listId, listName) {
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

    const response = await axios.put(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/lists`, {
      ListId: listId,
      UpdateExpression: "set listName = :name",
      ExpressionAttributeValues: {
        ":name": listName
      }
    }, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return response.data.Item || { ListId: listId, listName };
  } else {
    throw new Error('No current user found.');
  }
}

export async function deleteList(listId) {
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
      await axios.delete(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/lists/${listId}`, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  } else {
    throw new Error('No current user found.');
  }
}
