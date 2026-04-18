import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import CommentsSection from "../../components/CommentsSection";
import "./CitizenIssuePage.css";

const CitizenIssuePage = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feedback, setFeedback] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [issueRes, commentRes] = await Promise.all([
          api.get("/issues/explore"),
          api.get(`/issues/${issueId}/comments`)
        ]);

        const found = issueRes.data.find(i => i.id === issueId);
        setIssue(found || null);
        setComments(commentRes.data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [issueId]);

  const verifyIssue = async () => {
    if (!feedback.trim()) return;

    try {
      setVerifying(true);
      await api.post(`/issues/${issueId}/verify`, { feedback });
      navigate("/profile");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <Loader />;
  if (!issue) return <div className="issue-page">Issue not found</div>;

return (
  <div className="ci-page">
    <div className="ci-container">
      {/* Back button at the top */}
      <div className="ci-page-header">
        <button className="ci-back-btn" onClick={() => navigate('/explore')}>
          <FaArrowLeft /> Back to Explore
        </button>
      </div>

      <div className="ci-main">
        <div className="ci-header">
          <h1 className="ci-title">{issue.title}</h1>
          <span className={`ci-status ci-${issue.status.toLowerCase()}`}>
            {issue.status.replaceAll("_", " ")}
          </span>
        </div>

        <div className="ci-meta">
          {issue.category} • {issue.department} • {issue.locality}
        </div>

        <p className="ci-description">{issue.description}</p>

        {issue.media?.length > 0 ? (
          <div className="ci-media">
            {issue.media.map((m, i) => (
              <img key={i} src={m.url} alt="" />
            ))}
          </div>
        ) : (
          <div className="ci-no-media">No images provided</div>
        )}

        {issue.status === "RESOLVED_PENDING_USER" && (
          <div className="ci-verify">
            <h3>Verify Resolution</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Was the issue resolved properly?"
            />
            <button disabled={verifying} onClick={verifyIssue}>
              {verifying ? "Submitting..." : "Confirm Resolution"}
            </button>
          </div>
        )}
      </div>

      <aside className="ci-sidebar">
        <div className="ci-stat">
          <strong>{issue.upvotes}</strong>
          <span>Upvotes</span>
        </div>

        <CommentsSection
          issueId={issueId}
          comments={comments}
          setComments={setComments}
        />
      </aside>

    </div>
  </div>
);
};
export default CitizenIssuePage;
