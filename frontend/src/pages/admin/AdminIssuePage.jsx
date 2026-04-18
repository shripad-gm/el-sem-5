import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import "./AdminIssuePage.css";

/* 🔥 CHANGED: REJECTED REMOVED */
const STATUS_TRANSITIONS = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED_PENDING_USER"]
};

const STATUS_HELP = {
  OPEN: "Issue reported by citizen. No action taken yet.",
  IN_PROGRESS: "Work has started on this issue.",
  RESOLVED_PENDING_USER:
    "Issue resolved by admin. Awaiting citizen verification.",
  CLOSED: "Citizen confirmed resolution."
};

const AdminIssuePage = () => {
  const { issueId } = useParams();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [assigned, setAssigned] = useState(false);

  const [nextStatus, setNextStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [issuesRes, commentsRes, assignedRes] = await Promise.all([
        api.get("/issues/explore"),
        api.get(`/issues/${issueId}/comments`),
        api.get("/admin/issues")
      ]);

      const found = issuesRes.data.find(i => i.id === issueId);

      setIssue(found || null);
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      setAssigned(
        Array.isArray(assignedRes.data) &&
        assignedRes.data.some(i => i.id === issueId)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [issueId]);

  const handleStatusUpdate = async () => {
    if (!nextStatus || !remarks.trim()) return;

    try {
      setUpdating(true);

      await api.patch(`/admin/issues/${issueId}/status`, {
        status: nextStatus,
        remarks: remarks.trim()
      });

      if (
        nextStatus === "RESOLVED_PENDING_USER" &&
        files.length > 0
      ) {
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file);

          await api.post(
            `/admin/issues/${issueId}/proof`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
        }
      }

      setNextStatus("");
      setRemarks("");
      setFiles([]);

      await fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || updating) return <Loader />;
  if (!issue) return <div className="ai-page">Issue not found</div>;

  const allowedStatuses = STATUS_TRANSITIONS[issue.status] || [];

  return (
    <div className="ai-page">
      <section className="ai-main">

        <div className="ai-header">
          <h1 className="ai-title">{issue.title}</h1>
          <span className={`ai-status ai-${issue.status.toLowerCase()}`}>
            {issue.status}
          </span>
        </div>

        <div className="ai-meta">
          <span>{issue.category}</span>
          <span>•</span>
          <span>{issue.department}</span>
          <span>•</span>
          <span>{issue.locality}</span>
        </div>

        <div className="ai-date">
          {STATUS_HELP[issue.status]}
        </div>

        <p className="ai-description">{issue.description}</p>

        {issue.media?.length > 0 ? (
          <div className="ai-media">
            {issue.media.map((m, i) => (
              <img key={i} src={m.url} alt="evidence" />
            ))}
          </div>
        ) : (
          <div className="ai-no-media">No image has been provided</div>
        )}

        {assigned ? (
          allowedStatuses.length > 0 && (
            <div className="ai-admin-update">
              <h3>Update Issue Status</h3>

              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
              >
                <option value="">Select next status</option>
                {allowedStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <textarea
                placeholder="Mandatory remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              {files.length > 0 && (
                <div className="ai-admin-preview">
                  {files.map((file, idx) => (
                    <div key={idx} className="ai-preview-item">
                      <img src={URL.createObjectURL(file)} alt="preview" />
                      <button
                        type="button"
                        className="ai-remove-image"
                        onClick={() =>
                          setFiles(files.filter((_, i) => i !== idx))
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="ai-file-upload">
                Upload resolution images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setFiles(Array.from(e.target.files))
                  }
                />
              </label>

              <button
                disabled={!nextStatus || !remarks.trim()}
                onClick={handleStatusUpdate}
              >
                Submit Update
              </button>
            </div>
          )
        ) : (
          <div className="ai-admin-lock">
            You are not assigned to this issue
          </div>
        )}
      </section>

      <aside className="ai-sidebar">
        <div className="ai-stat-card">
          <span>Upvotes</span>
          <strong>{issue.upvotes ?? 0}</strong>
        </div>

        <div className="ai-comments">
          <h3>Comments ({comments.length})</h3>

          {comments.length === 0 && (
            <div className="ai-empty">No comments yet</div>
          )}

          {comments.map(c => (
            <div key={c.id} className="ai-comment">
              <div className="ai-comment-avatar">
                {c.user?.fullName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="ai-comment-author">
                  {c.user?.fullName}
                </div>
                <div className="ai-comment-text">
                  {c.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default AdminIssuePage;
