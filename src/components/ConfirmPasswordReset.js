// src/components/ConfirmPasswordReset.js
import React, { useState } from 'react';
import { resetPassword } from '../auth';

const ConfirmPasswordReset = ({ email }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    resetPassword(email, verificationCode, newPassword, (err, result) => {
      if (err) {
        console.error('Password reset error:', err);
        setError(err.message);
      } else {
        console.log('Password reset success:', result);
        setMessage('Password reset successful! You can now sign in with your new password.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Reset Password</h2>
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
      <label htmlFor="verificationCode">Verification Code</label>
      <input
        type="text"
        id="verificationCode"
        placeholder="Verification Code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        required
      />
      <label htmlFor="newPassword">New Password</label>
      <input
        type="password"
        id="newPassword"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
};

export default ConfirmPasswordReset;
