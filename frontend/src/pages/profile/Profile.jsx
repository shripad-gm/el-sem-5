import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import ProfilePosts from "../../components/ProfilePosts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../components/ui/Modal.css";
import { 
  LogOut, 
  Briefcase, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Edit, 
  MoreHorizontal, 
  Award, 
  User,
  Building2,
  Calendar,
  Phone,
  Globe,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import "../../styles/profile.css";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import ScrollToTop from "../../components/ScrollToTop";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  // Debug effect to track modal state changes
  useEffect(() => {
    console.log('showSignOutModal changed to:', showSignOutModal);
  }, [showSignOutModal]);
  const [activeTab, setActiveTab] = useState('posts');
  const [postCount, setPostCount] = useState(0);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const { logout } = useAuth();

  const navigate = useNavigate();

  const fetchUserPosts = useCallback(async () => {
    try {
      const { data } = await api.get("/issues/explore");
      if (Array.isArray(data)) {
        const userPosts = data.filter(issue => issue.postedBy?.id === user?.id);
        const totalUpvotes = userPosts.reduce((sum, post) => sum + (post.upvotes?.length || 0), 0);
        setPostCount(userPosts.length);
        setUpvoteCount(totalUpvotes);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
        await fetchUserPosts();
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [fetchUserPosts]);

  const handleSignOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Sign out button clicked');
    setShowSignOutModal(true);
  };

const confirmSignOut = async () => {
  try {
    await logout();            // ✅ SINGLE SOURCE OF TRUTH
    navigate("/login");        // ✅ soft redirect (no hard reload)
  } catch (err) {
    console.error("Logout failed:", err);
    navigate("/login");
  }
};


  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  if (!user) return null;

  const location = [user.locality?.name, user.zone?.name, user.city?.name]
    .filter(Boolean)
    .join(', ');

  // Render action buttons component for reusability
  const renderActionButtons = (isMobile = false) => (
    <div className={`profile-actions ${isMobile ? 'mobile-actions' : ''}`}>
      <div className="action-buttons">
        <button 
          className="btn btn-outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Sign out button clicked');
            setShowSignOutModal(true);
          }}
        >
          <LogOut size={14} className="mr-2" />
          Sign Out
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => navigate("/profile/edit")}
        >
          <Edit size={14} className="mr-2" />
          Edit Profile
        </button>
      </div>
      <ScrollToTop />
    </div>
  );

  return (
    <div className="profile-container">
      {/* Cover Photo */}
      <div className="cover-photo">
        <div className="cover-photo-overlay"></div>
        <button 
          className="edit-cover-photo"
          onClick={() => navigate("/profile/edit")}
          aria-label="Edit cover photo"
        >
          <Edit size={14} />
          <span>Edit cover photo</span>
        </button>
      </div>
      
      {/* Profile Header - Desktop Actions */}
      <div className="profile-header">
        {/* Avatar Section */}
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {user.profilePhotoUrl ? (
              <img 
                src={user.profilePhotoUrl} 
                alt={user.fullName} 
                className="profile-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {user.fullName?.[0]?.toUpperCase()}
              </div>
            )}
            <button 
              className="edit-avatar-button"
              onClick={() => navigate("/profile/edit")}
              aria-label="Edit profile photo"
            >
              <Edit size={12} />
            </button>
          </div>
        </div>

        {/* Desktop Action Buttons (hidden on mobile) */}
        <div className="desktop-actions">
          {renderActionButtons()}
        </div>

        <div className="profile-info">
          <div className="profile-name-container">
            <h1 className="profile-name">{user.fullName}</h1>
            {user.isVerified && (
              <span className="verified-badge" title="Verified">
                <CheckCircle2 size={18} className="text-blue-500" />
              </span>
            )}
          </div>
          
          <p className="profile-headline">
            {user.headline || 'CivicSense Member'}
          </p>
          
          <div className="profile-details">
            {location && (
              <div className="detail-item">
                <MapPin size={16} className="text-gray-500" />
                <span>{location}</span>
              </div>
            )}
            {user.phoneNumber && (
              <div className="detail-item">
                <Phone size={16} className="text-gray-500" />
                <span>{user.phoneNumber}</span>
              </div>
            )}
            {user.email && (
              <div className="detail-item">
                <Mail size={16} className="text-gray-500" />
                <span>{user.email}</span>
              </div>
            )}
          </div>
          
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="stat-item" onClick={() => setActiveTab('posts')}>
            <span className="stat-value">{postCount}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-item" onClick={() => setActiveTab('activity')}>
            <span className="stat-value">{upvoteCount}</span>
            <span className="stat-label">Upvotes</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Action Buttons (only shown on mobile) */}
      <div className="mobile-actions-container">
        {renderActionButtons(true)}
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <div 
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </div>
        <div 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </div>
      </div>
      
      {/* Content Area */}
      <div className="profile-content">
        {activeTab === 'posts' ? (
          <div className="space-y-4">
            <div className="profile-card">
              <ProfilePosts userId={user.id} />
            </div>
          </div>
        ) : (
          <div className="about-section">
            <h3 className="section-title">
              <Briefcase size={20} />
              About
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {user.bio || 'No bio added yet. Click edit to add a bio.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="section-title">
                  <Briefcase size={20} />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-500">Email</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.phoneNumber || 'Not provided'}
                    </p>
                    <p className="text-sm text-gray-500">Phone</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="section-title">
                  <Award size={20} />
                  Account Status
                </h3>
                <div>
                  <span className="skill-tag">
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Sign Out</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to sign out of your account?</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="modal-button modal-button-cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="modal-button modal-button-confirm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
