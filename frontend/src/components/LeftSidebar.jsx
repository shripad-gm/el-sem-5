import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./LeftSidebar.css";

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED_PENDING_USER",
  "CLOSED",
];

const CACHE_KEY = "my_issues_sidebar";

const LeftSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myIssues, setMyIssues] = useState({
    OPEN: [],
    IN_PROGRESS: [],
    RESOLVED_PENDING_USER: [],
    CLOSED: [],
  });

  const [hasMore, setHasMore] = useState({
    OPEN: false,
    IN_PROGRESS: false,
    RESOLVED_PENDING_USER: false,
    CLOSED: false,
  });

  /* ---------------- LOAD FROM CACHE FIRST ---------------- */

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      setMyIssues(parsed.myIssues);
      setHasMore(parsed.hasMore);
    }
  }, []);

  /* ---------------- FETCH FROM API ---------------- */

  useEffect(() => {
    if (!user) return;

    const fetchMyIssues = async () => {
      try {
        const { data } = await api.get("/issues/explore");

        const mine = Array.isArray(data)
          ? data.filter((i) => i.postedBy?.id === user.id)
          : [];

        const grouped = {
          OPEN: [],
          IN_PROGRESS: [],
          RESOLVED_PENDING_USER: [],
          CLOSED: [],
        };

        mine.forEach((issue) => {
          if (grouped[issue.status]) {
            grouped[issue.status].push(issue);
          }
        });

        const limited = {};
        const more = {};

        STATUSES.forEach((status) => {
          const sorted = grouped[status].sort(
            (a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0)
          );

          limited[status] = sorted.slice(0, 3);
          more[status] = sorted.length > 3;
        });

        setMyIssues(limited);
        setHasMore(more);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            myIssues: limited,
            hasMore: more,
          })
        );
      } catch {
        // Sidebar must NEVER break the app
      }
    };

    fetchMyIssues();
  }, [user]);

  if (!user) return null;

  return (
    <aside className="left-sidebar">

      {/* PROFILE CARD */}
      <div className="sidebar-card">
        <div className="sidebar-cover" />
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="Profile" />
            ) : (
              <span>{user.fullName?.[0]?.toUpperCase()}</span>
            )}
          </div>

          <h3 className="sidebar-name">{user.fullName}</h3>
          <p className="sidebar-email">{user.email}</p>
          <p className="sidebar-location">
            {user.locality?.name}, {user.city?.name}
          </p>
        </div>
      </div>

      {/* MY ISSUES */}
      <div className="sidebar-card sidebar-myissues">
        <h4 className="sidebar-section-title">My Issues</h4>

        {STATUSES.map((status) => (
          <div key={status} className="sidebar-issue-group">

            <div className="sidebar-issue-status">
              {status.replaceAll("_", " ")}
            </div>

            {myIssues[status].length === 0 ? (
              <div className="sidebar-empty">No issues</div>
            ) : (
              myIssues[status].map((issue) => (
                <div
                  key={issue.id}
                  className="sidebar-issue-item"
                  onClick={() =>
                    navigate(`/issues/${issue.id}`)
                  }
                >
                  <span className="sidebar-issue-title">
                    {issue.title}
                  </span>
                  <span className="sidebar-issue-upvotes">
                    ↑ {issue.upvotes ?? 0}
                  </span>
                </div>
              ))
            )}

            {hasMore[status] && (
              <div
                className="sidebar-view-more"
                onClick={() =>
                  navigate(`/profile?status=${status}`)
                }
              >
                View more →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SHORTCUTS */}
      <div className="sidebar-card sidebar-links">
        <button onClick={() => navigate("/profile")}>
          Profile
        </button>
        <button disabled>Saved items</button>
        <button disabled>Settings</button>
      </div>

    </aside>
  );
};

export default LeftSidebar;
