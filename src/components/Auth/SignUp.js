// src/components/SignUp.js
import React, { useState } from 'react';
import { signUp } from '../../auth';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [profile, setProfile] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    signUp(username, password, email, givenName, familyName, profile, birthdate, (err, result) => {
      if (err) {
        console.error('Sign up error:', err);
        setError(err.message);
      } else {
        console.log('Sign up success:', result);
        setMessage('Sign up successful! Please check your email to confirm your account.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Sign Up</h2>
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
      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <label htmlFor="givenName">Given Name</label>
      <input
        type="text"
        id="givenName"
        placeholder="Given Name"
        value={givenName}
        onChange={(e) => setGivenName(e.target.value)}
        required
      />
      <label htmlFor="familyName">Family Name</label>
      <input
        type="text"
        id="familyName"
        placeholder="Family Name"
        value={familyName}
        onChange={(e) => setFamilyName(e.target.value)}
        required
      />
      <label htmlFor="profile">Profile</label>
      <input
        type="text"
        id="profile"
        placeholder="Profile"
        value={profile}
        onChange={(e) => setProfile(e.target.value)}
        required
      />
      <label htmlFor="birthdate">Birthdate</label>
      <input
        type="date"
        id="birthdate"
        placeholder="Birthdate"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignUp;
