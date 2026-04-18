import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();

  const [geo, setGeo] = useState({ cities: [], zones: [], localities: [] });
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    cityId: "",
    zoneId: "",
    localityId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/geo/cities").then((res) =>
      setGeo((g) => ({ ...g, cities: res.data }))
    );
  }, []);

  const handleCity = async (id) => {
    setForm({ ...form, cityId: id, zoneId: "", localityId: "" });
    const { data } = await api.get(`/geo/zones?cityId=${id}`);
    setGeo((g) => ({ ...g, zones: data, localities: [] }));
  };

  const handleZone = async (id) => {
    setForm({ ...form, zoneId: id, localityId: "" });
    const { data } = await api.get(`/geo/localities?zoneId=${id}`);
    setGeo((g) => ({ ...g, localities: data }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/signup", form);
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create an account. Please try again.';
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <img 
          src="/logo-without-text.png" 
          alt="CivicSense Logo" 
          className="signup-logo"
        />
        <h1 className="signup-title">Join CivicSense</h1>
        <p className="signup-subtitle">Create your account to get started</p>
      </div>
      
      <div className="signup-card">

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User className="input-icon" size={20} />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="form-input"
                placeholder="Your full name"
              />
            </div>
          </div>

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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="form-label">Password</label>
              <span className="password-helper">Min. 6 characters</span>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="form-input"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="city" className="form-label">City</label>
            <select
              id="city"
              required
              value={form.cityId}
              onChange={(e) => handleCity(e.target.value)}
              className="form-select"
            >
              <option value="">Select city</option>
              {geo.cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="zone" className="form-label">Zone</label>
            <select
              id="zone"
              required
              value={form.zoneId}
              onChange={(e) => handleZone(e.target.value)}
              disabled={!form.cityId}
              className="form-select"
            >
              <option value="">Select zone</option>
              {geo.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="locality" className="form-label">Locality</label>
            <select
              id="locality"
              required
              value={form.localityId}
              onChange={(e) => setForm({ ...form, localityId: e.target.value })}
              disabled={!form.zoneId}
              className="form-select"
            >
              <option value="">Select locality</option>
              {geo.localities.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="signup-button"
          >
            {loading ? 'Creating account...' : 'Agree & Join'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="login-prompt">
          Already on CivicSense?{' '}
          <Link to="/login" className="login-link">Sign in</Link>
        </div>
      </div>

      <div className="footer">
        <p>© {new Date().getFullYear()} CivicSense. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Signup;
