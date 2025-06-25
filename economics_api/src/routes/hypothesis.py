from flask import Blueprint, jsonify, request
from src.models.hypothesis import db, Hypothesis
import json
import requests
import os
from datetime import datetime
import logging

hypothesis_bp = Blueprint('hypothesis', __name__)

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@hypothesis_bp.route('/hypotheses', methods=['GET'])
def get_hypotheses():
    """仮説一覧を取得"""
    try:
        # クエリパラメータの取得
        category = request.args.get('category')
        min_confidence = request.args.get('min_confidence', type=int)
        search = request.args.get('search')
        
        # ベースクエリ
        query = Hypothesis.query
        
        # フィルタリング
        if category:
            query = query.filter(Hypothesis.category == category)
        if min_confidence:
            query = query.filter(Hypothesis.confidence >= min_confidence)
        if search:
            query = query.filter(
                db.or_(
                    Hypothesis.title.contains(search),
                    Hypothesis.description.contains(search)
                )
            )
        
        # 結果取得（最新順）
        hypotheses = query.order_by(Hypothesis.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [h.to_dict() for h in hypotheses],
            'total': len(hypotheses)
        })
        
    except Exception as e:
        logger.error(f"仮説取得エラー: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@hypothesis_bp.route('/hypotheses/<int:hypothesis_id>', methods=['GET'])
def get_hypothesis(hypothesis_id):
    """特定の仮説を取得"""
    try:
        hypothesis = Hypothesis.query.get_or_404(hypothesis_id)
        return jsonify({
            'success': True,
            'data': hypothesis.to_dict()
        })
    except Exception as e:
        logger.error(f"仮説取得エラー: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

import google.generativeai as genai

# Gemini APIキーを設定
genai.configure(api_key="AIzaSyCD-e7WwATPRFUHMC0Z2wDfwo39F_UijY8")

# モデルを初期化
model = genai.GenerativeModel("gemini-2.5-flash")

@hypothesis_bp.route("/hypotheses/generate", methods=["POST"])
def generate_hypotheses():
    """新しい仮説を生成"""
    try:
        # Gemini APIを使用して仮説を生成
        prompt = "経済学に関する新しい研究仮説を5つ生成してください。各仮説はタイトル、説明、カテゴリ、信頼度（0-100）、推奨研究手法（リスト）、重要要因（リスト）、新規性スコア（0-100）、実現可能性スコア（0-100）を含むJSON形式で出力してください。"
        response = model.generate_content(prompt)
        generated_text = response.text
        
        # JSON形式にパース
        # Gemini APIの出力が直接JSONではない場合があるため、整形を試みる
        try:
            # バッククォートとjsonキーワードを削除
            if generated_text.startswith("```json") and generated_text.endswith("```"):
                generated_text = generated_text[7:-3].strip()
            generated_hypotheses = json.loads(generated_text)
        except json.JSONDecodeError:
            logger.error(f"Gemini APIからの応答がJSON形式ではありません: {generated_text}")
            return jsonify({"success": False, "error": "Gemini APIからの応答が不正な形式です"}), 500

        # データベースに保存
        saved_hypotheses = []
        for hyp_data in generated_hypotheses:
            hypothesis = Hypothesis(
                title=hyp_data["title"],
                description=hyp_data["description"],
                category=hyp_data["category"],
                confidence=hyp_data["confidence"],
                research_methods=json.dumps(hyp_data["research_methods"], ensure_ascii=False),
                key_factors=json.dumps(hyp_data["key_factors"], ensure_ascii=False),
                novelty_score=hyp_data["novelty_score"],
                feasibility_score=hyp_data["feasibility_score"],
                generated_at=datetime.utcnow()
            )
            db.session.add(hypothesis)
            db.session.commit()
            saved_hypotheses.append(hypothesis.to_dict())

        logger.info(f"新しい仮説を生成しました: {len(saved_hypotheses)} 件")

        return jsonify({
            "success": True,
            "data": saved_hypotheses,
            "message": f"{len(saved_hypotheses)} 件の新しい仮説を生成しました"
        })

    except Exception as e:
        logger.error(f"仮説生成エラー: {e}")
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@hypothesis_bp.route('/hypotheses/stats', methods=['GET'])
def get_hypothesis_stats():
    """仮説の統計情報を取得"""
    try:
        total_count = Hypothesis.query.count()
        
        if total_count == 0:
            return jsonify({
                'success': True,
                'data': {
                    'totalHypotheses': 0,
                    'averageConfidence': 0,
                    'categoriesCount': 0,
                    'categories': []
                }
            })
        
        # 平均信頼度
        avg_confidence = db.session.query(db.func.avg(Hypothesis.confidence)).scalar()
        
        # カテゴリ別統計
        categories = db.session.query(
            Hypothesis.category,
            db.func.count(Hypothesis.id).label('count')
        ).group_by(Hypothesis.category).all()
        
        return jsonify({
            'success': True,
            'data': {
                'totalHypotheses': total_count,
                'averageConfidence': round(avg_confidence, 1) if avg_confidence else 0,
                'categoriesCount': len(categories),
                'categories': [{'name': cat[0], 'count': cat[1]} for cat in categories]
            }
        })
        
    except Exception as e:
        logger.error(f"統計情報取得エラー: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@hypothesis_bp.route('/hypotheses/<int:hypothesis_id>', methods=['DELETE'])
def delete_hypothesis(hypothesis_id):
    """仮説を削除"""
    try:
        hypothesis = Hypothesis.query.get_or_404(hypothesis_id)
        db.session.delete(hypothesis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '仮説を削除しました'
        })
        
    except Exception as e:
        logger.error(f"仮説削除エラー: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@hypothesis_bp.route('/hypotheses/export', methods=['GET'])
def export_hypotheses():
    """仮説をCSV形式でエクスポート"""
    try:
        import csv
        import io
        from flask import make_response
        
        hypotheses = Hypothesis.query.order_by(Hypothesis.created_at.desc()).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # ヘッダー
        writer.writerow([
            'ID', 'タイトル', '説明', 'カテゴリ', '信頼度',
            '研究手法', '重要要因', '新規性スコア', '実現可能性スコア',
            '生成日時', '作成日時'
        ])
        
        # データ
        for h in hypotheses:
            writer.writerow([
                h.id, h.title, h.description, h.category, h.confidence,
                h.research_methods, h.key_factors, h.novelty_score,
                h.feasibility_score, h.generated_at, h.created_at
            ])
        
        output.seek(0)
        
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv; charset=utf-8'
        response.headers['Content-Disposition'] = 'attachment; filename=hypotheses.csv'
        
        return response
        
    except Exception as e:
        logger.error(f"エクスポートエラー: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

