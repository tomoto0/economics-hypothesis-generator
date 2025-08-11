#!/usr/bin/env python3
"""
研究仮説生成スクリプト
GitHub Actionsとフロントエンドの「更新」ボタンから呼び出される
"""

import google.generativeai as genai
import json
import os
import sys
from datetime import datetime

def generate_hypotheses(api_key):
    """Gemini APIを使用して新しい仮説を生成"""
    try:
        # Gemini APIキーを設定
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')

        # 新しい仮説を生成
        prompt = '''
        経済学に関する新しい研究仮説を8つ生成してください。
        各仮説は以下のJSON形式で出力してください：

        {
          "total_hypotheses": 8,
          "generated_at": "現在のISO形式の日時",
          "hypotheses": [
            {
              "id": 1,
              "title": "仮説のタイトル",
              "description": "詳細な説明（200-300文字）",
              "category": "カテゴリ（金融政策、マクロ経済学、国際経済学、労働経済学、環境経済学、デジタル経済学、金融市場、エネルギー経済学のいずれか）",
              "confidence": 70-95の整数,
              "research_methods": ["研究手法1", "研究手法2", "研究手法3", "研究手法4"],
              "key_factors": ["重要要因1", "重要要因2", "重要要因3", "重要要因4"],
              "data_sources_used": ["FRED", "World Bank", "Yahoo Finance", "CoinGecko"],
              "policy_implications": ["政策含意1", "政策含意2"],
              "novelty_score": 70-95の整数,
              "feasibility_score": 65-95の整数,
              "expected_impact": "期待される影響の説明",
              "generated_at": "現在のISO形式の日時"
            }
          ]
        }

        最新の経済動向、技術革新、社会変化を反映した革新的で実現可能な仮説を生成してください。
        '''

        response = model.generate_content(prompt)
        generated_text = response.text
        
        # JSON形式を抽出
        if '```json' in generated_text:
            start = generated_text.find('```json') + 7
            end = generated_text.find('```', start)
            generated_text = generated_text[start:end].strip()
        
        # JSONをパース
        hypotheses_data = json.loads(generated_text)
        
        # 生成日時を更新
        current_time = datetime.utcnow().isoformat() + 'Z'
        hypotheses_data['generated_at'] = current_time
        
        for i, hyp in enumerate(hypotheses_data['hypotheses']):
            hyp['id'] = i + 1
            hyp['generated_at'] = current_time
        
        return hypotheses_data
        
    except Exception as e:
        print(f'仮説生成エラー: {e}', file=sys.stderr)
        return None

def save_hypotheses(hypotheses_data, output_path='public/data/hypotheses.json'):
    """生成された仮説をJSONファイルに保存"""
    try:
        # ディレクトリが存在しない場合は作成
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(hypotheses_data, f, ensure_ascii=False, indent=2)
        
        print(f'新しい仮説を {output_path} に保存しました')
        return True
        
    except Exception as e:
        print(f'ファイル保存エラー: {e}', file=sys.stderr)
        return False

def main():
    """メイン関数"""
    # 環境変数からAPIキーを取得
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('VITE_GEMINI_API_KEY')
    
    if not api_key:
        print('エラー: GEMINI_API_KEYまたはVITE_GEMINI_API_KEYが設定されていません', file=sys.stderr)
        sys.exit(1)
    
    # 仮説を生成
    print('新しい研究仮説を生成中...')
    hypotheses_data = generate_hypotheses(api_key)
    
    if hypotheses_data is None:
        print('仮説生成に失敗しました', file=sys.stderr)
        sys.exit(1)
    
    # ファイルに保存
    if save_hypotheses(hypotheses_data):
        print(f'{hypotheses_data["total_hypotheses"]} 件の新しい仮説を生成しました')
        print(f'生成日時: {hypotheses_data["generated_at"]}')
    else:
        print('ファイル保存に失敗しました', file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

