"""
Utility functions for MeTTa Knowledge Graph operations
"""

from typing import Dict, Any, List


def format_risk_level(risk_score: float) -> str:
    """Format risk score into human-readable risk level."""
    if risk_score <= 20:
        return "Very Low Risk 🟢"
    elif risk_score <= 35:
        return "Low Risk 🟢"
    elif risk_score <= 50:
        return "Moderate Risk 🟡"
    elif risk_score <= 70:
        return "High Risk 🟠"
    else:
        return "Very High Risk 🔴"


def interpret_market_condition(fear_greed_index: int) -> Dict[str, str]:
    """Interpret Fear & Greed Index into market condition and advice."""
    if fear_greed_index <= 25:
        return {
            "condition": "Extreme Fear",
            "emoji": "😱",
            "advice": "Excellent buying opportunity - market panic creates value",
            "action": "BUY",
            "urgency": "high"
        }
    elif fear_greed_index <= 45:
        return {
            "condition": "Fear", 
            "emoji": "😟",
            "advice": "Good buying opportunity - market pessimism may create value",
            "action": "BUY",
            "urgency": "medium"
        }
    elif fear_greed_index <= 55:
        return {
            "condition": "Neutral",
            "emoji": "😐", 
            "advice": "Balanced market conditions - proceed with normal strategy",
            "action": "HOLD",
            "urgency": "low"
        }
    elif fear_greed_index <= 75:
        return {
            "condition": "Greed",
            "emoji": "😊",
            "advice": "Cautious optimism - monitor for overvaluation signs",
            "action": "HOLD",
            "urgency": "low"
        }
    else:
        return {
            "condition": "Extreme Greed",
            "emoji": "🤑",
            "advice": "Exercise caution - market euphoria suggests overvaluation",
            "action": "SELL",
            "urgency": "high"
        }


def format_correlation_strength(correlation: float) -> Dict[str, str]:
    """Format correlation coefficient into human-readable description."""
    abs_corr = abs(correlation)
    direction = "positive" if correlation >= 0 else "negative"
    
    if abs_corr >= 0.9:
        strength = "very strong"
        emoji = "🔗🔗"
    elif abs_corr >= 0.7:
        strength = "strong"
        emoji = "🔗"
    elif abs_corr >= 0.5:
        strength = "moderate"
        emoji = "🔸"
    elif abs_corr >= 0.3:
        strength = "weak"
        emoji = "▫️"
    else:
        strength = "very weak"
        emoji = "⬜"
    
    return {
        "strength": strength,
        "direction": direction,
        "emoji": emoji,
        "description": f"{strength} {direction} correlation",
        "interpretation": _get_correlation_interpretation(correlation)
    }


def _get_correlation_interpretation(correlation: float) -> str:
    """Get practical interpretation of correlation value."""
    abs_corr = abs(correlation)
    
    if abs_corr >= 0.9:
        if correlation > 0:
            return "Assets move almost identically - high diversification risk"
        else:
            return "Assets move in opposite directions - excellent hedge"
    elif abs_corr >= 0.7:
        if correlation > 0:
            return "Assets tend to move together - moderate diversification benefit"
        else:
            return "Assets tend to move oppositely - good hedge potential"
    elif abs_corr >= 0.5:
        if correlation > 0:
            return "Some tendency to move together - fair diversification"
        else:
            return "Some tendency to move oppositely - decent hedge"
    elif abs_corr >= 0.3:
        return "Weak relationship - good diversification benefit"
    else:
        return "Independent movements - excellent diversification"


def format_portfolio_allocation(allocation: Dict[str, float], investment_amount: float = None) -> List[Dict[str, Any]]:
    """Format portfolio allocation into structured data with calculations."""
    formatted_allocation = []
    
    for symbol, percentage in allocation.items():
        allocation_data = {
            'symbol': symbol,
            'percentage': percentage,
            'formatted_percentage': f"{percentage}%"
        }
        
        if investment_amount:
            amount = (percentage / 100) * investment_amount
            allocation_data['amount'] = amount
            allocation_data['formatted_amount'] = f"${amount:,.2f}"
        
        formatted_allocation.append(allocation_data)
    
    # Sort by percentage (highest first)
    formatted_allocation.sort(key=lambda x: x['percentage'], reverse=True)
    
    return formatted_allocation


def get_volatility_emoji(volatility_level: str) -> str:
    """Get emoji representation for volatility level."""
    volatility_emojis = {
        'low': '🟢',
        'moderate': '🟡', 
        'high': '🟠',
        'very_high': '🔴',
        'extreme': '🔴💥'
    }
    return volatility_emojis.get(volatility_level.lower(), '❓')


def format_market_insights(insights: List[str]) -> str:
    """Format market insights into readable text."""
    if not insights:
        return "No specific market insights available for current conditions."
    
    formatted = "📊 Market Insights:\n"
    for i, insight in enumerate(insights, 1):
        formatted += f"{i}. {insight}\n"
    
    return formatted


def calculate_portfolio_diversification_score(portfolio: Dict[str, float]) -> Dict[str, Any]:
    """Calculate diversification score and provide recommendations."""
    if not portfolio:
        return {"score": 0, "level": "poor", "recommendations": []}
    
    # Calculate Herfindahl-Hirschman Index for concentration
    hhi = sum((allocation/100)**2 for allocation in portfolio.values())
    
    # Convert to diversification score (0-100, higher is better)
    max_hhi = 1.0  # Perfect concentration
    diversification_score = (1 - hhi) * 100
    
    # Categorize diversification level
    if diversification_score >= 80:
        level = "excellent"
        emoji = "🟢"
    elif diversification_score >= 60:
        level = "good"
        emoji = "🟡"
    elif diversification_score >= 40:
        level = "fair"
        emoji = "🟠"
    else:
        level = "poor"
        emoji = "🔴"
    
    # Generate recommendations
    recommendations = []
    
    # Check for over-concentration
    max_allocation = max(portfolio.values())
    if max_allocation > 50:
        recommendations.append(f"Reduce concentration - largest holding is {max_allocation}%")
    
    # Check number of holdings
    num_holdings = len(portfolio)
    if num_holdings < 3:
        recommendations.append("Consider adding more assets for better diversification")
    elif num_holdings > 10:
        recommendations.append("Portfolio might be over-diversified - consider consolidation")
    
    return {
        "score": round(diversification_score, 1),
        "level": level,
        "emoji": emoji,
        "hhi": round(hhi, 3),
        "recommendations": recommendations
    }