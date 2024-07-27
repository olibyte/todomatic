// src/components/RequestPasswordReset.js
import React, { useState } from 'react';
import { requestPasswordReset } from '../auth';

const RequestPasswordReset = ({ setShowResetForm }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    requestPasswordReset(username, (err, result) => {
      if (err) {
        console.error('Password reset request error:', err);
        setError(err.message);
      } else {
        console.log('Password reset request success:', result);
        setMessage('Verification code sent to your email.');
        setShowResetForm(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Request Password Reset</h2>
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
      <label htmlFor="username">Username</label>
      <input
        type="text"
        id="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <button type="submit">Send Verification Code</button>
    </form>
  );
};

export default RequestPasswordReset;
