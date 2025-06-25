import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ThumbsUp, ThumbsDown, Reply, Bot, User, Calendar, Building } from 'lucide-react';

const DiscussionPanel = ({ hypothesisId, hypothesisData, apiBaseUrl = 'http://localhost:5000/api' }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    affiliation: ''
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (hypothesisId) {
      loadDiscussions();
      loadStats();
    }
  }, [hypothesisId]);

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/discussions/${hypothesisId}`);
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions || []);
      }
    } catch (error) {
      console.error('Error loading discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/discussions/stats/${hypothesisId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadReplies = async (discussionId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/discussions/${discussionId}/replies`);
      if (response.ok) {
        const data = await response.json();
        return data.replies || [];
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    }
    return [];
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    if (!userInfo.name.trim()) {
      setShowUserForm(true);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hypothesis_id: hypothesisId,
          author_name: userInfo.name,
          author_email: userInfo.email,
          author_affiliation: userInfo.affiliation,
          content: newComment,
          comment_type: 'user'
        }),
      });

      if (response.ok) {
        setNewComment('');
        loadDiscussions();
        loadStats();
        
        // AI自動コメントをトリガー
        triggerAIComment();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const submitReply = async (parentId) => {
    if (!replyContent.trim()) return;
    if (!userInfo.name.trim()) {
      setShowUserForm(true);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hypothesis_id: hypothesisId,
          author_name: userInfo.name,
          author_email: userInfo.email,
          author_affiliation: userInfo.affiliation,
          content: replyContent,
          comment_type: 'user',
          parent_id: parentId
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyTo(null);
        loadDiscussions();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const triggerAIComment = async () => {
    try {
      await fetch(`${apiBaseUrl}/ai-comment/auto-trigger/${hypothesisId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hypothesis_data: hypothesisData
        }),
      });
      
      // AIコメント後にディスカッションを再読み込み
      setTimeout(() => {
        loadDiscussions();
        loadStats();
      }, 2000);
    } catch (error) {
      console.error('Error triggering AI comment:', error);
    }
  };

  const likeComment = async (discussionId) => {
    try {
      await fetch(`${apiBaseUrl}/discussions/${discussionId}/like`, {
        method: 'POST',
      });
      loadDiscussions();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const dislikeComment = async (discussionId) => {
    try {
      await fetch(`${apiBaseUrl}/discussions/${discussionId}/dislike`, {
        method: 'POST',
      });
      loadDiscussions();
    } catch (error) {
      console.error('Error disliking comment:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const DiscussionItem = ({ discussion, isReply = false }) => {
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);

    const loadDiscussionReplies = async () => {
      if (!showReplies) {
        const repliesData = await loadReplies(discussion.id);
        setReplies(repliesData);
      }
      setShowReplies(!showReplies);
    };

    return (
      <div className={`border rounded-lg p-4 ${isReply ? 'ml-8 bg-gray-50' : 'bg-white'} ${discussion.comment_type === 'ai' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {discussion.comment_type === 'ai' ? (
              <Bot className="w-5 h-5 text-blue-600" />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
            <div>
              <div className="font-semibold text-gray-900">
                {discussion.author_name}
                {discussion.comment_type === 'ai' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    AI Assistant
                  </span>
                )}
              </div>
              {discussion.author_affiliation && (
                <div className="flex items-center text-sm text-gray-500">
                  <Building className="w-3 h-3 mr-1" />
                  {discussion.author_affiliation}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(discussion.created_at)}
          </div>
        </div>

        <div className="mb-3 text-gray-800 leading-relaxed">
          {discussion.content}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => likeComment(discussion.id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{discussion.likes}</span>
            </button>
            <button
              onClick={() => dislikeComment(discussion.id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{discussion.dislikes}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyTo(discussion.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>返信</span>
              </button>
            )}
          </div>

          {!isReply && discussion.reply_count > 0 && (
            <button
              onClick={loadDiscussionReplies}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showReplies ? '返信を隠す' : `返信を表示 (${discussion.reply_count})`}
            </button>
          )}
        </div>

        {replyTo === discussion.id && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="返信を入力してください..."
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setReplyTo(null)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={() => submitReply(discussion.id)}
                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返信
              </button>
            </div>
          </div>
        )}

        {showReplies && replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {replies.map((reply) => (
              <DiscussionItem key={reply.id} discussion={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
          ディスカッション
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>総コメント: {stats.total_discussions || 0}</span>
          <span>研究者: {stats.user_discussions || 0}</span>
          <span>AI: {stats.ai_discussions || 0}</span>
        </div>
      </div>

      {/* ユーザー情報入力フォーム */}
      {showUserForm && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold mb-3">ユーザー情報を入力してください</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="お名前 *"
              value={userInfo.name}
              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="メールアドレス（任意）"
              value={userInfo.email}
              onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="所属機関（任意）"
              value={userInfo.affiliation}
              onChange={(e) => setUserInfo({...userInfo, affiliation: e.target.value})}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowUserForm(false)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      )}

      {/* 新しいコメント入力 */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="この仮説についてのご意見やコメントをお聞かせください..."
          className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
        />
        <div className="flex justify-between items-center mt-3">
          <button
            onClick={() => setShowUserForm(true)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ユーザー情報を編集
          </button>
          <button
            onClick={submitComment}
            disabled={!newComment.trim()}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>コメント投稿</span>
          </button>
        </div>
      </div>

      {/* ディスカッション一覧 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>まだコメントがありません。最初のコメントを投稿してみませんか？</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <DiscussionItem key={discussion.id} discussion={discussion} />
          ))
        )}
      </div>

      {/* AI自動コメント手動トリガー */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={triggerAIComment}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>AI分析コメントを生成</span>
        </button>
      </div>
    </div>
  );
};

export default DiscussionPanel;

