// src/components/SignOut.js
import React from 'react';
import { signOut } from '../auth';

function SignOut({ setIsAuthenticated }) {
  const handleSignOut = () => {
    signOut();
    setIsAuthenticated(false);
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}

export default SignOut;
