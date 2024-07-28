import React from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';
import awsConfig from '../../aws-config';

const SignOut = ({ setIsAuthenticated, clearTasks }) => {
  const handleSignOut = () => {
    const userPool = new CognitoUserPool({
      UserPoolId: awsConfig.UserPoolId,
      ClientId: awsConfig.ClientId,
    });

    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      AWS.config.credentials.clearCachedId();
      AWS.config.credentials = null;

      setIsAuthenticated(false);
      clearTasks();
    }
  };

  return (
    <button onClick={handleSignOut}>Sign Out</button>
  );
};

export default SignOut;
