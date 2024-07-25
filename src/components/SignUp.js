// src/components/SignUp.js
import React, { useState } from 'react';
import { signUp } from '../auth';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [profile, setProfile] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    signUp(username, password, email, givenName, familyName, profile, birthdate, (err, result) => {
      if (err) {
        setError(err.message);
      } else {
        alert('Sign up successful! Please check your email to confirm your account.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {error && <p>{error}</p>}
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="text" placeholder="Given Name" value={givenName} onChange={(e) => setGivenName(e.target.value)} required />
      <input type="text" placeholder="Family Name" value={familyName} onChange={(e) => setFamilyName(e.target.value)} required />
      <input type="text" placeholder="Profile" value={profile} onChange={(e) => setProfile(e.target.value)} required />
      <input type="date" placeholder="Birthdate" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignUp;
