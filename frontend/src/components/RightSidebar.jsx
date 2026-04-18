import { useEffect, useState } from "react";
import api from "../api/axios";
import "./RightSidebar.css";

const REFRESH_INTERVAL = 15000; // 15 seconds (safe + responsive)

const RightSidebar = () => {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetchTrending();

    // ✅ auto-refresh trending (LinkedIn-style)
    const interval = setInterval(fetchTrending, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const fetchTrending = async () => {
    try {
      const { data } = await api.get("/issues/explore");

      const sorted = Array.isArray(data)
        ? data
            .map((i) => ({
              id: i.id,
              title: i.title,
              upvotes: i.upvotes ?? 0, // ✅ correct field
            }))
            .sort((a, b) => b.upvotes - a.upvotes)
            .slice(0, 5)
        : [];

      setTrending(sorted);
    } catch {
      setTrending([]);
    }
  };

  return (
    <aside className="right-sidebar">

      {/* TRENDING */}
      <div className="right-card">
        <div className="right-card-header">
          Trending Issues
        </div>

        <ul className="trending-list">
          {trending.length === 0 && (
            <li className="trending-muted">No trends yet</li>
          )}

          {trending.map((item, idx) => (
            <li key={item.id} className="trending-item">
              <span className="trending-rank">{idx + 1}</span>

              <div className="trending-body">
                <p className="trending-title">{item.title}</p>
                <p className="trending-meta">
                  {item.upvotes} upvotes
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* AD */}
      <div className="right-card">
        <div className="right-card-header">
          Sponsored
        </div>

        <div className="ad-box">
          <p className="ad-title">
            Improve civic response ROI
          </p>
          <p className="ad-text">
            Deploy smarter monitoring systems for faster resolution.
          </p>
          <button className="ad-cta">
            Learn more
          </button>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
