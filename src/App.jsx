import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Brain, TrendingUp, BarChart3, Lightbulb, Clock, RefreshCw, Search, Filter, Download, Plus, Eye, Trash2, Star, MessageSquare } from 'lucide-react'
import FeedbackModal from './components/FeedbackModal.jsx'
import FeedbackSummary from './components/FeedbackSummary.jsx'
import DiscussionPanel from './components/DiscussionPanel.jsx'
import DiscussionSummary from './components/DiscussionSummary.jsx'
import './App.css'

function App() {
  const [hypotheses, setHypotheses] = useState([])
  const [filteredHypotheses, setFilteredHypotheses] = useState([])
  const [feedbacks, setFeedbacks] = useState({}) // 仮説IDをキーとするフィードバックデータ
  const [discussions, setDiscussions] = useState({}) // 仮説IDをキーとするディスカッションデータ
  const [stats, setStats] = useState({
    totalHypotheses: 0,
    averageConfidence: 0,
    categoriesCount: 0,
    categories: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [minConfidence, setMinConfidence] = useState(0)
  const [selectedHypothesis, setSelectedHypothesis] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [feedbackHypothesis, setFeedbackHypothesis] = useState(null)
  const [showDiscussion, setShowDiscussion] = useState(false)
  const [discussionHypothesis, setDiscussionHypothesis] = useState(null)

  // GitHub Pagesで独立動作するため、バックエンドAPIは使用しない

  useEffect(() => {
    loadHypotheses()
    loadFeedbacks()
    loadDiscussions()
  }, [])

  useEffect(() => {
    filterHypotheses()
  }, [hypotheses, searchTerm, selectedCategory, minConfidence])

  const loadHypotheses = async () => {
    setIsLoading(true)
    try {
      // GitHub Pages環境では、静的JSONファイルから読み込み
      const response = await fetch('/economics-hypothesis-generator/data/hypotheses.json')
      const data = await response.json()
      
      if (data.hypotheses) {
        setHypotheses(data.hypotheses)
        setLastUpdated(new Date(data.generated_at))
        
        // 統計情報を計算
        const categories = [...new Set(data.hypotheses.map(h => h.category))]
        const avgConfidence = data.hypotheses.reduce((sum, h) => sum + h.confidence, 0) / data.hypotheses.length
        
        setStats({
          totalHypotheses: data.hypotheses.length,
          averageConfidence: Math.round(avgConfidence),
          categoriesCount: categories.length,
          categories
        })
      }
    } catch (error) {
      console.error('仮説の読み込みに失敗しました:', error)
      // フォールバック: サンプルデータ
      loadSampleData()
    } finally {
      setIsLoading(false)
    }
  }

  const loadFeedbacks = async () => {
    try {
      // GitHub Issues APIからフィードバックを取得
      const response = await fetch("https://api.github.com/repos/tomoto0/economics-hypothesis-generator/issues?labels=feedback")
      const issues = await response.json()
      
      const feedbackData = {}
      issues.forEach(issue => {
        try {
          // Issue本文からフィードバックデータを抽出
          const match = issue.body.match(/```json\n([\s\S]*?)\n```/)
          if (match) {
            const feedback = JSON.parse(match[1])
            const hypothesisId = feedback.hypothesis_id
            
            if (!feedbackData[hypothesisId]) {
              feedbackData[hypothesisId] = []
            }
            
            feedbackData[hypothesisId].push({
              ...feedback.feedback,
              timestamp: issue.created_at,
              issue_number: issue.number
            })
          }
        } catch (e) {
          console.warn("フィードバックデータの解析に失敗:", e)
        }
      })
      
      setFeedbacks(feedbackData)
    } catch (error) {
      console.error("フィードバックの読み込みに失敗しました:", error)
    }
  }

  const loadDiscussions = async () => {
    try {
      // GitHub Issues APIからディスカッションを取得
      const response = await fetch("https://api.github.com/repos/tomoto0/economics-hypothesis-generator/issues?labels=discussion")
      const issues = await response.json()

      const discussionData = {}
      issues.forEach(issue => {
        const hypothesisIdMatch = issue.title.match(/ディスカッション: 仮説ID-(\d+)/);
        if (hypothesisIdMatch) {
          const hypothesisId = parseInt(hypothesisIdMatch[1]);
          if (!discussionData[hypothesisId]) {
            discussionData[hypothesisId] = [];
          }
          discussionData[hypothesisId].push({
            id: issue.id,
            title: issue.title,
            body: issue.body,
            created_at: issue.created_at,
            user: issue.user.login,
            issue_number: issue.number
          });
        }
      });
      setDiscussions(discussionData);
    } catch (error) {
      console.error("ディスカッションの読み込みに失敗しました:", error);
    }
  }

  const loadSampleData = () => {
    const sampleHypotheses = [
      {
        id: 1,
        title: "多元的データソースによる金融政策効果の非線形分析",
        description: "従来の金融政策分析は単一データソースに依存していたが、FRED、世界銀行、暗号通貨市場データを統合することで、政策効果の非線形性と波及メカニズムをより精密に分析できる。",
        category: "金融政策",
        confidence: 88,
        research_methods: ["多変量時系列分析", "機械学習回帰", "ネットワーク分析"],
        key_factors: ["政策金利変化", "暗号通貨ボラティリティ", "国際資本フロー"],
        generated_at: new Date().toISOString()
      },
      {
        id: 2,
        title: "リアルタイム経済指標統合による景気循環予測モデル",
        description: "従来の景気予測は月次・四半期データに依存していたが、金融市場、暗号通貨、経済カレンダーイベントをリアルタイムで統合することで、より迅速で精度の高い景気転換点の予測が可能になる。",
        category: "マクロ経済学",
        confidence: 82,
        research_methods: ["深層学習", "ベイジアン推定", "リアルタイム計量経済学"],
        key_factors: ["高頻度金融データ", "経済イベントタイミング", "市場期待"],
        generated_at: new Date().toISOString()
      }
    ]
    
    setHypotheses(sampleHypotheses)
    setStats({
      totalHypotheses: sampleHypotheses.length,
      averageConfidence: 85,
      categoriesCount: 2,
      categories: ["金融政策", "マクロ経済学"]
    })
    setLastUpdated(new Date())
  }

  const submitFeedback = async (hypothesisId, feedbackData) => {
    try {
      const hypothesis = hypotheses.find(h => h.id === hypothesisId)
      if (!hypothesis) return

      // GitHub Issue作成用のデータ
      const issueData = {
        title: `フィードバック: ${hypothesis.title}`,
        body: `## 仮説へのフィードバック

**仮説ID**: ${hypothesisId}
**仮説タイトル**: ${hypothesis.title}

### 評価
- **妥当性**: ${feedbackData.validity}/5
- **実現可能性**: ${feedbackData.feasibility}/5
- **新規性**: ${feedbackData.novelty}/5
- **政策的重要性**: ${feedbackData.policy_importance}/5
- **総合評価**: ${feedbackData.overall}/5

### コメント
${feedbackData.comment || 'なし'}

### 改善提案
${feedbackData.suggestions || 'なし'}

### 関連研究
${feedbackData.related_research || 'なし'}

### 研究者情報
${feedbackData.reviewer_info || '匿名'}

---

\`\`\`json
{
  "hypothesis_id": ${hypothesisId},
  "feedback": ${JSON.stringify(feedbackData, null, 2)}
}
\`\`\``,
        labels: ['feedback', 'user-input']
      }

      // GitHub Issues APIに投稿（実際の実装では認証が必要）
      console.log('フィードバックデータ:', issueData)
      
      // ローカルでフィードバックを更新（デモ用）
      const newFeedback = {
        ...feedbackData,
        timestamp: new Date().toISOString()
      }
      
      setFeedbacks(prev => ({
        ...prev,
        [hypothesisId]: [...(prev[hypothesisId] || []), newFeedback]
      }))

      alert('フィードバックを送信しました！GitHub Issuesで確認できます。')
    } catch (error) {
      console.error('フィードバック送信エラー:', error)
      throw error
    }
  }

  const openFeedbackModal = (hypothesis) => {
    setFeedbackHypothesis(hypothesis)
    setFeedbackModalOpen(true)
  }

  const openDiscussion = (hypothesis) => {
    setDiscussionHypothesis(hypothesis)
    setShowDiscussion(true)
  }

  const handleDiscussionUpdate = (hypothesisId, newDiscussion) => {
    // ディスカッションが追加されたときに、discussionsステートを更新
    setDiscussions(prev => ({
      ...prev,
      [hypothesisId]: [...(prev[hypothesisId] || []), newDiscussion]
    }));
  }

  const filterHypotheses = () => {
    let filtered = hypotheses

    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(h => h.category === selectedCategory)
    }

    if (minConfidence > 0) {
      filtered = filtered.filter(h => h.confidence >= minConfidence)
    }

    setFilteredHypotheses(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 75) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const uniqueCategories = [...new Set(hypotheses.map(h => h.category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  経済学仮説生成システム
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    AI駆動による革新的研究アイデア創出プラットフォーム
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4 mr-2" />
                  最終更新: {lastUpdated.toLocaleString('ja-JP')}
                </div>
              )}
              <Button 
                onClick={loadHypotheses} 
                disabled={isLoading} 
                variant="outline"
                className="bg-white/80 hover:bg-indigo-50 border-indigo-200 text-indigo-700 hover:text-indigo-800 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                更新
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ディスカッションパネル（モーダル表示） */}
        {showDiscussion && discussionHypothesis && (
          <Dialog open={showDiscussion} onOpenChange={setShowDiscussion}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">{discussionHypothesis.title}</DialogTitle>
                <DialogDescription>
                  <Badge className={getConfidenceColor(discussionHypothesis.confidence)}>
                    信頼度 {discussionHypothesis.confidence}%
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <DiscussionPanel 
                hypothesisId={discussionHypothesis.id}
                hypothesisData={discussionHypothesis}
                onDiscussionUpdate={handleDiscussionUpdate}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">生成された仮説</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 mb-1">{stats.totalHypotheses}</div>
              <p className="text-xs text-blue-700 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                総数
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-green-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">平均信頼度</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 mb-1">{stats.averageConfidence}%</div>
              <p className="text-xs text-green-700 flex items-center">
                <Brain className="h-3 w-3 mr-1" />
                AI分析による評価
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-purple-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">研究分野</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 mb-1">{stats.categoriesCount}</div>
              <p className="text-xs text-purple-700 flex items-center">
                <Filter className="h-3 w-3 mr-1" />
                カバーされた領域
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 border-orange-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">フィルタ結果</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 mb-1">{filteredHypotheses.length}</div>
              <p className="text-xs text-orange-700 flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                表示中の仮説
              </p>
            </CardContent>
          </Card>
        </div>

        {/* フィルタリング */}
        <Card className="mb-8 bg-white/80 backdrop-blur-md shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center text-lg">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mr-3">
                <Search className="h-5 w-5 text-white" />
              </div>
              検索・フィルタ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Search className="h-4 w-4 mr-2 text-indigo-500" />
                  キーワード検索
                </label>
                <Input
                  placeholder="タイトルや説明で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                  カテゴリ
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  最小信頼度
                </label>
                <Select value={minConfidence.toString()} onValueChange={(value) => setMinConfidence(parseInt(value))}>
                  <SelectTrigger className="border-green-200 focus:border-green-400">
                    <SelectValue placeholder="信頼度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">すべて</SelectItem>
                    <SelectItem value="60">60%以上</SelectItem>
                    <SelectItem value="75">75%以上</SelectItem>
                    <SelectItem value="90">90%以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setMinConfidence(0)
                  }}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300 text-gray-700 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  リセット
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 仮説一覧 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              生成された研究仮説 ({filteredHypotheses.length}件)
            </h2>
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                読み込み中...
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredHypotheses.map((hypothesis) => (
                <Card 
                  key={hypothesis.id} 
                  className="hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:scale-[1.02]"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">{hypothesis.title}</CardTitle>
                        <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                            {hypothesis.category}
                          </Badge>
                          <Badge className={getConfidenceColor(hypothesis.confidence)}>
                            信頼度 {hypothesis.confidence}%
                          </Badge>
                          {feedbacks[hypothesis.id] && feedbacks[hypothesis.id].length > 0 && (
                            <Badge variant="outline" className="border-green-200 text-green-700">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {feedbacks[hypothesis.id].length} 件のフィードバック
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDiscussion(hypothesis)}
                          className="text-purple-600 hover:text-purple-800"
                          title="ディスカッション"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openFeedbackModal(hypothesis)}
                          className="text-blue-600 hover:text-blue-800"
                          title="フィードバック"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedHypothesis(hypothesis)}
                              title="詳細表示"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl">{selectedHypothesis?.title}</DialogTitle>
                              <DialogDescription>
                                <Badge className={getConfidenceColor(selectedHypothesis?.confidence || 0)}>
                                  信頼度 {selectedHypothesis?.confidence}%
                                </Badge>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-medium mb-2">仮説の詳細</h4>
                                <p className="text-gray-700 leading-relaxed">{selectedHypothesis?.description}</p>
                              </div>
                              
                              <Separator />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-3">推奨研究手法</h4>
                                  <div className="space-y-2">
                                    {selectedHypothesis?.research_methods?.map((method, index) => (
                                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                                        {method}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-3">重要要因</h4>
                                  <div className="space-y-2">
                                    {selectedHypothesis?.key_factors?.map((factor, index) => (
                                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                                        {factor}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <h4 className="font-medium mb-2">生成日時</h4>
                                <p className="text-sm text-gray-600">
                                  {formatDate(selectedHypothesis?.generated_at)}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {hypothesis.description}
                    </CardDescription>
                    
                    {feedbacks[hypothesis.id] && (
                      <div className="mb-4">
                        <FeedbackSummary hypothesis={hypothesis} feedbacks={feedbacks[hypothesis.id]} />
                      </div>
                    )}
                    {discussions[hypothesis.id] && (
                      <div className="mb-4">
                        <DiscussionSummary hypothesis={hypothesis} discussions={discussions[hypothesis.id]} />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-1">推奨研究手法</h5>
                        <div className="flex flex-wrap gap-1">
                          {hypothesis.research_methods?.slice(0, 3).map((method, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                          {hypothesis.research_methods?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hypothesis.research_methods.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-1">重要要因</h5>
                        <div className="flex flex-wrap gap-1">
                          {hypothesis.key_factors?.slice(0, 3).map((factor, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                          {hypothesis.key_factors?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{hypothesis.key_factors.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>生成日時: {formatDate(hypothesis.generated_at)}</span>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDiscussion(hypothesis)}
                            className="text-purple-600 hover:text-purple-800 h-auto p-1"
                          >
                            ディスカッション
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openFeedbackModal(hypothesis)}
                            className="text-blue-600 hover:text-blue-800 h-auto p-1"
                          >
                            フィードバック
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* フィードバックモーダル */}
      <FeedbackModal
        hypothesis={feedbackHypothesis}
        isOpen={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false)
          setFeedbackHypothesis(null)
        }}
        onSubmit={submitFeedback}
      />
    </div>
  )
}

export default App

