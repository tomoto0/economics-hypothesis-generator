import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Star, TrendingUp } from 'lucide-react';

const FeedbackSummary = ({ hypothesis, feedbacks = [] }) => {
  const [showDetails, setShowDetails] = useState(false);

  // フィードバック統計の計算
  const calculateStats = () => {
    if (feedbacks.length === 0) {
      return {
        count: 0,
        averageRating: 0,
        categoryAverages: {}
      };
    }

    const categories = ['validity', 'feasibility', 'novelty', 'policy_importance', 'overall'];
    const categoryAverages = {};
    
    categories.forEach(category => {
      const sum = feedbacks.reduce((acc, feedback) => acc + (feedback[category] || 0), 0);
      categoryAverages[category] = feedbacks.length > 0 ? (sum / feedbacks.length).toFixed(1) : 0;
    });

    return {
      count: feedbacks.length,
      averageRating: parseFloat(categoryAverages.overall),
      categoryAverages
    };
  };

  const stats = calculateStats();

  const categoryLabels = {
    validity: '妥当性',
    feasibility: '実現可能性',
    novelty: '新規性',
    policy_importance: '政策的重要性',
    overall: '総合評価'
  };

  const StarDisplay = ({ rating, size = 'sm' }) => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (stats.count === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 text-gray-500">
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm">まだフィードバックがありません</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* サマリー表示 */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">
                {stats.count} 件のフィードバック
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <StarDisplay rating={stats.averageRating} />
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {showDetails ? '詳細を隠す' : '詳細を表示'}
          </button>
        </div>
      </div>

      {/* 詳細表示 */}
      {showDetails && (
        <div className="p-4 space-y-4">
          {/* カテゴリ別評価 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">カテゴリ別評価</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(stats.categoryAverages).map(([category, average]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {categoryLabels[category]}
                  </span>
                  <StarDisplay rating={parseFloat(average)} />
                </div>
              ))}
            </div>
          </div>

          {/* 最新のコメント */}
          {feedbacks.length > 0 && feedbacks[0].comment && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">最新のコメント</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 italic">
                  "{feedbacks[0].comment}"
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(feedbacks[0].timestamp).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          )}

          {/* 改善提案がある場合 */}
          {feedbacks.some(f => f.suggestions) && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">改善提案</h4>
              <div className="space-y-2">
                {feedbacks
                  .filter(f => f.suggestions)
                  .slice(0, 2)
                  .map((feedback, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        {feedback.suggestions}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 関連研究がある場合 */}
          {feedbacks.some(f => f.related_research) && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">関連研究</h4>
              <div className="space-y-2">
                {feedbacks
                  .filter(f => f.related_research)
                  .slice(0, 2)
                  .map((feedback, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        {feedback.related_research}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackSummary;

