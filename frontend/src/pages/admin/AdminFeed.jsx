import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { FiMenu, FiX } from "react-icons/fi";
import "./AdminFeed.css";

const ADMIN_ISSUES_CACHE = "admin_issues_cache";
const ADMIN_TRENDING_CACHE = "admin_trending_cache";
const CACHE_TTL = 2 * 60 * 1000;

const AdminFeed = () => {
  const [issues, setIssues] = useState([]);
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSlaFilter, setActiveSlaFilter] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [, forceTick] = useState(0);

  const navigate = useNavigate();

  /* ---------- FETCH ---------- */

  const fetchAssigned = async (force = false) => {
    try {
      if (!force) {
        const cached = localStorage.getItem(ADMIN_ISSUES_CACHE);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setIssues(parsed.data);
            return;
          }
        }
      }

      const { data } = await api.get("/admin/issues");
      const normalized = Array.isArray(data) ? data : [];

      localStorage.setItem(
        ADMIN_ISSUES_CACHE,
        JSON.stringify({
          data: normalized,
          timestamp: Date.now()
        })
      );

      setIssues(normalized);
    } catch {
      setIssues([]);
    }
  };


  const fetchTrending = async (force = false) => {
    try {
      if (!force) {
        const cached = localStorage.getItem(ADMIN_TRENDING_CACHE);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setTrending(parsed.data);
            return;
          }
        }
      }

      const { data } = await api.get("/issues/explore");

      const openSorted = Array.isArray(data)
        ? data
            .filter(i => i.status === "OPEN")
            .sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0))
            .slice(0, 5)
        : [];

      localStorage.setItem(
        ADMIN_TRENDING_CACHE,
        JSON.stringify({
          data: openSorted,
          timestamp: Date.now()
        })
      );

      setTrending(openSorted);
    } catch {
      setTrending([]);
    }
  };

  useEffect(() => {
    fetchAssigned();
    fetchTrending();
  }, []);

  /* ---------- LIVE SLA UPDATE ---------- */

  useEffect(() => {
    const interval = setInterval(() => {
      forceTick(t => t + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  /* ---------- FILTERING ---------- */

  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.locality.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeStatus && issue.status !== activeStatus) return false;

    if (!activeSlaFilter) return true;

    const now = Date.now();
    const deadline = new Date(issue.slaDeadline).getTime();
    const msLeft = deadline - now;
    const hoursLeft = msLeft / 36e5;

    switch (activeSlaFilter) {
      case "EXPIRED":
        return msLeft <= 0;
      case "CRITICAL":
        return msLeft > 0 && hoursLeft < 6;
      case "WARNING":
        return hoursLeft >= 6 && hoursLeft < 24;
      case "MINE":
        return true;
      default:
        return true;
    }
  });

  /* ---------- MOBILE ---------- */

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`admin-layout ${isMobile ? "mobile-view" : ""}`}>
      {isMobile && (
        <button
          className="mobile-menu-button"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* SIDEBAR */}
      <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
        {showSidebar && (
          <button 
            className="sidebar-close-button"
            onClick={() => setShowSidebar(false)}
            aria-label="Close sidebar"
          >
            <FiX size={24} />
          </button>
        )}
        <AdminSidebar
          issues={issues}
          activeStatus={activeStatus}
          setActiveStatus={setActiveStatus}
        />
      </div>

      {/* MAIN */}
      <div className="admin-feed">
        <div className="admin-feed-header">
          <h1>Assigned Issues</h1>

          <div className="search-container">
            <input
              className="admin-search"
              placeholder="Search by title or locality"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="refresh-icon-btn"
              onClick={fetchAssigned}
              title="Refresh"
            >
              ↻
            </button>
          </div>
        </div>

        {/* SLA FILTERS */}
        <div className="admin-filters">
          {[
            { key: "EXPIRED", label: "Expired" },
            { key: "CRITICAL", label: "< 6 hrs" },
            { key: "WARNING", label: "< 24 hrs" },
            { key: "MINE", label: "My Issues" }
          ].map(f => (
            <button
              key={f.key}
              className={`sla-filter ${activeSlaFilter === f.key ? "active" : ""}`}
              onClick={() =>
                setActiveSlaFilter(activeSlaFilter === f.key ? null : f.key)
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="admin-issue-list">
          {filteredIssues.length === 0 && (
            <div className="admin-empty">No issues match filters</div>
          )}

          {filteredIssues.map(issue => {
            const created = new Date(issue.createdAt).getTime();
            const deadline = new Date(issue.slaDeadline).getTime();
            const now = Date.now();

            const total = deadline - created;
            const elapsed = Math.max(0, now - created);
            const remaining = Math.max(0, deadline - now);

            const progress =
              total > 0 ? Math.min(100, Math.floor((elapsed / total) * 100)) : 100;

            const expired = remaining <= 0;

            return (
              <div
                key={issue.id}
                className="admin-issue-card"
                onClick={() => navigate(`/admin/issues/${issue.id}`)}
              >
                <div className="admin-issue-main">
                  <div className="admin-issue-title">{issue.title}</div>
                  <div className="admin-issue-meta">
                    {issue.category} • {issue.locality}
                  </div>
                </div>

                <div className="admin-issue-right">
                  <div className={`admin-status ${issue.status.toLowerCase()}`}>
                    {issue.status}
                  </div>

                  {/* SLA BAR */}
                  <div className="admin-sla-bar">
                    <div className="sla-bar-track">
                      <div
                        className={`sla-bar-fill ${expired ? "expired" : ""}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="sla-bar-text">
                      {expired
                        ? "SLA EXPIRED"
                        : `${Math.floor(remaining / 36e5)}h ${Math.floor(
                            (remaining / 60000) % 60
                          )}m left`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TRENDING */}
      <aside className="admin-trending">
        <h3>High Priority (Open)</h3>

        {trending.map(issue => (
          <div
            key={issue.id}
            className="admin-trending-item"
            onClick={() => navigate(`/admin/issues/${issue.id}`)}
          >
            <div className="admin-trending-title">{issue.title}</div>
            <div className="admin-trending-meta">
              ↑ {issue.upvotes} • {issue.locality}
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
};

export default AdminFeed;
