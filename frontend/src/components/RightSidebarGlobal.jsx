import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./RightSidebarGlobal.css";

const MAX_ITEMS = 6;

const RightSidebarGlobal = () => {
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState([]);
  const [closed, setClosed] = useState([]);

  useEffect(() => {
    fetchGlobalIssues();
  }, []);

  const fetchGlobalIssues = async () => {
    try {
      const { data } = await api.get("/issues/explore");
      if (!Array.isArray(data)) return;

      /* ---------- IN PROGRESS (highest upvotes) ---------- */
      const progressIssues = data
        .filter((i) => i.status === "IN_PROGRESS")
        .sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0))
        .slice(0, MAX_ITEMS);

      /* ---------- CLOSED (latest first) ---------- */
      const closedIssues = data
        .filter((i) => i.status === "CLOSED")
        .sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, MAX_ITEMS);

      setInProgress(progressIssues);
      setClosed(closedIssues);
    } catch {
      setInProgress([]);
      setClosed([]);
    }
  };

  return (
    <aside className="right-global-sidebar">

      {/* IN PROGRESS */}
      <div className="right-card">
        <h4 className="right-card-title">
          Ongoing Issues
        </h4>

        {inProgress.length === 0 ? (
          <p className="right-empty">No ongoing issues</p>
        ) : (
          inProgress.map((issue) => (
            <div
              key={issue.id}
              className="right-issue-item"
              onClick={() => navigate(`/explore#${issue.id}`)}
            >
              <p className="right-issue-title">
                {issue.title}
              </p>
              <p className="right-issue-meta">
                ↑ {issue.upvotes ?? 0} • {issue.locality}
              </p>
            </div>
          ))
        )}
      </div>

      {/* CLOSED */}
      <div className="right-card">
        <h4 className="right-card-title">
          Recently Closed
        </h4>

        {closed.length === 0 ? (
          <p className="right-empty">No closed issues</p>
        ) : (
          closed.map((issue) => (
            <div
              key={issue.id}
              className="right-issue-item"
              onClick={() => navigate(`/explore#${issue.id}`)}
            >
              <p className="right-issue-title">
                {issue.title}
              </p>
              <p className="right-issue-meta">
                {new Date(issue.createdAt).toLocaleDateString()} • {issue.locality}
              </p>
            </div>
          ))
        )}
      </div>

    </aside>
  );
};

export default RightSidebarGlobal;
