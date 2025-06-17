import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Brain, TrendingUp, BarChart3, Lightbulb, Clock, RefreshCw, Search, Filter, Download, Plus, Eye, Trash2, Star } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [hypotheses, setHypotheses] = useState([])
  const [filteredHypotheses, setFilteredHypotheses] = useState([])
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

  useEffect(() => {
    loadHypotheses()
    loadStats()
  }, [])

  useEffect(() => {
    filterHypotheses()
  }, [hypotheses, searchTerm, selectedCategory, minConfidence])

  const loadHypotheses = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (minConfidence > 0) params.append('min_confidence', minConfidence)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${API_BASE_URL}/hypotheses?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setHypotheses(data.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('仮説の読み込みに失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hypotheses/stats`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('統計情報の読み込みに失敗しました:', error)
    }
  }

  const generateNewHypotheses = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/hypotheses/generate`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await loadHypotheses()
        await loadStats()
      }
    } catch (error) {
      console.error('仮説の生成に失敗しました:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteHypothesis = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hypotheses/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        await loadHypotheses()
        await loadStats()
      }
    } catch (error) {
      console.error('仮説の削除に失敗しました:', error)
    }
  }

  const exportHypotheses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hypotheses/export`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'hypotheses.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('エクスポートに失敗しました:', error)
    }
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

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const uniqueCategories = [...new Set(hypotheses.map(h => h.category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  経済学仮説生成システム
                </h1>
                <p className="text-sm text-gray-600">AI駆動による研究アイデア創出プラットフォーム</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  最終更新: {lastUpdated.toLocaleString('ja-JP')}
                </div>
              )}
              <Button onClick={exportHypotheses} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </Button>
              <Button 
                onClick={generateNewHypotheses} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Plus className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                新規生成
              </Button>
              <Button onClick={loadHypotheses} disabled={isLoading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                更新
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">生成された仮説</CardTitle>
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalHypotheses}</div>
              <p className="text-xs text-blue-700">総数</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">平均信頼度</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.averageConfidence}%</div>
              <p className="text-xs text-green-700">AI分析による評価</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">研究分野</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.categoriesCount}</div>
              <p className="text-xs text-purple-700">カバーされた領域</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">フィルタ結果</CardTitle>
              <Filter className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{filteredHypotheses.length}</div>
              <p className="text-xs text-orange-700">表示中の仮説</p>
            </CardContent>
          </Card>
        </div>

        {/* フィルタリング */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              検索・フィルタ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">キーワード検索</label>
                <Input
                  placeholder="タイトルや説明で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">カテゴリ</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
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
              <div>
                <label className="text-sm font-medium mb-2 block">最小信頼度</label>
                <Select value={minConfidence.toString()} onValueChange={(value) => setMinConfidence(parseInt(value))}>
                  <SelectTrigger>
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
                  className="w-full"
                >
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
            {(isLoading || isGenerating) && (
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {isGenerating ? '新しい仮説を生成中...' : '読み込み中...'}
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
                          {hypothesis.noveltyScore && (
                            <Badge variant="outline" className="border-purple-200 text-purple-700">
                              <Star className="h-3 w-3 mr-1" />
                              新規性 {hypothesis.noveltyScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedHypothesis(hypothesis)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{hypothesis.title}</DialogTitle>
                              <DialogDescription>
                                詳細情報
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">説明</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {hypothesis.description}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">スコア</h4>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-sm">信頼度:</span>
                                      <span className={`text-sm font-medium ${getScoreColor(hypothesis.confidence)}`}>
                                        {hypothesis.confidence}%
                                      </span>
                                    </div>
                                    {hypothesis.noveltyScore && (
                                      <div className="flex justify-between">
                                        <span className="text-sm">新規性:</span>
                                        <span className={`text-sm font-medium ${getScoreColor(hypothesis.noveltyScore)}`}>
                                          {hypothesis.noveltyScore}%
                                        </span>
                                      </div>
                                    )}
                                    {hypothesis.feasibilityScore && (
                                      <div className="flex justify-between">
                                        <span className="text-sm">実現可能性:</span>
                                        <span className={`text-sm font-medium ${getScoreColor(hypothesis.feasibilityScore)}`}>
                                          {hypothesis.feasibilityScore}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">メタデータ</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div>カテゴリ: {hypothesis.category}</div>
                                    <div>生成日時: {formatDate(hypothesis.generatedAt)}</div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">推奨研究手法</h4>
                                <div className="flex flex-wrap gap-1">
                                  {hypothesis.researchMethods.map((method, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {method}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">重要要因</h4>
                                <div className="flex flex-wrap gap-1">
                                  {hypothesis.keyFactors.map((factor, index) => (
                                    <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                                      {factor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteHypothesis(hypothesis.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-relaxed line-clamp-3">
                      {hypothesis.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">推奨研究手法</h4>
                        <div className="flex flex-wrap gap-1">
                          {hypothesis.researchMethods.slice(0, 3).map((method, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                          {hypothesis.researchMethods.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hypothesis.researchMethods.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">重要要因</h4>
                        <div className="flex flex-wrap gap-1">
                          {hypothesis.keyFactors.slice(0, 3).map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                              {factor}
                            </Badge>
                          ))}
                          {hypothesis.keyFactors.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-blue-50">
                              +{hypothesis.keyFactors.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 pt-2 flex justify-between items-center">
                        <span>生成日時: {formatDate(hypothesis.generatedAt)}</span>
                        {hypothesis.feasibilityScore && (
                          <span className={`font-medium ${getScoreColor(hypothesis.feasibilityScore)}`}>
                            実現可能性: {hypothesis.feasibilityScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredHypotheses.length === 0 && (
            <Card className="text-center py-12 bg-white/70 backdrop-blur-sm">
              <CardContent>
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">仮説が見つかりません</h3>
                <p className="text-gray-600 mb-4">
                  {hypotheses.length === 0 
                    ? '新しい仮説を生成してください。' 
                    : '検索条件を変更してみてください。'
                  }
                </p>
                {hypotheses.length === 0 && (
                  <Button 
                    onClick={generateNewHypotheses}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新しい仮説を生成
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-indigo-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Powered by AI & Advanced Analytics
                </span>
              </div>
              <p className="text-sm text-indigo-700 max-w-2xl mx-auto">
                このシステムは最新の経済データと学術論文を分析し、
                革新的な研究仮説を自動生成します。高度なフィルタリング機能と
                詳細な分析により、研究者の創造的な発見をサポートします。
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default App

