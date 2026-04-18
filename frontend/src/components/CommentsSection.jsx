import { useState } from "react";
import api from "../api/axios";
import { FaRegCommentDots, FaPaperPlane, FaTimes } from "react-icons/fa";
import "./CommentsSection.css";

const CommentsSection = ({ issueId, comments, setComments, onClose }) => {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() || posting) return;

    try {
      setPosting(true);

      await api.post(
        `/issues/${issueId}/comments`,
        { content },
        { withCredentials: true }
      );

      // ✅ instant optimistic update
      setComments((prev) => [
        ...prev,
        {
          id: Date.now(),
          content,
          user: { fullName: "You" },
          createdAt: new Date().toISOString(),
        },
      ]);

      setContent("");
      
      // Auto-close comments after posting
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
      
    } catch {
      console.error("Comment failed");
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className="comments-wrapper">
      {/* Header */}
      <div className="comments-header">
        <div className="header-left">
          <h4>Comments ({comments.length})</h4>
        </div>
        <button className="close-comments-btn" onClick={handleClose} title="Close Comments">
          <FaTimes />
        </button>
      </div>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="comment-muted">No comments yet</p>
        )}

        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-avatar">
              {c.user?.fullName?.[0]?.toUpperCase()}
            </div>

            <div className="comment-body">
              <div className="comment-author">
                {c.user?.fullName}
              </div>
              <div className="comment-text">
                {c.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="comment-input-row">
        <FaRegCommentDots className="comment-icon" />
        <input
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handlePost();
            }
          }}
        />
        <button
          type="button"
          onClick={handlePost}
          disabled={posting}
          className="post-comment-btn"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default CommentsSection;
