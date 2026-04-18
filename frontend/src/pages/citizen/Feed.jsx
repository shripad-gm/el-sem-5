import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import api from "../../api/axios";
import IssueCard from "../../components/IssueCard";
import Loader from "../../components/Loader";
import ScrollToTop from "../../components/ScrollToTop";
import "./Citizen.css";

const Feed = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFeed = useCallback(async () => {
    try {
      const { data } = await api.get("/issues/feed");
      setIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching feed:", error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (loading) return <Loader />;

  return (
    <div className="page-layout">
      <div className="feed-container">
        {issues.length > 0 && <div className="feed-header">Local Issues</div>}
        <div className="feed-list">
          {issues.length > 0 ? (
            issues.map((issue) => (
              <div 
                key={issue.id} 
                className="issue-card-wrapper"
                onClick={() => issue?.id && navigate(`/issues/${issue.id}`)}
              >
                <IssueCard
                  issue={issue}
                  showActions={false}
                  onRefresh={fetchFeed}
                />
              </div>
            ))
          ) : (
            <div className="empty-state" style={{
              marginTop: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1a365d',
                  marginBottom: '8px',
                  fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}>
                  No issues in your locality yet
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#4a5568',
                  margin: 0,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}>
                  Be the first to report one and help improve your community!
                </p>
              </div>
              <div style={{ width: '300px', height: '300px', margin: '120px auto 0' }}>
                <DotLottieReact
                  src="https://lottie.host/e39edb53-b9ac-4deb-b1f8-266dd1ddb51d/eJYZHPLSVP.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Feed;
