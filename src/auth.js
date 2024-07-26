// src/auth.js
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';
import awsConfig from './aws-config';

const userPool = new CognitoUserPool({
  UserPoolId: awsConfig.UserPoolId,
  ClientId: awsConfig.ClientId,
});

export function signUp(username, password, email, givenName, familyName, profile, birthdate, callback) {
  const attributeList = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'given_name', Value: givenName }),
    new CognitoUserAttribute({ Name: 'family_name', Value: familyName }),
    new CognitoUserAttribute({ Name: 'profile', Value: profile }),
    new CognitoUserAttribute({ Name: 'birthdate', Value: birthdate }),
  ];

  userPool.signUp(username, password, attributeList, null, callback);
}

export function signIn(username, password, callback) {
  const authenticationDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      console.log('Authentication successful:', result);
      const logins = {
        [`cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.UserPoolId}`]: result.getIdToken().getJwtToken(),
      };

      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsConfig.IdentityPoolId,
        Logins: logins,
      });

      AWS.config.credentials.refresh((error) => {
        if (error) {
          console.error('Error refreshing credentials:', error);
          callback(error);
        } else {
          console.log('AWS Credentials:', AWS.config.credentials);
          callback(null, result);
        }
      });
    },
    onFailure: (err) => {
      console.error('Authentication failed:', err);
      callback(err);
    },
  });
}

export function signOut() {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser != null) {
    cognitoUser.signOut();
  }
}
