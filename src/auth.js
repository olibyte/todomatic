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
      console.log('Authentication successful');
      console.log('ID Token:', result.getIdToken().getJwtToken());
      console.log('Access Token:', result.getAccessToken().getJwtToken());
      console.log('Refresh Token:', result.getRefreshToken().getToken());

      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsConfig.IdentityPoolId,
        Logins: {
          [`cognito-idp.${awsConfig.Region}.amazonaws.com/${awsConfig.UserPoolId}`]: result.getIdToken().getJwtToken(),
        },
      });

      AWS.config.credentials.refresh((error) => {
        if (error) {
          console.error('Error refreshing credentials:', error);
          callback(error);
        } else {
          console.log('AWS credentials refreshed successfully');
          callback(null, result);
        }
      });
    },
    onFailure: (err) => {
      console.error('Sign in error:', err);
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

export function requestPasswordReset(username, callback) {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  cognitoUser.forgotPassword({
    onSuccess: (result) => {
      console.log('Password reset request successful:', result);
      callback(null, result);
    },
    onFailure: (err) => {
      console.error('Password reset request error:', err);
      callback(err);
    },
  });
}

export function resetPassword(username, verificationCode, newPassword, callback) {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  cognitoUser.confirmPassword(verificationCode, newPassword, {
    onSuccess: (result) => {
      console.log('Password reset successful:', result);
      callback(null, result);
    },
    onFailure: (err) => {
      console.error('Password reset error:', err);
      callback(err);
    },
  });
}
