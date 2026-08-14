import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      await register(username, email, password, confirmPassword);
      navigate('/app');
    } catch (err) {
      setError(
        err.response?.data?.password?.[0] || 
        err.response?.data?.email?.[0] || 
        err.response?.data?.username?.[0] || 
        'Registration failed'
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Register Account</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
            Register
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
