import React, { useState } from 'react';
import { MessageSquare, User, Bot } from 'lucide-react';

const DiscussionSummary = ({ hypothesis, discussions = [] }) => {
  const [showDetails, setShowDetails] = useState(false);

  const discussionCount = discussions.length;
  const userDiscussions = discussions.filter(d => d.comment_type === 'user').length;
  const aiDiscussions = discussions.filter(d => d.comment_type === 'ai').length;

  if (discussionCount === 0) {
    return null; // ディスカッションがない場合は何も表示しない
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* サマリー表示 */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">
                {discussionCount} 件のディスカッション
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{userDiscussions}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bot className="w-4 h-4" />
                <span>{aiDiscussions}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
          >
            {showDetails ? '詳細を隠す' : '詳細を表示'}
          </button>
        </div>
      </div>

      {/* 詳細表示 */}
      {showDetails && (
        <div className="p-4 space-y-4">
          {/* 最新のコメント */}
          {discussions.length > 0 && discussions[0].content && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">最新のコメント</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {discussions[0].comment_type === 'ai' ? (
                    <Bot className="w-4 h-4 text-blue-600" />
                  ) : (
                    <User className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {discussions[0].author_name}
                  </span>
                  {discussions[0].comment_type === 'ai' && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      AI
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  {discussions[0].content.length > 150 
                    ? `${discussions[0].content.substring(0, 150)}...` 
                    : discussions[0].content}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(discussions[0].created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          )}

          {/* 参加者情報 */}
          {discussions.length > 1 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">参加者</h4>
              <div className="flex flex-wrap gap-2">
                {[...new Set(discussions.map(d => d.author_name))].slice(0, 5).map((author, index) => (
                  <div key={index} className="flex items-center space-x-1 bg-purple-50 rounded-lg px-2 py-1">
                    <span className="text-xs text-purple-700">{author}</span>
                  </div>
                ))}
                {[...new Set(discussions.map(d => d.author_name))].length > 5 && (
                  <div className="text-xs text-gray-500 px-2 py-1">
                    他 {[...new Set(discussions.map(d => d.author_name))].length - 5} 名
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionSummary;


