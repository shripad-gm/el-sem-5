// Demo Issues Storage - for testing without authentication

const DEMO_ISSUES_KEY = 'civic_monitor_demo_issues';
const DEMO_COMMENTS_KEY = 'civic_monitor_demo_comments';

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const getDemoIssues = () => {
  try {
    const stored = localStorage.getItem(DEMO_ISSUES_KEY);
    const issues = stored ? JSON.parse(stored) : [];
    
    // Merge comments and upvotes from localStorage for each issue
    return issues.map(issue => {
      const comments = getDemoComments(issue.issueId);
      const upvoteData = getDemoUpvote(issue.issueId);
      
      return {
        ...issue,
        comments: comments,
        upvoteCount: upvoteData?.count ?? issue.upvoteCount ?? 0,
        upvoted: upvoteData?.upvoted ?? false
      };
    });
  } catch (err) {
    console.error('Error loading demo issues:', err);
    return [];
  }
};

export const saveDemoIssue = async (issueData) => {
  try {
    const existing = getDemoIssues();
    const selectedCategory = issueData.categoryName || 'General';
    
    // Get demo user info if available
    const demoUserStr = localStorage.getItem('demoUser');
    let creatorName = 'Demo User';
    let localityName = 'Demo Locality';
    
    if (demoUserStr) {
      try {
        const demoUser = JSON.parse(demoUserStr);
        creatorName = demoUser.fullName || demoUser.email || 'Demo User';
        localityName = demoUser.localityName || 'Demo Locality';
      } catch (err) {
        console.error('Error parsing demo user:', err);
      }
    }
    
    // Convert file to base64 if present
    let media = [];
    if (issueData.file) {
      try {
        const base64Data = await fileToBase64(issueData.file);
        media = [{
          url: base64Data, // Store as base64 data URL (persists across sessions)
          type: issueData.file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO'
        }];
      } catch (err) {
        console.error('Error converting file to base64:', err);
      }
    }
    
    const newIssue = {
      issueId: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: issueData.title,
      description: issueData.description,
      categoryId: issueData.categoryId,
      categoryName: selectedCategory,
      status: 'OPEN',
      upvoteCount: 0,
      createdAt: new Date().toISOString(),
      localityName: localityName,
      creatorName: creatorName,
      creatorId: 'demo-user',
      media: media
    };
    
    const updated = [newIssue, ...existing];
    localStorage.setItem(DEMO_ISSUES_KEY, JSON.stringify(updated));
    return newIssue;
  } catch (err) {
    console.error('Error saving demo issue:', err);
    return null;
  }
};

export const deleteDemoIssue = (issueId) => {
  try {
    const existing = getDemoIssues();
    const updated = existing.filter(issue => issue.issueId !== issueId);
    localStorage.setItem(DEMO_ISSUES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting demo issue:', err);
  }
};

export const clearDemoIssues = () => {
  try {
    localStorage.removeItem(DEMO_ISSUES_KEY);
  } catch (err) {
    console.error('Error clearing demo issues:', err);
  }
};

// Comments management
export const getDemoComments = (issueId) => {
  try {
    const stored = localStorage.getItem(DEMO_COMMENTS_KEY);
    const allComments = stored ? JSON.parse(stored) : {};
    return allComments[issueId] || [];
  } catch (err) {
    console.error('Error loading demo comments:', err);
    return [];
  }
};

export const saveDemoComment = (issueId, comment) => {
  try {
    const stored = localStorage.getItem(DEMO_COMMENTS_KEY);
    const allComments = stored ? JSON.parse(stored) : {};
    
    if (!allComments[issueId]) {
      allComments[issueId] = [];
    }
    
    allComments[issueId].push({
      ...comment,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
    localStorage.setItem(DEMO_COMMENTS_KEY, JSON.stringify(allComments));
    return allComments[issueId];
  } catch (err) {
    console.error('Error saving demo comment:', err);
    return [];
  }
};

export const deleteDemoComment = (issueId, commentId) => {
  try {
    const stored = localStorage.getItem(DEMO_COMMENTS_KEY);
    const allComments = stored ? JSON.parse(stored) : {};
    
    if (allComments[issueId]) {
      allComments[issueId] = allComments[issueId].filter(c => c.id !== commentId);
      localStorage.setItem(DEMO_COMMENTS_KEY, JSON.stringify(allComments));
      return allComments[issueId];
    }
    return [];
  } catch (err) {
    console.error('Error deleting demo comment:', err);
    return [];
  }
};

export const clearDemoComments = () => {
  try {
    localStorage.removeItem(DEMO_COMMENTS_KEY);
  } catch (err) {
    console.error('Error clearing demo comments:', err);
  }
};

// Upvote management
const DEMO_UPVOTES_KEY = 'civic_monitor_demo_upvotes';

export const getDemoUpvote = (issueId) => {
  try {
    const stored = localStorage.getItem(DEMO_UPVOTES_KEY);
    const allUpvotes = stored ? JSON.parse(stored) : {};
    return allUpvotes[issueId] || { upvoted: false, count: 0 };
  } catch (err) {
    console.error('Error loading demo upvote:', err);
    return { upvoted: false, count: 0 };
  }
};

export const saveDemoUpvote = (issueId, upvoted, count) => {
  try {
    const stored = localStorage.getItem(DEMO_UPVOTES_KEY);
    const allUpvotes = stored ? JSON.parse(stored) : {};
    
    allUpvotes[issueId] = {
      upvoted: upvoted,
      count: count
    };
    
    localStorage.setItem(DEMO_UPVOTES_KEY, JSON.stringify(allUpvotes));
  } catch (err) {
    console.error('Error saving demo upvote:', err);
  }
};

