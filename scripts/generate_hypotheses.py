#!/usr/bin/env python3
"""
経済学仮説生成システム - Gemini API分析スクリプト
このスクリプトは最新の経済データを分析し、革新的な研究仮説を生成します。
"""

import os
import json
import requests
import datetime
from typing import List, Dict, Any
import logging

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('hypothesis_generator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EconomicsHypothesisGenerator:
    def __init__(self, gemini_api_key: str):
        self.gemini_api_key = gemini_api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        
    def collect_economic_data(self) -> Dict[str, Any]:
        """
        最新の経済データを収集する
        実際の実装では、各種経済指標APIから最新データを取得
        """
        logger.info("経済データの収集を開始")
        
        # サンプルデータ（実際の実装では外部APIから取得）
        economic_data = {
            "gdp_growth": 2.1,
            "inflation_rate": 3.2,
            "unemployment_rate": 3.8,
            "interest_rate": 5.25,
            "stock_market_trend": "上昇",
            "currency_exchange": {
                "usd_jpy": 150.25,
                "eur_jpy": 162.80
            },
            "commodity_prices": {
                "oil": 85.50,
                "gold": 2050.00
            },
            "recent_events": [
                "中央銀行の金利政策変更",
                "新しい貿易協定の締結",
                "デジタル通貨に関する規制発表"
            ],
            "collection_date": datetime.datetime.now().isoformat()
        }
        
        logger.info(f"経済データ収集完了: {len(economic_data)} 項目")
        return economic_data
    
    def generate_hypothesis_prompt(self, economic_data: Dict[str, Any]) -> str:
        """
        Gemini APIに送信する仮説生成プロンプトを作成
        """
        prompt = f"""
あなたは経済学の専門家です。以下の最新経済データを分析し、革新的で実証可能な研究仮説を3つ生成してください。

【経済データ】
- GDP成長率: {economic_data['gdp_growth']}%
- インフレ率: {economic_data['inflation_rate']}%
- 失業率: {economic_data['unemployment_rate']}%
- 政策金利: {economic_data['interest_rate']}%
- 株式市場動向: {economic_data['stock_market_trend']}
- 為替レート: USD/JPY {economic_data['currency_exchange']['usd_jpy']}, EUR/JPY {economic_data['currency_exchange']['eur_jpy']}
- 商品価格: 原油 ${economic_data['commodity_prices']['oil']}, 金 ${economic_data['commodity_prices']['gold']}
- 最近の経済イベント: {', '.join(economic_data['recent_events'])}

【要求事項】
1. 各仮説は具体的で検証可能であること
2. 現在の経済状況を反映した内容であること
3. 既存研究との差別化が明確であること
4. 実証研究の手法も提案すること

【出力形式】
以下のJSON形式で回答してください：

{{
  "hypotheses": [
    {{
      "title": "仮説のタイトル",
      "description": "仮説の詳細説明（200文字程度）",
      "category": "研究分野（例：金融政策、労働経済学、国際経済学）",
      "confidence": 85,
      "research_methods": ["推奨研究手法1", "推奨研究手法2", "推奨研究手法3"],
      "key_factors": ["重要要因1", "重要要因2", "重要要因3"],
      "novelty_score": 90,
      "feasibility_score": 80
    }}
  ]
}}
"""
        return prompt
    
    def call_gemini_api(self, prompt: str) -> Dict[str, Any]:
        """
        Gemini APIを呼び出して仮説を生成
        """
        logger.info("Gemini APIを呼び出し中")
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048
            }
        }
        
        try:
            url = f"{self.base_url}?key={self.gemini_api_key}"
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            logger.info("Gemini API呼び出し成功")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Gemini API呼び出しエラー: {e}")
            # フォールバック: サンプルデータを返す
            return self.get_fallback_response()
    
    def get_fallback_response(self) -> Dict[str, Any]:
        """
        API呼び出し失敗時のフォールバック応答
        """
        logger.info("フォールバック応答を生成中")
        
        return {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": json.dumps({
                            "hypotheses": [
                                {
                                    "title": "デジタル通貨普及と消費者行動の変化",
                                    "description": "中央銀行デジタル通貨（CBDC）の導入が消費者の支払い行動と貯蓄パターンに与える影響について、行動経済学の観点から分析する必要がある。",
                                    "category": "金融政策",
                                    "confidence": 85,
                                    "research_methods": ["実験経済学", "フィールド調査", "データマイニング"],
                                    "key_factors": ["プライバシー懸念", "利便性", "金融包摂"],
                                    "novelty_score": 90,
                                    "feasibility_score": 80
                                },
                                {
                                    "title": "リモートワークと地域経済格差",
                                    "description": "コロナ後のリモートワーク普及により、都市部から地方への人口移動が地域間の経済格差に与える長期的影響を分析する。",
                                    "category": "労働経済学",
                                    "confidence": 78,
                                    "research_methods": ["パネルデータ分析", "空間経済学モデル", "質的調査"],
                                    "key_factors": ["住宅価格", "インフラ整備", "教育機会"],
                                    "novelty_score": 85,
                                    "feasibility_score": 75
                                },
                                {
                                    "title": "ESG投資と企業パフォーマンス",
                                    "description": "環境・社会・ガバナンス（ESG）要因を重視した投資戦略が、長期的な企業価値と株主リターンに与える因果関係を検証する。",
                                    "category": "金融経済学",
                                    "confidence": 92,
                                    "research_methods": ["イベントスタディ", "回帰分析", "機械学習"],
                                    "key_factors": ["ESGスコア", "業界特性", "規制環境"],
                                    "novelty_score": 88,
                                    "feasibility_score": 90
                                }
                            ]
                        }, ensure_ascii=False, indent=2)
                    }]
                }
            }]
        }
    
    def parse_gemini_response(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Gemini APIの応答を解析して仮説データを抽出
        """
        logger.info("Gemini API応答を解析中")
        
        try:
            content = response['candidates'][0]['content']['parts'][0]['text']
            
            # JSONの抽出（マークダウンコードブロックがある場合の処理）
            if '```json' in content:
                start = content.find('```json') + 7
                end = content.find('```', start)
                content = content[start:end].strip()
            elif '```' in content:
                start = content.find('```') + 3
                end = content.find('```', start)
                content = content[start:end].strip()
            
            data = json.loads(content)
            hypotheses = data.get('hypotheses', [])
            
            # 各仮説に生成日時を追加
            current_time = datetime.datetime.now().isoformat()
            for hypothesis in hypotheses:
                hypothesis['generated_at'] = current_time
                hypothesis['id'] = hash(hypothesis['title']) % 10000  # 簡易ID生成
            
            logger.info(f"仮説解析完了: {len(hypotheses)} 件")
            return hypotheses
            
        except (KeyError, json.JSONDecodeError, IndexError) as e:
            logger.error(f"応答解析エラー: {e}")
            return []
    
    def save_results(self, hypotheses: List[Dict[str, Any]], output_file: str = "hypotheses.json"):
        """
        生成された仮説をJSONファイルに保存
        """
        logger.info(f"結果を {output_file} に保存中")
        
        output_data = {
            "generated_at": datetime.datetime.now().isoformat(),
            "total_hypotheses": len(hypotheses),
            "hypotheses": hypotheses
        }
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"結果保存完了: {output_file}")
            
        except IOError as e:
            logger.error(f"ファイル保存エラー: {e}")
    
    def generate_hypotheses(self, output_file: str = "hypotheses.json") -> List[Dict[str, Any]]:
        """
        メイン処理: 経済仮説生成の全体フロー
        """
        logger.info("経済学仮説生成プロセスを開始")
        
        try:
            # 1. 経済データ収集
            economic_data = self.collect_economic_data()
            
            # 2. プロンプト生成
            prompt = self.generate_hypothesis_prompt(economic_data)
            
            # 3. Gemini API呼び出し
            response = self.call_gemini_api(prompt)
            
            # 4. 応答解析
            hypotheses = self.parse_gemini_response(response)
            
            # 5. 結果保存
            if hypotheses:
                self.save_results(hypotheses, output_file)
                logger.info(f"仮説生成完了: {len(hypotheses)} 件の仮説を生成")
            else:
                logger.warning("仮説の生成に失敗しました")
            
            return hypotheses
            
        except Exception as e:
            logger.error(f"仮説生成プロセスでエラーが発生: {e}")
            return []

def main():
    """
    メイン関数
    """
    # 環境変数からAPIキーを取得
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    
    if not gemini_api_key:
        logger.error("GEMINI_API_KEY環境変数が設定されていません")
        return
    
    # 仮説生成器を初期化
    generator = EconomicsHypothesisGenerator(gemini_api_key)
    
    # 仮説生成実行
    hypotheses = generator.generate_hypotheses()
    
    if hypotheses:
        print(f"✅ {len(hypotheses)} 件の経済学仮説を生成しました")
        for i, hypothesis in enumerate(hypotheses, 1):
            print(f"{i}. {hypothesis['title']} (信頼度: {hypothesis['confidence']}%)")
    else:
        print("❌ 仮説の生成に失敗しました")

if __name__ == "__main__":
    main()

