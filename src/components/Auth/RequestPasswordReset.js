// src/components/RequestPasswordReset.js
import React, { useState } from 'react';
import { requestPasswordReset } from '../../auth';

const RequestPasswordReset = ({ setShowResetForm, setEmail }) => {
  const [email, setEmailLocal] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmail(email); // Pass email to parent component
    requestPasswordReset(email, (err, result) => {
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
      <h2>Forgot Username or Password?</h2>
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmailLocal(e.target.value)}
        required
      />
      <button type="submit">Send Verification Code</button>
    </form>
  );
};

export default RequestPasswordReset;
