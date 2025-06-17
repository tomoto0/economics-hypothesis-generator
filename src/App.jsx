import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Brain, TrendingUp, BarChart3, Lightbulb, Clock, RefreshCw } from 'lucide-react'
import './App.css'

function App() {
  const [hypotheses, setHypotheses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  // サンプルデータ（実際のGemini API結果に置き換える）
  const sampleHypotheses = [
    {
      id: 1,
      title: "デジタル通貨普及と消費者行動の変化",
      description: "中央銀行デジタル通貨（CBDC）の導入が消費者の支払い行動と貯蓄パターンに与える影響について、行動経済学の観点から分析する必要がある。",
      category: "金融政策",
      confidence: 85,
      researchMethods: ["実験経済学", "フィールド調査", "データマイニング"],
      keyFactors: ["プライバシー懸念", "利便性", "金融包摂"],
      generatedAt: "2025-06-17T10:30:00Z"
    },
    {
      id: 2,
      title: "リモートワークと地域経済格差",
      description: "コロナ後のリモートワーク普及により、都市部から地方への人口移動が地域間の経済格差に与える長期的影響を分析する。",
      category: "労働経済学",
      confidence: 78,
      researchMethods: ["パネルデータ分析", "空間経済学モデル", "質的調査"],
      keyFactors: ["住宅価格", "インフラ整備", "教育機会"],
      generatedAt: "2025-06-17T09:15:00Z"
    },
    {
      id: 3,
      title: "ESG投資と企業パフォーマンス",
      description: "環境・社会・ガバナンス（ESG）要因を重視した投資戦略が、長期的な企業価値と株主リターンに与える因果関係を検証する。",
      category: "金融経済学",
      confidence: 92,
      researchMethods: ["イベントスタディ", "回帰分析", "機械学習"],
      keyFactors: ["ESGスコア", "業界特性", "規制環境"],
      generatedAt: "2025-06-17T08:45:00Z"
    }
  ]

  useEffect(() => {
    // 初期データの読み込み
    loadHypotheses()
  }, [])

  const loadHypotheses = async () => {
    setIsLoading(true)
    // 実際の実装では、GitHub Actionsで生成されたデータを読み込む
    setTimeout(() => {
      setHypotheses(sampleHypotheses)
      setLastUpdated(new Date())
      setIsLoading(false)
    }, 1500)
  }

  const refreshHypotheses = () => {
    loadHypotheses()
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
    if (confidence >= 90) return 'bg-green-100 text-green-800'
    if (confidence >= 75) return 'bg-blue-100 text-blue-800'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">経済学仮説生成システム</h1>
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
              <Button onClick={refreshHypotheses} disabled={isLoading} variant="outline">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">生成された仮説</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hypotheses.length}</div>
              <p className="text-xs text-muted-foreground">今日の分析結果</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均信頼度</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hypotheses.length > 0 
                  ? Math.round(hypotheses.reduce((sum, h) => sum + h.confidence, 0) / hypotheses.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">AI分析による評価</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">研究分野</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(hypotheses.map(h => h.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">カバーされた領域</p>
            </CardContent>
          </Card>
        </div>

        {/* 仮説一覧 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">生成された研究仮説</h2>
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                分析中...
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
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
              {hypotheses.map((hypothesis) => (
                <Card key={hypothesis.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{hypothesis.title}</CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">{hypothesis.category}</Badge>
                          <Badge className={getConfidenceColor(hypothesis.confidence)}>
                            信頼度 {hypothesis.confidence}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {hypothesis.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">推奨研究手法</h4>
                        <div className="flex flex-wrap gap-1">
                          {hypothesis.researchMethods.map((method, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">重要要因</h4>
                        <div className="flex flex-wrap gap-1">
                          {hypothesis.keyFactors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 pt-2">
                        生成日時: {formatDate(hypothesis.generatedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-indigo-600" />
                <span className="text-lg font-semibold text-indigo-900">Powered by Gemini AI</span>
              </div>
              <p className="text-sm text-indigo-700 max-w-2xl mx-auto">
                このシステムは最新の経済データと学術論文を分析し、
                革新的な研究仮説を自動生成します。GitHub Actionsにより定期的に更新され、
                常に最新の経済動向を反映した研究アイデアを提供します。
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default App

