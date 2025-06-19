import React, { useState } from 'react';
import { MessageSquare, Star, Send, X } from 'lucide-react';

const FeedbackModal = ({ hypothesis, isOpen, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState({
    validity: 0,
    feasibility: 0,
    novelty: 0,
    policy_importance: 0,
    overall: 0,
    comment: '',
    suggestions: '',
    related_research: '',
    reviewer_info: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (category, rating) => {
    setFeedback(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleTextChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(hypothesis.id, feedback);
      setFeedback({
        validity: 0,
        feasibility: 0,
        novelty: 0,
        policy_importance: 0,
        overall: 0,
        comment: '',
        suggestions: '',
        related_research: '',
        reviewer_info: ''
      });
      onClose();
    } catch (error) {
      console.error('フィードバック送信エラー:', error);
      alert('フィードバックの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ label, value, onChange }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 rounded transition-colors ${
              star <= value
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                仮説へのフィードバック
              </h2>
              <h3 className="text-lg text-gray-700 font-medium">
                {hypothesis?.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 評価項目 */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">評価項目</h4>
              
              <StarRating
                label="仮説の妥当性"
                value={feedback.validity}
                onChange={(rating) => handleRatingChange('validity', rating)}
              />
              
              <StarRating
                label="研究の実現可能性"
                value={feedback.feasibility}
                onChange={(rating) => handleRatingChange('feasibility', rating)}
              />
              
              <StarRating
                label="新規性・独創性"
                value={feedback.novelty}
                onChange={(rating) => handleRatingChange('novelty', rating)}
              />
              
              <StarRating
                label="政策的重要性"
                value={feedback.policy_importance}
                onChange={(rating) => handleRatingChange('policy_importance', rating)}
              />
              
              <StarRating
                label="全体的な評価"
                value={feedback.overall}
                onChange={(rating) => handleRatingChange('overall', rating)}
              />
            </div>

            {/* コメント欄 */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">詳細フィードバック</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  コメント・感想
                </label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => handleTextChange('comment', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="この仮説についてのご意見やコメントをお聞かせください..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  改善提案
                </label>
                <textarea
                  value={feedback.suggestions}
                  onChange={(e) => handleTextChange('suggestions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="研究手法や分析方法の改善提案があればお聞かせください..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  関連研究・参考文献
                </label>
                <textarea
                  value={feedback.related_research}
                  onChange={(e) => handleTextChange('related_research', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="関連する研究や参考になる文献があればご紹介ください..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  研究者情報（任意）
                </label>
                <input
                  type="text"
                  value={feedback.reviewer_info}
                  onChange={(e) => handleTextChange('reviewer_info', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="所属機関、専門分野など（任意）"
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting || feedback.overall === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? '送信中...' : 'フィードバック送信'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

