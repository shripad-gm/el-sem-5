import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import CommentsSection from "./CommentsSection";
import {
  FaThumbsUp,
  FaRegThumbsUp,
  FaRegComment,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import "./IssueCard.css";

const IssueCard = ({ issue }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [upvoteCount, setUpvoteCount] = useState(issue.upvotes ?? 0);
  const [commentCount, setCommentCount] = useState(issue.comments ?? 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const mediaList = Array.isArray(issue.media) ? issue.media : [];
  const totalMedia = mediaList.length;
  const [activeMedia, setActiveMedia] = useState(0);

  useEffect(() => {
    setUpvoteCount(issue.upvotes ?? 0);
    setCommentCount(issue.comments ?? 0);
    setActiveMedia(0);
  }, [issue.upvotes, issue.comments, totalMedia]);

  /* ---------------- ROUTE DECISION ---------------- */

  const handleCardClick = () => {
    if (user?.isAdmin) {
      navigate(`/admin/issues/${issue.id}`);
    } else {
      navigate(`/issues/${issue.id}`);
    }
  };

  /* ---------------- COMMENTS ---------------- */

  const prefetchComments = async () => {
    if (commentsLoaded) return;
    const { data } = await api.get(`/issues/${issue.id}/comments`);
    setComments(Array.isArray(data) ? data : []);
    setCommentCount(data?.length ?? 0);
    setCommentsLoaded(true);
  };

  /* ---------------- UPVOTE ---------------- */

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (upvoteLoading) return;

    try {
      setUpvoteLoading(true);
      await api.post(`/issues/${issue.id}/upvote`);
      setHasUpvoted((p) => !p);
      setUpvoteCount((p) => (hasUpvoted ? Math.max(p - 1, 0) : p + 1));
    } finally {
      setUpvoteLoading(false);
    }
  };

  /* ---------------- MEDIA ---------------- */

  const nextMedia = (e) => {
    e.stopPropagation();
    setActiveMedia((p) => (p + 1) % totalMedia);
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    setActiveMedia((p) => (p - 1 + totalMedia) % totalMedia);
  };

  return (
    <div className="issue-card" onClick={handleCardClick}>

      {/* HEADER */}
      <div className="issue-header">
        <div className="issue-avatar">
          {issue.postedBy?.avatar ? (
            <img src={issue.postedBy.avatar} alt="" />
          ) : (
            <span>{issue.postedBy?.name?.[0]}</span>
          )}
        </div>

        <div className="issue-meta">
          <div className="issue-author">{issue.postedBy?.name}</div>
          <div className="issue-submeta">
            {issue.locality} • {new Date(issue.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className={`issue-status status-${issue.status.toLowerCase()}`}>
          {issue.status.replaceAll("_", " ")}
        </div>
      </div>

      {/* CONTENT */}
      <div className="issue-content">
        <p className="issue-title">{issue.title}</p>
        <div className="issue-tags">
          {issue.category} • {issue.department} • {issue.locality}
        </div>
        {issue.description && (
          <p className="issue-description">{issue.description}</p>
        )}
      </div>

      {/* MEDIA */}
      {totalMedia > 0 && (
        <div className="issue-media-slider">
          <div
            className="issue-media-track"
            style={{ transform: `translateX(-${activeMedia * 100}%)` }}
          >
            {mediaList.map((m, idx) => (
              <div key={idx} className="issue-media-item">
                <img src={m.url} alt="" />
              </div>
            ))}
          </div>

          {totalMedia > 1 && (
            <>
              <button className="media-nav left" onClick={prevMedia}>
                <FaChevronLeft />
              </button>
              <button className="media-nav right" onClick={nextMedia}>
                <FaChevronRight />
              </button>
            </>
          )}
        </div>
      )}

      {/* STATS */}
      <div className="issue-stats">
        <span>{upvoteCount} upvotes</span>
        <span>{commentCount} comments</span>
      </div>

      {/* ACTIONS */}
      <div className="issue-actions">
        <button 
          onClick={handleUpvote} 
          disabled={upvoteLoading}
          className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
        >
          {hasUpvoted ? <FaThumbsUp /> : <FaRegThumbsUp />} {hasUpvoted ? "Upvoted" : "Upvote"}
        </button>

        <button
          onMouseEnter={prefetchComments}
          onClick={(e) => {
            e.stopPropagation();
            prefetchComments();
            setShowComments((p) => !p);
          }}
        >
          <FaRegComment /> Comment
        </button>
      </div>

      {showComments && (
        <CommentsSection
          issueId={issue.id}
          comments={comments}
          setComments={(c) => {
            setComments(c);
            setCommentCount(c.length);
          }}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
};

export default IssueCard;
