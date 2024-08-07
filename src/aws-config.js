import AWS from 'aws-sdk';

const awsConfig = {
  Region: process.env.REACT_APP_REGION,
  UserPoolId: process.env.REACT_APP_USER_POOL_ID,
  ClientId: process.env.REACT_APP_CLIENT_ID,
  IdentityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
};

AWS.config.update({
  region: awsConfig.Region,
});

export default awsConfig;
