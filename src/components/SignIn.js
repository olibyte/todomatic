// src/components/SignIn.js
import React, { useState } from 'react';
import { signIn } from '../auth';

function SignIn({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(username, password, (err, result) => {
      if (err) {
        console.error('Sign in error:', err);
        setError(err.message);
      } else {
        console.log('Sign in success:', result);
        setIsAuthenticated(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign In</h2>
      {error && <p>{error}</p>}
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Sign In</button>
    </form>
  );
}

export default SignIn;
