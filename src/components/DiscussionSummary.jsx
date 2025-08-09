import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const DiscussionSummary = ({ hypothesis, discussions = [] }) => {
  const [showDetails, setShowDetails] = useState(false);

  const discussionCount = discussions.length;

  if (discussionCount === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 text-gray-500">
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm">まだディスカッションがありません</span>
        </div>
      </div>
    );
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
          {discussions.length > 0 && discussions[0].body && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">最新のコメント</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 italic">
                  "{discussions[0].body.substring(0, 100)}..."
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(discussions[0].created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionSummary;


