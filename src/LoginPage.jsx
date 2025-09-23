import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@local');
  const [password, setPassword] = useState('changeme');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      // router will redirect away if route guard is set
      window.location.href = '/';
    } catch (e) {
      setErr('Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>Admin Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        {err && <div style={{ color: 'tomato' }}>{err}</div>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
