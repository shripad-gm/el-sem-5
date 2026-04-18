import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/login", form);
      const { data } = await api.get("/users/me");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/explore");
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img 
          src="/logo-without-text.png" 
          alt="CivicSense Logo" 
          className="login-logo"
        />
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your CivicSense account</p>
      </div>
      
      <div className="login-card">

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
                placeholder="Email address"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-label-container">
              <label htmlFor="password" className="form-label">Password</label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="form-input"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="signup-prompt">
          Don't have an account?{' '}
          <Link to="/signup" className="signup-link">Join now</Link>
        </div>
      </div>

      <div className="footer">
        <p>© {new Date().getFullYear()} CivicSense. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
