import { CognitoUserPool } from 'amazon-cognito-identity-js';
import awsConfig from '../../aws-config';
import AWS from 'aws-sdk';

export async function getAuthenticatedToken() {
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
    return token;
  } else {
    throw new Error('No current user found.');
  }
}

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
