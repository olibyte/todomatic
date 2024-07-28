// src/components/Main/App.js
import React, { useState, useEffect } from 'react';
import SignIn from '../Auth/SignIn';
import SignUp from '../Auth/SignUp';
import SignOut from '../Auth/SignOut';
import RequestPasswordReset from '../Auth/RequestPasswordReset';
import ConfirmPasswordReset from '../Auth/ConfirmPasswordReset';
import Header from './Header';
import TodoList from '../Todo/TodoList';
import awsConfig from '../../aws-config';
import AWS from 'aws-sdk';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import '../../App.css';

AWS.config.update({ region: awsConfig.Region });

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formType, setFormType] = useState('signIn');
  const [email, setEmail] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
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
        setIsAuthenticated(true);
      });
    }
  }, []);

  function clearTasks() {
    setTasks([]);
  }

  return (
    <div className="app-container">
      <Header />
      {!isAuthenticated ? (
        <div className="auth-container">
          {formType === 'signIn' && <SignIn setIsAuthenticated={setIsAuthenticated} />}
          {formType === 'signUp' && <SignUp />}
          {formType === 'requestPasswordReset' && <RequestPasswordReset setShowResetForm={setFormType} setEmail={setEmail} />}
          {formType === 'confirmPasswordReset' && <ConfirmPasswordReset email={email} />}
          <div className="form-switch">
            {formType !== 'signIn' && <button onClick={() => setFormType('signIn')}>Sign In</button>}
            {formType !== 'signUp' && <button onClick={() => setFormType('signUp')}>Sign Up</button>}
            {formType !== 'requestPasswordReset' && <button onClick={() => setFormType('requestPasswordReset')}>Forgot Password</button>}
          </div>
        </div>
      ) : (
        <div>
          <SignOut setIsAuthenticated={setIsAuthenticated} clearTasks={clearTasks} />
          <TodoList tasks={tasks} setTasks={setTasks} />
        </div>
      )}
    </div>
  );
}

export default App;
