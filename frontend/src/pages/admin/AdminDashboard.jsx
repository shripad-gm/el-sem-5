import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchAdminIssues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/issues');
      setIssues(data || []);
    } catch (err) {
      console.error('❌ Failed to fetch admin issues:', err);
      if (err.response?.status === 401) {
        console.error('🔐 Authentication required for admin dashboard');
      }
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminIssues(); }, []);

  const handleUpdateStatus = async (issueId, status) => {
    if (!confirm(`Mark this issue as ${status.replace('_', ' ')}?`)) return;
    
    setUpdating(issueId);
    try {
      await api.patch(`/admin/issues/${issueId}/status`, {
        status,
        remarks: status === 'IN_PROGRESS' ? "Team assigned" : "Issue fixed"
      });
      await fetchAdminIssues();
    } catch (err) {
      console.error('❌ Update status failed:', err);
      if (err.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else {
        alert(`Failed to update status: ${err.response?.data?.message || 'Unknown error'}`);
      }
    } finally {
      setUpdating(null);
    }
  };

  const getSlaColor = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = (deadlineDate - now) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'bg-red-500 text-white';
    if (hoursLeft < 24) return 'bg-orange-500 text-white';
    if (hoursLeft < 48) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const formatTimeLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff < 0) return 'OVERDUE';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 48) return `${Math.floor(hours / 24)}d left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'bg-blue-100 text-blue-700 border-blue-200',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'RESOLVED_PENDING_USER': 'bg-green-100 text-green-700 border-green-200',
      'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-cyan-50 py-12 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
              <span className="text-4xl">👨‍💼</span>
            </div>
            <div>
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-700 font-semibold text-lg">Manage and track issues in your department</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-6 py-3 bg-white/90 backdrop-blur-xl border-2 border-indigo-200 rounded-2xl font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
              {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}
            </span>
            <button
              onClick={fetchAdminIssues}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-black text-sm hover:from-indigo-600 hover:to-purple-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Issues Grid */}
        {issues.length === 0 ? (
          <div className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-indigo-200/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50" />
            <div className="relative z-10">
              <div className="text-8xl mb-6 animate-bounce">✅</div>
              <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
                All Clear!
              </h3>
              <p className="text-gray-600 text-lg font-semibold">No issues assigned to your department right now.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {issues.map((issue, index) => (
              <div
                key={issue.issueId}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-white/50 hover:border-indigo-300/50 group transform hover:scale-105"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(issue.status)}`}>
                        {issue.status?.replace('_', ' ') || 'OPEN'}
                      </span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                        {issue.categoryName || 'Category'}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getSlaColor(issue.slaDeadline)}`}>
                      {formatTimeLeft(issue.slaDeadline)}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {issue.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <p>📍 {issue.localityName || 'Locality'}</p>
                    <p>👤 Reported by: {issue.creatorName || 'Anonymous'}</p>
                    <p>📅 {new Date(issue.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    {issue.status === 'OPEN' && (
                      <button
                        onClick={() => handleUpdateStatus(issue.issueId, 'IN_PROGRESS')}
                        disabled={updating === issue.issueId}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 text-white rounded-xl font-black text-sm hover:from-yellow-600 hover:via-orange-600 hover:to-amber-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {updating === issue.issueId ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating...
                          </span>
                        ) : (
                          '🚀 Mark In Progress'
                        )}
                      </button>
                    )}
                    {issue.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus(issue.issueId, 'RESOLVED_PENDING_USER')}
                        disabled={updating === issue.issueId}
                        className="w-full py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl font-black text-sm hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {updating === issue.issueId ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating...
                          </span>
                        ) : (
                          '✅ Mark Resolved'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;