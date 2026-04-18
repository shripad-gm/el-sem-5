import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [geo, setGeo] = useState({
    cities: [],
    zones: [],
    localities: [],
  });

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    profilePhotoUrl: "",
    cityId: "",
    zoneId: "",
    localityId: "",
  });

  /* ---------------- LOAD USER + CITIES ---------------- */

  useEffect(() => {
    const init = async () => {
      try {
        const [{ data: user }, { data: cities }] = await Promise.all([
          api.get("/users/me"),
          api.get("/geo/cities"),
        ]);

        setForm({
          fullName: user.fullName || "",
          bio: user.bio || "",
          profilePhotoUrl: user.profilePhotoUrl || "",
          cityId: user.city?.id || "",
          zoneId: user.zone?.id || "",
          localityId: user.locality?.id || "",
        });

        setGeo((g) => ({ ...g, cities }));

        // preload zones + localities if already selected
        if (user.city?.id) {
          const { data: zones } = await api.get(
            `/geo/zones?cityId=${user.city.id}`
          );
          setGeo((g) => ({ ...g, zones }));
        }

        if (user.zone?.id) {
          const { data: localities } = await api.get(
            `/geo/localities?zoneId=${user.zone.id}`
          );
          setGeo((g) => ({ ...g, localities }));
        }
      } catch {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ---------------- LOCATION HANDLERS ---------------- */

  const handleCity = async (cityId) => {
    setForm((f) => ({
      ...f,
      cityId,
      zoneId: "",
      localityId: "",
    }));

    const { data } = await api.get(`/geo/zones?cityId=${cityId}`);
    setGeo((g) => ({ ...g, zones: data, localities: [] }));
  };

  const handleZone = async (zoneId) => {
    setForm((f) => ({
      ...f,
      zoneId,
      localityId: "",
    }));

    const { data } = await api.get(`/geo/localities?zoneId=${zoneId}`);
    setGeo((g) => ({ ...g, localities: data }));
  };

  /* ---------------- SAVE ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.patch("/users/me", {
        fullName: form.fullName,
        bio: form.bio,
        profilePhotoUrl: form.profilePhotoUrl,
        cityId: form.cityId,
        zoneId: form.zoneId,
        localityId: form.localityId,
      });

      navigate("/profile");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="edit-page">
      <div className="edit-container">
        <form className="edit-card" onSubmit={handleSubmit}>
          <h1>Edit profile</h1>

          {error && <div className="edit-error">{error}</div>}

          <div className="edit-field">
            <label>Full name</label>
            <input
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              required
            />
          </div>

          <div className="edit-field">
            <label>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm({ ...form, bio: e.target.value })
              }
              placeholder="Tell people about yourself"
            />
          </div>

          <div className="edit-field">
            <label>Profile photo URL</label>
            <input
              value={form.profilePhotoUrl}
              onChange={(e) =>
                setForm({
                  ...form,
                  profilePhotoUrl: e.target.value,
                })
              }
              placeholder="https://..."
            />
          </div>

          <div className="edit-field">
            <label>City</label>
            <select
              className="edit-select"
              required
              value={form.cityId}
              onChange={(e) => handleCity(e.target.value)}
            >
              <option value="">Select city</option>
              {geo.cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="edit-field">
            <label>Zone</label>
            <select
              className="edit-select"
              required
              value={form.zoneId}
              onChange={(e) => handleZone(e.target.value)}
              disabled={!form.cityId}
            >
              <option value="">Select zone</option>
              {geo.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="edit-field">
            <label>Locality</label>
            <select
              className="edit-select"
              required
              value={form.localityId}
              onChange={(e) =>
                setForm({ ...form, localityId: e.target.value })
              }
              disabled={!form.zoneId}
            >
              <option value="">Select locality</option>
              {geo.localities.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>


          <div className="edit-actions">
            <button
              type="button"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-save"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
