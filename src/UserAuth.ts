import React, { useState } from 'react';

const API_BASE = "http://localhost:8000"; // adjust if your backend runs on another port

export default function UserAuth() {
  const [form, setForm] = useState({ name: '', password: '', newname: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const request = async (method, path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    setMessage(text);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>User Account Controls</h2>

      <input name="name" placeholder="Username" onChange={handleChange} /><br />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br />
      <input name="newname" placeholder="New Username (for update only)" onChange={handleChange} /><br /><br />

      <button onClick={() => request('POST', '/user', { name: form.name, password: form.password })}>Register</button>
      <button onClick={() => request('POST', '/login', { name: form.name, password: form.password })}>Login</button>
      <button onClick={() => request('PATCH', '/user', { name: form.name, newname: form.newname })}>Update Username</button>
      <button onClick={() => request('PATCH', '/password', { username: form.name, password: form.password })}>Update Password</button>
      <button onClick={() => request('DELETE', '/user', { username: form.name })}>Delete Account</button>

      <p><strong>Server Response:</strong> {message}</p>
    </div>
  );
}