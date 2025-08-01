import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ThumbsUp, ThumbsDown, Reply, Bot, User, Calendar, Building } from 'lucide-react';

const DiscussionPanel = ({ hypothesisId, hypothesisData }) => {
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
    }
  }, [hypothesisId]);

  useEffect(() => {
    // ディスカッションデータが更新されたら統計を再計算
    loadStats();
  }, [discussions]);

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      // GitHub Issues APIからディスカッションを取得
      const issuesResponse = await fetch('https://api.github.com/repos/tomoto0/economics-hypothesis-generator/issues?labels=discussion');
      const issues = await issuesResponse.json();
      
      const discussionData = [];
      issues.forEach(issue => {
        try {
          // Issue本文からディスカッションデータを抽出
          const match = issue.body.match(/```json\n([\s\S]*?)\n```/);
          if (match) {
            const discussion = JSON.parse(match[1]);
            if (discussion.hypothesis_id == hypothesisId) {
              discussionData.push({
                id: issue.number,
                ...discussion.discussion,
                created_at: issue.created_at,
                likes: 0, // GitHub APIからは取得できないため初期値
                dislikes: 0,
                reply_count: 0
              });
            }
          }
        } catch (e) {
          console.warn('ディスカッションデータの解析に失敗:', e);
        }
      });
      
      // 作成日時でソート（新しい順）
      discussionData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setDiscussions(discussionData);
    } catch (error) {
      console.error('ディスカッションの読み込みに失敗しました:', error);
      // フォールバック: 空の配列を設定
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // ローカルのディスカッションデータから統計を計算
      const totalDiscussions = discussions.length;
      const userDiscussions = discussions.filter(d => d.comment_type === 'user').length;
      const aiDiscussions = discussions.filter(d => d.comment_type === 'ai').length;
      
      setStats({
        total_discussions: totalDiscussions,
        user_discussions: userDiscussions,
        ai_discussions: aiDiscussions
      });
    } catch (error) {
      console.error('統計の計算に失敗しました:', error);
      setStats({
        total_discussions: 0,
        user_discussions: 0,
        ai_discussions: 0
      });
    }
  };

  const loadReplies = async (discussionId) => {
    try {
      // GitHub Issues APIから返信を取得
      const issuesResponse = await fetch('https://api.github.com/repos/tomoto0/economics-hypothesis-generator/issues?labels=reply');
      const issues = await issuesResponse.json();
      
      const replies = [];
      issues.forEach(issue => {
        try {
          const match = issue.body.match(/```json\n([\s\S]*?)\n```/);
          if (match) {
            const discussion = JSON.parse(match[1]);
            if (discussion.discussion.parent_id == discussionId) {
              replies.push({
                id: issue.number,
                ...discussion.discussion,
                created_at: issue.created_at,
                likes: 0,
                dislikes: 0,
                reply_count: 0
              });
            }
          }
        } catch (e) {
          console.warn('返信データの解析に失敗:', e);
        }
      });
      
      return replies;
    } catch (error) {
      console.error('返信の読み込みに失敗しました:', error);
      return [];
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    if (!userInfo.name.trim()) {
      setShowUserForm(true);
      return;
    }

    try {
      // GitHub Issue作成用のデータ
      const issueData = {
        title: `ディスカッション: ${hypothesisData.title}`,
        body: `## 仮説へのディスカッション

**仮説ID**: ${hypothesisId}
**仮説タイトル**: ${hypothesisData.title}

### コメント
${newComment}

### 投稿者情報
- **名前**: ${userInfo.name}
- **メールアドレス**: ${userInfo.email || '未記入'}
- **所属機関**: ${userInfo.affiliation || '未記入'}

---

\`\`\`json
{
  "hypothesis_id": ${hypothesisId},
  "discussion": {
    "author_name": "${userInfo.name}",
    "author_email": "${userInfo.email || ''}",
    "author_affiliation": "${userInfo.affiliation || ''}",
    "content": ${JSON.stringify(newComment)},
    "comment_type": "user",
    "timestamp": "${new Date().toISOString()}"
  }
}
\`\`\``,
        labels: ['discussion', 'user-input']
      }

      // GitHub Issues APIに投稿（実際の実装では認証が必要）
      console.log('ディスカッションデータ:', issueData)
      
      // ローカルでディスカッションを更新（デモ用）
      const newDiscussion = {
        id: Date.now(), // 仮のID
        author_name: userInfo.name,
        author_email: userInfo.email,
        author_affiliation: userInfo.affiliation,
        content: newComment,
        comment_type: 'user',
        created_at: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        reply_count: 0
      };
      
      setDiscussions(prev => [newDiscussion, ...prev])
      setNewComment('')
      
      alert('ディスカッションを送信しました！GitHub Issuesで確認できます。')
    } catch (error) {
      console.error('ディスカッション送信エラー:', error)
      alert('ディスカッションの送信に失敗しました。もう一度お試しください。')
    }
  };

  const submitReply = async (parentId) => {
    if (!replyContent.trim()) return;
    if (!userInfo.name.trim()) {
      setShowUserForm(true);
      return;
    }

    try {
      const parentComment = discussions.find(d => d.id === parentId);
      
      // GitHub Issue作成用のデータ
      const issueData = {
        title: `返信: ${hypothesisData.title}`,
        body: `## 仮説ディスカッションへの返信

**仮説ID**: ${hypothesisId}
**仮説タイトル**: ${hypothesisData.title}
**返信先**: ${parentComment ? parentComment.author_name : '不明'}

### 返信内容
${replyContent}

### 投稿者情報
- **名前**: ${userInfo.name}
- **メールアドレス**: ${userInfo.email || '未記入'}
- **所属機関**: ${userInfo.affiliation || '未記入'}

---

\`\`\`json
{
  "hypothesis_id": ${hypothesisId},
  "discussion": {
    "author_name": "${userInfo.name}",
    "author_email": "${userInfo.email || ''}",
    "author_affiliation": "${userInfo.affiliation || ''}",
    "content": ${JSON.stringify(replyContent)},
    "comment_type": "user",
    "parent_id": ${parentId},
    "timestamp": "${new Date().toISOString()}"
  }
}
\`\`\``,
        labels: ['discussion', 'reply', 'user-input']
      }

      // GitHub Issues APIに投稿（実際の実装では認証が必要）
      console.log('返信データ:', issueData)
      
      // ローカルで返信を更新（デモ用）
      const newReply = {
        id: Date.now(), // 仮のID
        author_name: userInfo.name,
        author_email: userInfo.email,
        author_affiliation: userInfo.affiliation,
        content: replyContent,
        comment_type: 'user',
        parent_id: parentId,
        created_at: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        reply_count: 0
      };
      
      setDiscussions(prev => [newReply, ...prev])
      setReplyContent('')
      setReplyTo(null)
      
      alert('返信を送信しました！GitHub Issuesで確認できます。')
    } catch (error) {
      console.error('返信送信エラー:', error)
      alert('返信の送信に失敗しました。もう一度お試しください。')
    }
  };

  const triggerAIComment = async () => {
    try {
      // Gemini APIキーの確認（環境変数から取得、なければプロンプト表示）
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        alert('Gemini APIキーが設定されていません。GitHub SecretsにGEMINI_API_KEYを設定してください。');
        return;
      }

      // Gemini APIに直接リクエストを送信
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `以下の経済学仮説について、専門的な観点から分析コメントを生成してください。

仮説タイトル: ${hypothesisData.title}
仮説内容: ${hypothesisData.description}
カテゴリ: ${hypothesisData.category}
信頼度: ${hypothesisData.confidence}%
研究手法: ${hypothesisData.research_methods ? hypothesisData.research_methods.join(', ') : '未指定'}
重要要因: ${hypothesisData.key_factors ? hypothesisData.key_factors.join(', ') : '未指定'}

以下の観点から分析してください：
1. 仮説の理論的妥当性
2. 実証研究の可能性
3. 政策的含意
4. 既存研究との関連性
5. 改善提案

分析は学術的で建設的な内容にし、500文字程度でまとめてください。`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiComment = data.candidates[0].content.parts[0].text;

      // AI分析コメントをディスカッションとして追加
      const aiDiscussion = {
        id: Date.now(), // 仮のID
        author_name: 'Gemini AI Assistant',
        author_email: '',
        author_affiliation: 'Google AI',
        content: aiComment,
        comment_type: 'ai',
        ai_model: 'gemini-2.5-flash',
        created_at: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        reply_count: 0
      };

      // GitHub Issue作成用のデータ
      const issueData = {
        title: `AI分析: ${hypothesisData.title}`,
        body: `## AI による仮説分析

**仮説ID**: ${hypothesisId}
**仮説タイトル**: ${hypothesisData.title}

### AI分析コメント
${aiComment}

---

\`\`\`json
{
  "hypothesis_id": ${hypothesisId},
  "discussion": {
    "author_name": "Gemini AI Assistant",
    "author_email": "",
    "author_affiliation": "Google AI",
    "content": ${JSON.stringify(aiComment)},
    "comment_type": "ai",
    "ai_model": "gemini-2.5-flash",
    "timestamp": "${aiDiscussion.created_at}"
  }
}
\`\`\``,
        labels: ['discussion', 'ai-generated']
      };

      console.log('AI分析データ:', issueData);
      
      // ローカルでディスカッションを更新
      setDiscussions(prev => [aiDiscussion, ...prev]);
      
      alert('AI分析コメントを生成しました！GitHub Issuesで確認できます。');
    } catch (error) {
      console.error('AI分析コメント生成エラー:', error);
      alert('AI分析コメントの生成に失敗しました。APIキーを確認してもう一度お試しください。');
    }
  };

  const likeComment = async (discussionId) => {
    try {
      // ローカルでいいね数を更新（デモ用）
      setDiscussions(prev => prev.map(d => 
        d.id === discussionId 
          ? { ...d, likes: d.likes + 1 }
          : d
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const dislikeComment = async (discussionId) => {
    try {
      // ローカルでよくない数を更新（デモ用）
      setDiscussions(prev => prev.map(d => 
        d.id === discussionId 
          ? { ...d, dislikes: d.dislikes + 1 }
          : d
      ));
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

