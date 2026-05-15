import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/login', credentials);
      if (response.data.success) {
        onLogin(response.data.user);
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', backgroundColor: '#f0f2f5' 
    }}>
      <div style={{ 
        background: 'white', padding: '40px', borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' 
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '5px' }}>🏥 Building Manager</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Engineer Portal</p>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              placeholder="Enter your username"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              placeholder="Enter your password"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '12px', backgroundColor: '#0056b3', color: 'white', 
              border: 'none', borderRadius: '5px', cursor: 'pointer', 
              fontWeight: 'bold', fontSize: '16px' 
            }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}