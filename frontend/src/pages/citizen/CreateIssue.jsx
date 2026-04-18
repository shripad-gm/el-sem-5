import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { categorizePost } from "../../utils/gemini";
import LoadingModal from '../../components/LoadingModal';
import "./CreateIssue.css";

const CreateIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    cityId: "",
    zoneId: "",
    localityId: "",
  });

  const [files, setFiles] = useState([]); // ✅ FIXED
  const [loading, setLoading] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [localities, setLocalities] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchInitialData();
  }, [user, navigate]);

  // No early return - we'll render the modal alongside the form

  const fetchInitialData = async () => {
    try {
      const [catRes, cityRes] = await Promise.all([
        api.get("/issues/categories", { withCredentials: true }),
        api.get("/geo/cities", { withCredentials: true }),
      ]);
      setCategories(catRes.data);
      setCities(cityRes.data);
    } catch {
      setError("Failed to load initial data");
    }
  };

  const fetchZones = async (cityId) => {
    const { data } = await api.get(`/geo/zones?cityId=${cityId}`, {
      withCredentials: true,
    });
    setZones(data);
    setLocalities([]);
  };

  const fetchLocalities = async (zoneId) => {
    const { data } = await api.get(`/geo/localities?zoneId=${zoneId}`, {
      withCredentials: true,
    });
    setLocalities(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.localityId) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/issues",
        {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          localityId: formData.localityId,
        },
        { withCredentials: true }
      );

      const issueId = res.data?.issueId;
      if (!issueId) throw new Error("Issue ID missing");

      // ✅ MULTI FILE UPLOAD
      for (const file of files) {
        const media = new FormData();
        media.append("file", file);

        await api.post(`/issues/${issueId}/media`, media, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/feed");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Issue creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingModal isOpen={loading} message="Submitting your post..." />
      <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Report an Issue</h2>
          <button type="button" className="close-button" onClick={() => navigate('/feed')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="form-group" style={{color: '#b91c1c', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px'}}>{error}</div>}

          <form className="create-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Issue Title</label>
              <input
                id="title"
                type="text"
                className="input-field"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter issue title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="textarea-field"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={5}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <div className="category-select-wrapper">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    id="category"
                    className="select-field"
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.description.trim()) {
                        setError('Please enter a description first');
                        return;
                      }
                      try {
                        setIsCategorizing(true);
                        setError('');
                        console.log('Starting categorization for:', formData.description);
                        const categoryName = await categorizePost(formData.description);
                        console.log('Gemini returned category:', categoryName);
                        console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
                        
                        const category = categories.find(
                          (c) => c.name.toLowerCase() === categoryName.toLowerCase()
                        );
                        console.log('Found category match:', category);
                        
                        if (category) {
                          console.log('Setting categoryId to:', category.id);
                          setFormData({ ...formData, categoryId: category.id });
                        } else {
                          console.error('No matching category found for:', categoryName);
                          setError('Could not determine category. Please select manually.');
                        }
                      } catch (err) {
                        console.error('Auto-categorization failed:', err);
                        setError(err.message || 'Failed to auto-categorize. Please select manually.');
                      } finally {
                        setIsCategorizing(false);
                      }
                    }}
                    disabled={isCategorizing || !formData.description.trim()}
                    style={{
                      padding: '0 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: isCategorizing || !formData.description.trim() ? 0.7 : 1,
                      pointerEvents: isCategorizing || !formData.description.trim() ? 'none' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '120px'
                    }}
                    title={!formData.description.trim() ? 'Please enter a description first' : 'Auto-categorize based on description'}
                  >
                    {isCategorizing ? (
                      <>
                        <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></span>
                        Categorizing...
                      </>
                    ) : (
                      'Auto Categorize'
                    )}
                  </button>
                </div>
                <span className="select-arrow">
                  <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H11L7.5 10.5L4 6Z" fill="currentColor"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <div className="category-select-wrapper">
                <select
                  id="city"
                  className="select-field"
                  required
                  value={formData.cityId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      cityId: e.target.value,
                      zoneId: "",
                      localityId: "",
                    });
                    fetchZones(e.target.value);
                  }}
                >
                  <option value="">Select city</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">
                  <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H11L7.5 10.5L4 6Z" fill="currentColor"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="zone">Zone</label>
              <div className="category-select-wrapper">
                <select
                  id="zone"
                  className="select-field"
                  required
                  value={formData.zoneId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      zoneId: e.target.value,
                      localityId: "",
                    });
                    fetchLocalities(e.target.value);
                  }}
                  disabled={!formData.cityId}
                >
                  <option value="">Select zone</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">
                  <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H11L7.5 10.5L4 6Z" fill="currentColor"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="locality">Locality</label>
              <div className="category-select-wrapper">
                <select
                  id="locality"
                  className="select-field"
                  required
                  value={formData.localityId}
                  onChange={(e) =>
                    setFormData({ ...formData, localityId: e.target.value })
                  }
                >
                  <option value="">Select locality</option>
                  {localities.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">
                  <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H11L7.5 10.5L4 6Z" fill="currentColor"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Images (Max 5)</label>
              <label className="file-upload">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  disabled={files.length >= 5}
                  style={{ display: 'none' }}
                />
                <div className="file-upload-content">
                  <svg className="file-upload-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span className="file-upload-text">Click to upload or drag and drop</span>
                  <span className="file-upload-hint">PNG, JPG, GIF up to 5MB</span>
                </div>
              </label>
              
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {files.map((file, index) => (
                  <div key={index} className="image-preview">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
              {files.length > 0 && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button
                type="submit"
                className="btn btn-submit"
                disabled={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Issue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default CreateIssue;
